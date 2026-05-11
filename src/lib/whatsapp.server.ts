// Server-only Evolution API client helpers.
// Reads credentials from app_settings via the admin Supabase client.
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export type EvoConfig = { url: string; apiKey: string };

export async function getEvoConfig(): Promise<EvoConfig> {
  const { data, error } = await supabaseAdmin
    .from('app_settings')
    .select('key, value')
    .in('key', ['whatsapp_api_url', 'whatsapp_api_key']);

  if (error) throw new Error(`Failed to read WhatsApp settings: ${error.message}`);

  const map = Object.fromEntries((data || []).map((r: any) => [r.key, r.value]));
  const url = (map.whatsapp_api_url || '').replace(/\/+$/, '');
  const apiKey = map.whatsapp_api_key || '';

  if (!url || !apiKey) {
    throw new Error('WhatsApp API not configured. Set whatsapp_api_url and whatsapp_api_key in Configurações.');
  }
  return { url, apiKey };
}

export async function evoFetch(
  path: string,
  init: RequestInit = {},
  cfg?: EvoConfig
): Promise<any> {
  const { url, apiKey } = cfg ?? (await getEvoConfig());
  const res = await fetch(`${url}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      apikey: apiKey,
      ...(init.headers || {}),
    },
  });

  const text = await res.text();
  let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }

  if (!res.ok) {
    const msg = typeof body === 'string' ? body : (body?.message || body?.error || res.statusText);
    throw new Error(`Evolution API ${res.status}: ${Array.isArray(msg) ? msg.join('; ') : msg}`);
  }
  return body;
}

export function normalizeStatus(raw: string | undefined | null): 'connected' | 'disconnected' | 'connecting' {
  const s = (raw || '').toLowerCase();
  if (s === 'open' || s === 'connected') return 'connected';
  if (s === 'connecting' || s === 'qr' || s === 'qrcode') return 'connecting';
  return 'disconnected';
}

// Strip the "@s.whatsapp.net" / "@c.us" suffix from a JID.
export function jidToPhone(jid: string): string {
  return (jid || '').split('@')[0].split(':')[0];
}

/**
 * Procura por uma referência de lead (ex: [Ref: web-123]) no conteúdo da mensagem.
 * Se encontrar, vincula o contato placeholder ao contato real do WhatsApp.
 */
export async function linkLeadToContact(content: string, realPhone: string): Promise<string | null> {
  const refMatch = content.match(/\[Ref: (web-[a-zA-Z0-9-]+)\]/);
  if (!refMatch) return null;

  const leadId = refMatch[1];
  console.log(`[linkLeadToContact] Found lead reference: ${leadId} for phone ${realPhone}`);

  try {
    // 1. Busca o contato do lead (placeholder)
    const { data: leadContact } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .eq('phone', leadId)
      .maybeSingle();

    if (!leadContact) {
      console.warn(`[linkLeadToContact] Lead contact not found for ID: ${leadId}`);
      return null;
    }

    // 2. Busca se já existe um contato real com esse telefone
    const { data: realContact } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .eq('phone', realPhone)
      .maybeSingle();

    if (realContact) {
      // Se o contato real já existe, mesclamos as informações do lead nele
      const updates: any = {};
      if (!realContact.vehicle_brand) updates.vehicle_brand = leadContact.vehicle_brand;
      if (!realContact.vehicle_model) updates.vehicle_model = leadContact.vehicle_model;
      if (!realContact.vehicle_year) updates.vehicle_year = leadContact.vehicle_year;
      if (!realContact.city) updates.city = leadContact.city;
      if (!realContact.notes && leadContact.notes) updates.notes = leadContact.notes;
      if (!realContact.source) updates.source = leadContact.source;
      
      if (Object.keys(updates).length > 0) {
        await supabaseAdmin.from('contacts').update(updates).eq('id', realContact.id);
      }

      // Removemos o contato placeholder para não poluir a base
      await supabaseAdmin.from('contacts').delete().eq('id', leadContact.id);
      
      return realContact.id;
    } else {
      // Se não existe o contato real, transformamos o contato do lead no real
      const { data: updated } = await supabaseAdmin
        .from('contacts')
        .update({ phone: realPhone })
        .eq('id', leadContact.id)
        .select('id')
        .single();
      
      return updated?.id || leadContact.id;
    }
  } catch (err) {
    console.error('[linkLeadToContact] Error linking lead:', err);
    return null;
  }
}
