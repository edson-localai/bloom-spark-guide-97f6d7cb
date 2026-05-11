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

function publicWebhookUrl(): string {
  // Stable published URL pattern recommended by Lovable for public callbacks.
  const projectId = process.env.LOVABLE_PROJECT_ID || '1437f3b0-fe7f-4f6b-8c41-2858d825f265';
  return `https://project--${projectId}.lovable.app/api/public/whatsapp/webhook`;
}

// --- Create / connect a new instance ---
export const createWhatsAppInstance = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({
      name: z.string().min(2).max(60).regex(/^[a-zA-Z0-9_-]+$/, 'Use letras, números, _ ou -'),
      displayName: z.string().min(1).max(100),
      apiKey: z.string().optional(),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await requireAdminOrSupervisor(context.supabase, context.userId);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    try {
      const { WhatsAppService } = await import('@/services/WhatsAppService');
      const service = WhatsAppService.getInstance();
      const webhookUrl = publicWebhookUrl();

      return await service.createInstance({
        name: data.name,
        displayName: data.displayName,
        apiKey: data.apiKey,
        webhookUrl
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
      const { WhatsAppService } = await import('@/services/WhatsAppService');
      return await WhatsAppService.getInstance().logoutInstance(data.name);
    } catch (err) {
      handleServerError(err);
    }
  });

// --- Delete instance entirely ---
// Uses the caller's authenticated Supabase client (admin via RLS) to avoid
// requiring SUPABASE_SERVICE_ROLE_KEY in the Worker runtime.
export const deleteWhatsAppInstance = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;

    // Best-effort: limpar a instância na Evolution API antes de remover do banco.
    // Nunca bloqueia a exclusão se a API externa falhar/estiver indisponível.
    try {
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
    } catch (e) {
      console.warn('[deleteWhatsAppInstance] Evolution cleanup skipped:', (e as any)?.message);
    }

    // Exclusão definitiva via RPC SECURITY DEFINER (verifica papel admin/supervisor,
    // limpa vínculos em conversations e remove a instância em uma única transação).
    const { data: result, error } = await sb.rpc('delete_whatsapp_instance', {
      _instance_id: data.id ?? null,
      _instance_name: data.name ?? null,
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
    // Caller must at least have a CRM role (any agent can reply).
    const { data: roles } = await context.supabase.from('user_roles').select('role').eq('user_id', context.userId);
    if (!roles || roles.length === 0) throw new Error('Forbidden');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { evoFetch, jidToPhone } = await import('./whatsapp.server');

    const { data: conv, error: convErr } = await supabaseAdmin
      .from('conversations')
      .select('id, whatsapp_chat_id, instance_id')
      .eq('id', data.conversationId)
      .single();

    if (convErr || !conv) throw new Error('Conversation not found');
    if (!conv.whatsapp_chat_id) return { skipped: true, reason: 'no_chat_id' };

    let instanceName: string | null = null;
    if (conv.instance_id) {
      const { data: inst } = await supabaseAdmin
        .from('whatsapp_instances')
        .select('name, status')
        .eq('id', conv.instance_id)
        .single();
      instanceName = inst?.name || null;
    }
    if (!instanceName) {
      const { data: anyConnected } = await supabaseAdmin
        .from('whatsapp_instances')
        .select('name')
        .eq('status', 'connected')
        .limit(1)
        .maybeSingle();
      instanceName = anyConnected?.name || null;
    }
    if (!instanceName) return { skipped: true, reason: 'no_instance' };

    const number = jidToPhone(conv.whatsapp_chat_id);

    try {
      const res = await evoFetch(`/message/sendText/${encodeURIComponent(instanceName)}`, {
        method: 'POST',
        body: JSON.stringify({ number, text: data.content }),
      });
      return { ok: true, id: res?.key?.id || null };
    } catch (err: any) {
      console.error('WhatsApp send failed:', err);
      return { ok: false, error: err.message };
    }
  });