'use server';

import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

async function requireAdminOrSupervisor(supabase: any, userId: string) {
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);
  const list = (roles || []).map((r: any) => r.role);
  if (!list.includes('admin') && !list.includes('supervisor')) {
    throw new Error('Forbidden: requires admin or supervisor role.');
  }
  return list;
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
    const { evoFetch, normalizeStatus } = await import('./whatsapp.server');

    const webhookUrl = publicWebhookUrl();

    // Create the instance in Evolution API
    const created = await evoFetch('/instance/create', {
      method: 'POST',
      body: JSON.stringify({
        instanceName: data.name,
        qrcode: true,
        token: data.apiKey,
        integration: 'WHATSAPP-BAILEYS',
        webhookUrl,
        webhookByEvents: false,
        webhookBase64: false,
        events: [
          'MESSAGES_UPSERT',
          'CONNECTION_UPDATE',
          'QRCODE_UPDATED',
        ],
      }),
    });

    const qr = created?.qrcode?.base64 || created?.qrcode?.code || null;
    const status = normalizeStatus(created?.instance?.status);

    // Persist locally
    const { data: row, error } = await supabaseAdmin
      .from('whatsapp_instances')
      .insert({
        name: data.name,
        display_name: data.displayName,
        status,
        qr_code: qr,
        instance_key: data.apiKey || created?.instance?.token || created?.hash || null,
        webhook_url: webhookUrl,
        instance_data: created as any,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { instance: row, qr };
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
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { evoFetch, normalizeStatus, jidToPhone } = await import('./whatsapp.server');

    const state = await evoFetch(`/instance/connectionState/${encodeURIComponent(data.name)}`);
    const status = normalizeStatus(state?.instance?.state || state?.state);

    let phone: string | null = null;
    try {
      const list = await evoFetch(`/instance/fetchInstances?instanceName=${encodeURIComponent(data.name)}`);
      const inst = Array.isArray(list) ? list[0] : list;
      phone = inst?.instance?.owner ? jidToPhone(inst.instance.owner) : (inst?.owner ? jidToPhone(inst.owner) : null);
    } catch {}

    const update: any = { status, updated_at: new Date().toISOString(), last_seen: new Date().toISOString() };
    if (phone) update.phone_number = phone;
    if (status === 'connected') update.qr_code = null;

    await supabaseAdmin.from('whatsapp_instances').update(update).eq('name', data.name);
    return { status, phone };
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
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { evoFetch } = await import('./whatsapp.server');
    await evoFetch(`/instance/logout/${encodeURIComponent(data.name)}`, { method: 'DELETE' });
    await supabaseAdmin
      .from('whatsapp_instances')
      .update({ status: 'disconnected', qr_code: null, phone_number: null, updated_at: new Date().toISOString() })
      .eq('name', data.name);
    return { ok: true };
  });

// --- Delete instance entirely ---
export const deleteWhatsAppInstance = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ 
    id: z.string().uuid().optional(),
    name: z.string().min(1) 
  }).parse(data))
  .handler(async ({ data, context }) => {
    await requireAdminOrSupervisor(context.supabase, context.userId);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { evoFetch } = await import('./whatsapp.server');
    
    console.log(`[WhatsAppDelete] Starting deletion for ID: ${data.id}, Name: ${data.name}`);
    
    // 1. Find the target in DB first to be sure
    const { data: target, error: findError } = await supabaseAdmin
      .from('whatsapp_instances')
      .select('id, name')
      .eq(data.id ? 'id' : 'name', data.id || data.name)
      .maybeSingle();

    if (findError) {
      console.error(`[WhatsAppDelete] Database lookup failed:`, findError);
      throw new Error(`Erro ao localizar instância: ${findError.message}`);
    }

    if (!target) {
      console.warn(`[WhatsAppDelete] No local instance found for ${data.id || data.name}`);
      return { ok: true, count: 0, alreadyDeleted: true };
    }

    // 2. Clear references in conversations FIRST to avoid FK constraint errors
    console.log(`[WhatsAppDelete] Clearing conversation references for instance ${target.id}`);
    const { error: convError } = await supabaseAdmin
      .from('conversations')
      .update({ instance_id: null, updated_at: new Date().toISOString() })
      .eq('instance_id', target.id);

    if (convError) {
      console.error(`[WhatsAppDelete] Failed to clear conversations:`, convError);
      // We continue anyway, maybe they can be deleted? No, FK will block.
      // But maybe there were no conversations.
    }

    // 3. Try to delete from Evolution API (optional, we don't want to block the DB delete if API is down)
    console.log(`[WhatsAppDelete] Attempting Evolution API cleanup for ${target.name}`);
    try { 
      // Evolution's delete usually handles logout too
      await evoFetch(`/instance/delete/${encodeURIComponent(target.name)}`, { method: 'DELETE' }).catch(() => {});
    } catch (e) {
      console.warn(`[WhatsAppDelete] Evolution cleanup failed (ignoring):`, e);
    }
    
    // 4. Delete from local database - This is the "source of truth"
    console.log(`[WhatsAppDelete] Deleting row from whatsapp_instances: ${target.id}`);
    const { error, count } = await supabaseAdmin
      .from('whatsapp_instances')
      .delete({ count: 'exact' })
      .eq('id', target.id);

    if (error) {
      console.error(`[WhatsAppDelete] Database delete failed:`, error);
      throw new Error(`Erro ao excluir no banco: ${error.message}`);
    }

    console.log(`[WhatsAppDelete] Successfully deleted ${count} row(s)`);
    return { ok: true, count };
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