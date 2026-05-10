import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { evoFetch, normalizeStatus, jidToPhone } from './whatsapp.server';

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
    
    console.log(`Deleting WhatsApp instance ID: ${data.id || 'by-name'}, Name: ${data.name}`);
    
    // 1. Try to logout and delete from Evolution API (optional, don't block if fails)
    try { 
      await evoFetch(`/instance/logout/${encodeURIComponent(data.name)}`, { method: 'DELETE' }); 
    } catch (e) {
      console.warn(`Evolution logout failed for ${data.name}:`, e);
    }
    
    try { 
      await evoFetch(`/instance/delete/${encodeURIComponent(data.name)}`, { method: 'DELETE' }); 
    } catch (e) {
      console.warn(`Evolution delete failed for ${data.name}:`, e);
    }

    const { data: target, error: findError } = await supabaseAdmin
      .from('whatsapp_instances')
      .select('id, name')
      .eq(data.id ? 'id' : 'name', data.id || data.name)
      .maybeSingle();

    if (findError) {
      console.error(`Database lookup failed for ${data.name}:`, findError);
      throw new Error(`Erro ao localizar instância no banco: ${findError.message}`);
    }

    if (!target) {
      console.warn(`No local WhatsApp instance found for ${data.id || data.name}`);
      return { ok: true, count: 0, alreadyDeleted: true };
    }

    await supabaseAdmin
      .from('conversations')
      .update({ instance_id: null, updated_at: new Date().toISOString() })
      .eq('instance_id', target.id);

    // 2. Delete from local database
    const { error, count } = await supabaseAdmin
      .from('whatsapp_instances')
      .delete({ count: 'exact' })
      .eq('id', target.id);

    if (error) {
      console.error(`Database delete failed for ${data.id}:`, error);
      throw new Error(`Erro ao excluir no banco: ${error.message}`);
    }

    if (count !== 1) {
      console.warn(`Unexpected delete count for ID ${target.id}: ${count}`);
      throw new Error('A instância não foi removida do banco. Atualize a página e tente novamente.');
    }

    console.log(`Deleted ${count} rows from whatsapp_instances for ID ${target.id}`);

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