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
