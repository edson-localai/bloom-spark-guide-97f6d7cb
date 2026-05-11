'use server';

import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { AppError, handleServerError } from './errors';

async function requireAdminOrSupervisor(supabase: any, userId: string) {
  try {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    const list = (roles || []).map((r: any) => r.role);
    if (!list.includes('admin') && !list.includes('supervisor')) {
      throw AppError.forbidden('Você precisa ser administrador ou supervisor para realizar esta ação.');
    }
    return list;
  } catch (err) {
    handleServerError(err);
  }
}

function publicWebhookUrl(provider: 'evolution' | 'wapi'): string {
  const projectId = process.env.LOVABLE_PROJECT_ID || '1437f3b0-fe7f-4f6b-8c41-2858d825f265';
  const path = provider === 'wapi' ? '/api/public/wapi/webhook' : '/api/public/whatsapp/webhook';
  return `https://project--${projectId}.lovable.app${path}`;
}

async function getInstance(name: string) {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data, error } = await supabaseAdmin
    .from('whatsapp_instances')
    .select('*')
    .eq('name', name)
    .single();
  if (error || !data) throw AppError.validation('Instância não encontrada');
  return data as any;
}

function wapiCredsFrom(inst: any): { instanceId: string; token: string } {
  const data = inst?.instance_data || {};
  const instanceId = data?.wapi?.instance_id || data?.wapi_instance_id || inst.name;
  const token = inst.instance_key || data?.wapi?.token;
  if (!instanceId || !token) {
    throw AppError.validation('Credenciais W-API ausentes (instance_id e token).');
  }
  return { instanceId, token };
}

// --- Create / connect a new instance ---
export const createWhatsAppInstance = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({
      provider: z.enum(['evolution', 'wapi']).default('evolution'),
      name: z.string().min(2).max(60).regex(/^[a-zA-Z0-9_-]+$/, 'Use letras, números, _ ou -'),
      displayName: z.string().min(1).max(100),
      apiKey: z.string().optional(),
      // W-API only:
      wapiInstanceId: z.string().min(1).optional(),
      wapiToken: z.string().min(1).optional(),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await requireAdminOrSupervisor(context.supabase, context.userId);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

    try {
      if (data.provider === 'wapi') {
        if (!data.wapiInstanceId || !data.wapiToken) {
          throw AppError.validation('Para W-API informe instance_id e token.');
        }
        // Não buscar QR durante a criação para evitar timeout do worker.
        // O frontend chama getWhatsAppQr() logo em seguida.
        const qr: string | null = null;
        const status: 'connected' | 'disconnected' | 'connecting' = 'connecting';
        const { data: row, error } = await supabaseAdmin
          .from('whatsapp_instances')
          .insert({
            provider: 'wapi',
            name: data.name,
            display_name: data.displayName,
            status,
            qr_code: qr,
            instance_key: data.wapiToken,
            webhook_url: publicWebhookUrl('wapi'),
            instance_data: { wapi: { instance_id: data.wapiInstanceId } } as any,
          })
          .select()
          .single();
        if (error) throw new Error(error.message);
        return { instance: row, qr };
      }

      // evolution (default)
      const { WhatsAppService } = await import('@/services/WhatsAppService');
      const service = WhatsAppService.getInstance();
      return await service.createInstance({
        name: data.name,
        displayName: data.displayName,
        apiKey: data.apiKey,
        webhookUrl: publicWebhookUrl('evolution'),
      });
    } catch (err) {
      handleServerError(err);
    }
  });

// --- Refresh QR code / connection ---
export const getWhatsAppQrCode = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ name: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    await requireAdminOrSupervisor(context.supabase, context.userId);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const inst = await getInstance(data.name);

    if (inst.provider === 'wapi') {
      const { wapiGetQr } = await import('./wapi.server');
      const { qr, connected } = await wapiGetQr(wapiCredsFrom(inst));
      await supabaseAdmin
        .from('whatsapp_instances')
        .update({
          qr_code: qr,
          status: connected ? 'connected' : 'connecting',
          updated_at: new Date().toISOString(),
        })
        .eq('name', data.name);
      return { qr, connected };
    }

    const { evoFetch } = await import('./whatsapp.server');
    const res = await evoFetch(`/instance/connect/${encodeURIComponent(data.name)}`);
    const qr = res?.base64 || res?.qrcode?.base64 || res?.code || null;
    await supabaseAdmin
      .from('whatsapp_instances')
      .update({ qr_code: qr, status: 'connecting', updated_at: new Date().toISOString() })
      .eq('name', data.name);
    return { qr };
  });

// --- Sync status from API ---
export const syncWhatsAppInstance = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ name: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    await requireAdminOrSupervisor(context.supabase, context.userId);
    try {
      const inst = await getInstance(data.name);
      if (inst.provider === 'wapi') {
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const { wapiGetQr } = await import('./wapi.server');
        const { qr, connected } = await wapiGetQr(wapiCredsFrom(inst));
        const status = connected ? 'connected' : (qr ? 'connecting' : 'disconnected');
        await supabaseAdmin
          .from('whatsapp_instances')
          .update({
            status,
            qr_code: connected ? null : qr,
            updated_at: new Date().toISOString(),
            last_seen: new Date().toISOString(),
          })
          .eq('name', data.name);
        return { status };
      }
      const { WhatsAppService } = await import('@/services/WhatsAppService');
      return await WhatsAppService.getInstance().syncInstance(data.name);
    } catch (err) {
      handleServerError(err);
    }
  });

// --- Restart ---
export const restartWhatsAppInstance = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ name: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    await requireAdminOrSupervisor(context.supabase, context.userId);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const inst = await getInstance(data.name);
    if (inst.provider === 'wapi') {
      // No documented restart endpoint — just refresh QR.
      const { wapiGetQr } = await import('./wapi.server');
      const { qr } = await wapiGetQr(wapiCredsFrom(inst));
      await supabaseAdmin
        .from('whatsapp_instances')
        .update({ qr_code: qr, status: 'connecting', updated_at: new Date().toISOString() })
        .eq('name', data.name);
      return { ok: true };
    }
    const { evoFetch } = await import('./whatsapp.server');
    await evoFetch(`/instance/restart/${encodeURIComponent(data.name)}`, { method: 'POST' });
    await supabaseAdmin
      .from('whatsapp_instances')
      .update({ status: 'connecting', updated_at: new Date().toISOString() })
      .eq('name', data.name);
    return { ok: true };
  });

// --- Disconnect (logout) ---
export const disconnectWhatsAppInstance = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ name: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    await requireAdminOrSupervisor(context.supabase, context.userId);
    try {
      const inst = await getInstance(data.name);
      if (inst.provider === 'wapi') {
        // W-API não expõe logout público — apenas marcar como desconectado localmente.
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        await supabaseAdmin
          .from('whatsapp_instances')
          .update({ status: 'disconnected', qr_code: null, phone_number: null, updated_at: new Date().toISOString() })
          .eq('name', data.name);
        return { ok: true };
      }
      const { WhatsAppService } = await import('@/services/WhatsAppService');
      return await WhatsAppService.getInstance().logoutInstance(data.name);
    } catch (err) {
      handleServerError(err);
    }
  });

// --- Delete instance entirely ---
export const deleteWhatsAppInstance = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;

    // Best-effort: cleanup remoto (apenas Evolution; W-API gerencia via painel).
    try {
      const { data: inst } = await sb
        .from('whatsapp_instances')
        .select('provider')
        .eq('name', data.name)
        .maybeSingle();
      if (!inst || inst.provider === 'evolution') {
        const { data: settings } = await sb
          .from('app_settings')
          .select('key, value')
          .in('key', ['whatsapp_api_url', 'whatsapp_api_key']);
        const map = Object.fromEntries((settings || []).map((r: any) => [r.key, r.value]));
        const url = (map.whatsapp_api_url || '').replace(/\/+$/, '');
        const apiKey = map.whatsapp_api_key || '';
        if (url && apiKey && data.name) {
          await fetch(`${url}/instance/delete/${encodeURIComponent(data.name)}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', apikey: apiKey },
          }).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('[deleteWhatsAppInstance] external cleanup skipped:', (e as any)?.message);
    }

    const { data: result, error } = await sb.rpc('delete_whatsapp_instance', {
      _instance_id: data.id ?? undefined,
      _instance_name: data.name ?? undefined,
    });

    if (error) {
      console.error('[deleteWhatsAppInstance] RPC failed:', error);
      throw AppError.internal(`Falha ao excluir instância: ${error.message}`);
    }
    return result ?? { ok: true };
  });

// --- Send a text message via WhatsApp (called from the chat) ---
export const sendWhatsAppMessage = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({
      conversationId: z.string().uuid(),
      content: z.string().min(1).max(10000),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: roles } = await context.supabase.from('user_roles').select('role').eq('user_id', context.userId);
    if (!roles || roles.length === 0) throw new Error('Forbidden');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { jidToPhone } = await import('./whatsapp.server');

    const { data: conv, error: convErr } = await supabaseAdmin
      .from('conversations')
      .select('id, whatsapp_chat_id, instance_id')
      .eq('id', data.conversationId)
      .single();

    if (convErr || !conv) throw new Error('Conversation not found');
    if (!conv.whatsapp_chat_id) return { skipped: true, reason: 'no_chat_id' };

    let inst: any = null;
    if (conv.instance_id) {
      const { data: i } = await supabaseAdmin.from('whatsapp_instances').select('*').eq('id', conv.instance_id).single();
      inst = i;
    }
    if (!inst) {
      const { data: any2 } = await supabaseAdmin
        .from('whatsapp_instances')
        .select('*')
        .eq('status', 'connected')
        .limit(1)
        .maybeSingle();
      inst = any2;
    }
    if (!inst) return { skipped: true, reason: 'no_instance' };

    const number = jidToPhone(conv.whatsapp_chat_id);

    try {
      if (inst.provider === 'wapi') {
        const { wapiFetch } = await import('./wapi.server');
        const res = await wapiFetch(
          `/v1/message/send-text`,
          { method: 'POST', body: JSON.stringify({ phone: number, message: data.content }) },
          wapiCredsFrom(inst),
        );
        return { ok: true, id: res?.messageId || res?.insertedId || null };
      }
      const { evoFetch } = await import('./whatsapp.server');
      const res = await evoFetch(`/message/sendText/${encodeURIComponent(inst.name)}`, {
        method: 'POST',
        body: JSON.stringify({ number, text: data.content }),
      });
      return { ok: true, id: res?.key?.id || null };
    } catch (err: any) {
      console.error('WhatsApp send failed:', err);
      return { ok: false, error: err.message };
    }
  });
