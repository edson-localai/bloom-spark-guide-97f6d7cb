import { createFileRoute } from '@tanstack/react-router';

function readTextMessage(message: any): string | null {
  return (
    message?.conversation ||
    message?.extendedTextMessage?.text ||
    message?.text ||
    message?.message ||
    message?.body ||
    null
  );
}

// W-API → Lovable webhook receiver.
// Configure no painel da W-API esta URL para os 3 eventos:
//   - Recebimento de mensagem
//   - Status de mensagem (delivery / read / failed)
//   - Conexão / desconexão
//
// URL: https://project--<PROJECT_ID>.lovable.app/api/public/wapi/webhook
//
// O parser é flexível pois a doc oficial não publica schemas exatos —
// tenta os campos comuns (event/type, instanceId, phone/from, message/text/body, image/audio/document).
export const Route = createFileRoute('/api/public/wapi/webhook')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        let payload: any;
        try {
          payload = await request.json();
        } catch {
          return new Response('Invalid JSON', { status: 400 });
        }

        // Identificar evento e instanceId
        const eventRaw = String(payload?.event || payload?.type || payload?.eventType || '').toLowerCase();
        const wapiInstanceId =
          payload?.instanceId ||
          payload?.instance?.id ||
          payload?.instance_id ||
          payload?.data?.instanceId ||
          null;

        try {
          const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

          // Localiza nossa instância no banco a partir do instanceId da W-API
          let inst: any = null;
          if (wapiInstanceId) {
            const { data } = await supabaseAdmin
              .from('whatsapp_instances')
              .select('*')
              .eq('provider', 'wapi')
              .filter('instance_data->wapi->>instance_id', 'eq', wapiInstanceId)
              .maybeSingle();
            inst = data;
          }

          // ----- Conexão / desconexão -----
          if (/connect|connection|status\.instance|qr/i.test(eventRaw)) {
            if (inst) {
              const isConnected =
                payload?.connected === true ||
                /connected|open|ready/i.test(String(payload?.status || payload?.data?.status || ''));
              const isDisc = /disconnect|logout|close/i.test(eventRaw + ' ' + String(payload?.status || ''));
              const qr = payload?.qrCode || payload?.qr || payload?.data?.qrCode || payload?.data?.base64 || null;

              const update: any = { updated_at: new Date().toISOString(), last_seen: new Date().toISOString() };
              if (isConnected) { update.status = 'connected'; update.qr_code = null; }
              else if (isDisc) { update.status = 'disconnected'; update.qr_code = null; }
              else if (qr) { update.status = 'connecting'; update.qr_code = qr; }
              await supabaseAdmin.from('whatsapp_instances').update(update).eq('id', inst.id);
            }
            return Response.json({ ok: true });
          }

          // ----- Status de mensagem (sent/delivered/read/failed) -----
          if (/status|ack|delivery|message-status/i.test(eventRaw)) {
            const msgId = payload?.messageId || payload?.id || payload?.data?.messageId;
            const st = String(payload?.status || payload?.data?.status || '').toLowerCase();
            if (msgId && st) {
              const mapped =
                st === 'read' ? 'read' :
                st === 'delivered' || st === 'received' ? 'delivered' :
                st === 'failed' || st === 'error' ? 'failed' : 'sent';
              await supabaseAdmin
                .from('messages')
                .update({ status: mapped })
                .eq('wa_message_id', msgId);
            }
            return Response.json({ ok: true });
          }

          // ----- Mensagem recebida (event tipo "message" / "received" / "messages") -----
          // Aceita estruturas variadas; ignora se for nossa própria saída.
          const isOutbound = payload?.fromMe === true || payload?.data?.fromMe === true;
          if (isOutbound) return Response.json({ ok: true, skipped: 'fromMe' });

          // Extrai dados da mensagem
          const msgRoot = payload?.msgContent || payload?.message || payload?.data?.msgContent || payload?.data?.message || payload?.data || payload;
          const fromRaw =
            payload?.phone ||
            payload?.from ||
            payload?.chat?.id ||
            payload?.sender?.id ||
            payload?.data?.phone ||
            payload?.data?.from ||
            payload?.data?.chat?.id ||
            payload?.data?.sender?.id ||
            msgRoot?.phone ||
            msgRoot?.from ||
            null;
          const waMsgId =
            payload?.messageId || payload?.id || msgRoot?.messageId || msgRoot?.id || null;
          const pushName =
            payload?.senderName || payload?.pushName || payload?.notifyName ||
            payload?.sender?.pushName || payload?.data?.senderName ||
            payload?.data?.sender?.pushName || msgRoot?.senderName || '';

          if (!fromRaw || !waMsgId) {
            console.warn('W-API webhook ignored: no_message_payload', {
              event: eventRaw,
              hasChat: !!payload?.chat,
              hasSender: !!payload?.sender,
              hasMsgContent: !!payload?.msgContent,
            });
            return Response.json({ ok: true, ignored: 'no_message_payload', event: eventRaw });
          }

          // Normalizar telefone (sem @, sem +, só dígitos)
          const phone = String(fromRaw).replace(/[^0-9]/g, '');
          const remoteJid = String(fromRaw).includes('@') ? String(fromRaw) : `${phone}@s.whatsapp.net`;
          if (remoteJid.endsWith('@g.us')) {
            return Response.json({ ok: true, skipped: 'group' });
          }

          // Extrair conteúdo / mídia
          let content = '';
          let contentType: string = 'text';
          let mediaUrl: string | null = null;
          let mediaMime: string | null = null;

          const text = readTextMessage(msgRoot) || payload?.text || payload?.body;
          const image = msgRoot?.image || msgRoot?.imageMessage || payload?.image;
          const audio = msgRoot?.audio || msgRoot?.audioMessage || payload?.audio;
          const video = msgRoot?.video || msgRoot?.videoMessage || payload?.video;
          const doc = msgRoot?.document || msgRoot?.documentMessage || payload?.document;
          const sticker = msgRoot?.sticker || msgRoot?.stickerMessage;
          const location = msgRoot?.location || msgRoot?.locationMessage;

          if (image) {
            content = image.caption || '[Imagem]';
            contentType = 'image';
            mediaMime = image.mimetype || image.mimeType || 'image/jpeg';
            mediaUrl = image.url || image.link || image.imageUrl || null;
          } else if (audio) {
            content = '[Áudio]';
            contentType = 'audio';
            mediaMime = audio.mimetype || audio.mimeType || 'audio/ogg';
            mediaUrl = audio.url || audio.link || audio.audioUrl || null;
          } else if (video) {
            content = video.caption || '[Vídeo]';
            contentType = 'video';
            mediaMime = video.mimetype || video.mimeType || 'video/mp4';
            mediaUrl = video.url || video.link || video.videoUrl || null;
          } else if (doc) {
            content = doc.fileName || doc.filename || '[Documento]';
            contentType = 'document';
            mediaMime = doc.mimetype || doc.mimeType || 'application/octet-stream';
            mediaUrl = doc.url || doc.link || doc.documentUrl || null;
          } else if (sticker) {
            content = '[Figurinha]';
            contentType = 'sticker';
          } else if (location) {
            content = `[Localização] ${location.latitude || location.degreesLatitude},${location.longitude || location.degreesLongitude}`;
            contentType = 'location';
          } else if (typeof text === 'string' && text) {
            content = text;
          } else {
            content = '[Mensagem não suportada]';
          }

          // 1) contato
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

          const instanceRowId = inst?.id || null;

          // 2) conversa (Chatwoot-style: nova conversa entra na fila e tenta atribuição automática)
          let conversationId: string | null = null;
          let isNewConversation = false;
          let needsAssignment = false;
          {
            const { data: existing } = await supabaseAdmin
              .from('conversations')
              .select('id, agent_id, status')
              .eq('whatsapp_chat_id', remoteJid)
              .maybeSingle();
            if (existing?.id) {
              conversationId = existing.id;
              // Se a conversa foi reaberta (resolvida/arquivada) ou continua sem agente, reentrar na fila
              const reopened = existing.status === 'resolved' || existing.status === 'archived';
              needsAssignment = !existing.agent_id || reopened;
              await supabaseAdmin
                .from('conversations')
                .update({
                  last_message: content,
                  last_message_at: new Date().toISOString(),
                  unread_count: (existing as any).unread_count != null ? undefined : 1,
                  status: reopened ? 'queue' : existing.status,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', existing.id);
            } else {
              isNewConversation = true;
              needsAssignment = true;
              const { data: created } = await supabaseAdmin
                .from('conversations')
                .insert({
                  contact_id: contactId,
                  instance_id: instanceRowId,
                  whatsapp_chat_id: remoteJid,
                  status: 'queue',
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

          if (!conversationId) return Response.json({ ok: true, skipped: 'no_conv' });

          // 3) idempotência
          const { data: dup } = await supabaseAdmin
            .from('messages')
            .select('id')
            .eq('wa_message_id', String(waMsgId))
            .maybeSingle();
          if (dup?.id) return Response.json({ ok: true, dedup: true });

          await supabaseAdmin.from('messages').insert({
            conversation_id: conversationId,
            wa_message_id: String(waMsgId),
            sender_type: 'contact',
            content,
            content_type: contentType as any,
            media_url: mediaUrl,
            media_mime: mediaMime,
            status: 'delivered',
          });

          return Response.json({ ok: true });
        } catch (err: any) {
          console.error('W-API webhook error:', err);
          return new Response(JSON.stringify({ ok: false, error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    },
  },
} as any);
