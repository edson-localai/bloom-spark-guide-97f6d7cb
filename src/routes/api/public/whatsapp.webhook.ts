import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { jidToPhone, normalizeStatus } from '@/lib/whatsapp.server';

// Evolution API → Lovable webhook receiver.
// Configure this URL in your Evolution API panel:
// https://project--<PROJECT_ID>.lovable.app/api/public/whatsapp/webhook
//
// Handles MESSAGES_UPSERT, CONNECTION_UPDATE and QRCODE_UPDATED events.
export const Route = createFileRoute('/api/public/whatsapp/webhook')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        let payload: any;
        try {
          payload = await request.json();
        } catch {
          return new Response('Invalid JSON', { status: 400 });
        }

        const event = (payload?.event || '').toUpperCase().replace(/\./g, '_');
        const instanceName = payload?.instance || payload?.instanceName;

        try {
          if (event === 'CONNECTION_UPDATE') {
            const status = normalizeStatus(payload?.data?.state);
            const update: any = {
              status,
              updated_at: new Date().toISOString(),
              last_seen: new Date().toISOString(),
            };
            if (status === 'connected') update.qr_code = null;
            if (instanceName) {
              await supabaseAdmin.from('whatsapp_instances').update(update).eq('name', instanceName);
            }
            return Response.json({ ok: true });
          }

          if (event === 'QRCODE_UPDATED') {
            const qr = payload?.data?.qrcode?.base64 || payload?.data?.base64 || payload?.data?.qrcode || null;
            if (instanceName && qr) {
              await supabaseAdmin
                .from('whatsapp_instances')
                .update({ qr_code: qr, status: 'connecting', updated_at: new Date().toISOString() })
                .eq('name', instanceName);
            }
            return Response.json({ ok: true });
          }

          if (event === 'MESSAGES_UPSERT') {
            const items = Array.isArray(payload?.data) ? payload.data : [payload?.data];
            for (const item of items) {
              if (!item?.key) continue;
              if (item.key.fromMe) continue; // ignore our own outgoing echoes

              const remoteJid: string = item.key.remoteJid || '';
              if (remoteJid.endsWith('@g.us')) continue; // skip groups

              const phone = jidToPhone(remoteJid);
              const pushName: string = item.pushName || '';
              const waMsgId: string = item.key.id;

              const m = item.message || {};
              let content = '';
              let contentType: string = 'text';
              let mediaUrl: string | null = null;
              let mediaMime: string | null = null;

              if (m.conversation) {
                content = m.conversation;
              } else if (m.extendedTextMessage?.text) {
                content = m.extendedTextMessage.text;
              } else if (m.imageMessage) {
                content = m.imageMessage.caption || '[Imagem]';
                contentType = 'image';
                mediaMime = m.imageMessage.mimetype || 'image/jpeg';
                mediaUrl = m.imageMessage.url || null;
              } else if (m.videoMessage) {
                content = m.videoMessage.caption || '[Vídeo]';
                contentType = 'video';
                mediaMime = m.videoMessage.mimetype || 'video/mp4';
                mediaUrl = m.videoMessage.url || null;
              } else if (m.audioMessage) {
                content = '[Áudio]';
                contentType = 'audio';
                mediaMime = m.audioMessage.mimetype || 'audio/ogg';
                mediaUrl = m.audioMessage.url || null;
              } else if (m.documentMessage) {
                content = m.documentMessage.fileName || '[Documento]';
                contentType = 'document';
                mediaMime = m.documentMessage.mimetype || 'application/octet-stream';
                mediaUrl = m.documentMessage.url || null;
              } else if (m.stickerMessage) {
                content = '[Figurinha]';
                contentType = 'sticker';
              } else if (m.locationMessage) {
                content = `[Localização] ${m.locationMessage.degreesLatitude},${m.locationMessage.degreesLongitude}`;
                contentType = 'location';
              } else {
                content = '[Mensagem não suportada]';
              }

              // 1) Find / create the contact by phone
              let contactId: string | null = null;
              {
                const { data: existing } = await supabaseAdmin
                  .from('contacts')
                  .select('id, name')
                  .eq('phone', phone)
                  .maybeSingle();
                if (existing?.id) {
                  contactId = existing.id;
                  if (!existing.name && pushName) {
                    await supabaseAdmin.from('contacts').update({ name: pushName }).eq('id', existing.id);
                  }
                } else {
                  const { data: created } = await supabaseAdmin
                    .from('contacts')
                    .insert({ phone, name: pushName || null })
                    .select('id')
                    .single();
                  contactId = created?.id || null;
                }
              }

              // 2) Find / create the instance row id
              let instanceId: string | null = null;
              if (instanceName) {
                const { data: inst } = await supabaseAdmin
                  .from('whatsapp_instances')
                  .select('id')
                  .eq('name', instanceName)
                  .maybeSingle();
                instanceId = inst?.id || null;
              }

              // 3) Find / create conversation
              let conversationId: string | null = null;
              {
                const { data: existing } = await supabaseAdmin
                  .from('conversations')
                  .select('id, status')
                  .eq('whatsapp_chat_id', remoteJid)
                  .maybeSingle();
                if (existing?.id) {
                  conversationId = existing.id;
                  await supabaseAdmin
                    .from('conversations')
                    .update({
                      last_message: content,
                      last_message_at: new Date().toISOString(),
                      unread_count: 1,
                      updated_at: new Date().toISOString(),
                    })
                    .eq('id', existing.id);
                } else {
                  const { data: created } = await supabaseAdmin
                    .from('conversations')
                    .insert({
                      contact_id: contactId,
                      instance_id: instanceId,
                      whatsapp_chat_id: remoteJid,
                      status: 'bot',
                      channel: 'whatsapp',
                      last_message: content,
                      last_message_at: new Date().toISOString(),
                      unread_count: 1,
                    })
                    .select('id')
                    .single();
                  conversationId = created?.id || null;
                }
              }

              if (!conversationId) continue;

              // 4) Insert message (idempotent on wa_message_id)
              const { data: dup } = await supabaseAdmin
                .from('messages')
                .select('id')
                .eq('wa_message_id', waMsgId)
                .maybeSingle();
              if (dup?.id) continue;

              await supabaseAdmin.from('messages').insert({
                conversation_id: conversationId,
                wa_message_id: waMsgId,
                sender_type: 'contact',
                content,
                content_type: contentType as any,
                media_url: mediaUrl,
                media_mime: mediaMime,
                status: 'delivered',
              });
            }

            return Response.json({ ok: true });
          }

          return Response.json({ ok: true, ignored: event });
        } catch (err: any) {
          console.error('WhatsApp webhook error:', err);
          return new Response(JSON.stringify({ ok: false, error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    },
  },
} as any);
