import { createFileRoute } from "@tanstack/react-router";

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
export const Route = createFileRoute("/api/public/wapi/webhook")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        // Mandatory shared-secret check. Configure WAPI_WEBHOOK_SECRET
        // and set it as a header in the W-API webhook configuration.
        const secret = process.env.WAPI_WEBHOOK_SECRET;
        if (!secret) {
          console.error("WAPI_WEBHOOK_SECRET not configured");
          return new Response("Webhook secret not configured", { status: 500 });
        }
        const provided =
          request.headers.get("x-webhook-secret") ||
          request.headers.get("apikey") ||
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
          "";
        if (provided.length !== secret.length || provided !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }

        let payload: any;
        try {
          payload = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        // Identificar evento e instanceId
        const eventRaw = String(
          payload?.event || payload?.type || payload?.eventType || "",
        ).toLowerCase();
        const wapiInstanceId =
          payload?.instanceId ||
          payload?.instance?.id ||
          payload?.instance_id ||
          payload?.data?.instanceId ||
          null;

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          // Localiza nossa instância no banco a partir do instanceId da W-API
          let inst: any = null;
          if (wapiInstanceId) {
            const { data } = await supabaseAdmin
              .from("whatsapp_instances")
              .select("*")
              .eq("provider", "wapi")
              .filter("instance_data->wapi->>instance_id", "eq", wapiInstanceId)
              .maybeSingle();
            inst = data;
          }

          // ----- Conexão / desconexão -----
          if (/connect|connection|status\.instance|qr/i.test(eventRaw)) {
            if (inst) {
              const isConnected =
                payload?.connected === true ||
                /connected|open|ready/i.test(
                  String(payload?.status || payload?.data?.status || ""),
                );
              const isDisc = /disconnect|logout|close/i.test(
                eventRaw + " " + String(payload?.status || ""),
              );
              const qr =
                payload?.qrCode ||
                payload?.qr ||
                payload?.data?.qrCode ||
                payload?.data?.base64 ||
                null;

              const update: any = {
                updated_at: new Date().toISOString(),
                last_seen: new Date().toISOString(),
              };
              if (isConnected) {
                update.status = "connected";
                update.qr_code = null;
              } else if (isDisc) {
                update.status = "disconnected";
                update.qr_code = null;
              } else if (qr) {
                update.status = "connecting";
                update.qr_code = qr;
              }
              await supabaseAdmin.from("whatsapp_instances").update(update).eq("id", inst.id);
            }
            return Response.json({ ok: true });
          }

          // ----- Status de mensagem (sent/delivered/read/failed) -----
          if (/status|ack|delivery|message-status/i.test(eventRaw)) {
            const msgId = payload?.messageId || payload?.id || payload?.data?.messageId;
            const st = String(payload?.status || payload?.data?.status || "").toLowerCase();
            if (msgId && st) {
              const mapped =
                st === "read"
                  ? "read"
                  : st === "delivered" || st === "received"
                    ? "delivered"
                    : st === "failed" || st === "error"
                      ? "failed"
                      : "sent";
              await supabaseAdmin
                .from("messages")
                .update({ status: mapped })
                .eq("wa_message_id", msgId);
            }
            return Response.json({ ok: true });
          }

          // ----- Mensagem recebida (event tipo "message" / "received" / "messages") -----
          // Aceita estruturas variadas; ignora se for nossa própria saída.
          const isOutbound = payload?.fromMe === true || payload?.data?.fromMe === true;
          if (isOutbound) return Response.json({ ok: true, skipped: "fromMe" });

          // Log full payload (debug) — primeira chave de cada nível ajuda a entender estruturas novas
          console.log("[wapi-webhook] payload:", JSON.stringify(payload).slice(0, 2000));

          // Extrai dados da mensagem
          const msgRoot =
            payload?.msgContent ||
            payload?.message ||
            payload?.data?.msgContent ||
            payload?.data?.message ||
            payload?.data ||
            payload;

          // chat.id = identificador da conversa (pode ser número@s.whatsapp.net, @lid ou @g.us)
          const chatIdRaw =
            payload?.chat?.id ||
            payload?.data?.chat?.id ||
            payload?.from ||
            payload?.data?.from ||
            payload?.sender?.id ||
            payload?.data?.sender?.id ||
            msgRoot?.from ||
            null;

          // Telefone numérico real — procurar campos não-LID
          const numericPhoneCandidates = [
            payload?.sender?.phone,
            payload?.data?.sender?.phone,
            payload?.sender?.phoneNumber,
            payload?.data?.sender?.phoneNumber,
            payload?.phone,
            payload?.data?.phone,
            payload?.senderPhone,
            payload?.data?.senderPhone,
            // Caso o sender.id NÃO seja @lid, ele já é o telefone real
            !String(payload?.sender?.id || "").endsWith("@lid") ? payload?.sender?.id : null,
            // Idem para chat.id
            !String(chatIdRaw || "").endsWith("@lid") && !String(chatIdRaw || "").endsWith("@g.us")
              ? chatIdRaw
              : null,
          ];
          let realPhone = "";
          for (const c of numericPhoneCandidates) {
            if (!c) continue;
            const digits = String(c).replace(/[^0-9]/g, "");
            if (digits && digits.length >= 8 && digits.length <= 15) {
              realPhone = digits;
              break;
            }
          }

          const waMsgId =
            payload?.messageId || payload?.id || msgRoot?.messageId || msgRoot?.id || null;
          const pushName =
            payload?.sender?.pushName ||
            payload?.data?.sender?.pushName ||
            payload?.senderName ||
            payload?.pushName ||
            payload?.notifyName ||
            payload?.chat?.name ||
            payload?.data?.chat?.name ||
            msgRoot?.senderName ||
            "";

          if (!chatIdRaw || !waMsgId) {
            console.warn("W-API webhook ignored: no_message_payload", {
              event: eventRaw,
              hasChat: !!payload?.chat,
              hasSender: !!payload?.sender,
              hasMsgContent: !!payload?.msgContent,
            });
            return Response.json({ ok: true, ignored: "no_message_payload", event: eventRaw });
          }

          // Normalizar chat_id (preservar sufixos @lid e @g.us)
          const chatStr = String(chatIdRaw);
          const remoteJid = chatStr.includes("@")
            ? chatStr
            : `${chatStr.replace(/[^0-9]/g, "")}@s.whatsapp.net`;
          if (remoteJid.endsWith("@g.us")) {
            return Response.json({ ok: true, skipped: "group" });
          }

          // Telefone para chave do contato: preferir o real; fallback para os dígitos do chat (mesmo que LID)
          const phone = realPhone || chatStr.replace(/[^0-9]/g, "");

          // Extrair conteúdo / mídia
          let content = "";
          let contentType: string = "text";
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
            content = image.caption || "[Imagem]";
            contentType = "image";
            mediaMime = image.mimetype || image.mimeType || "image/jpeg";
            mediaUrl = image.url || image.link || image.imageUrl || null;
          } else if (audio) {
            content = "[Áudio]";
            contentType = "audio";
            mediaMime = audio.mimetype || audio.mimeType || "audio/ogg";
            mediaUrl = audio.url || audio.link || audio.audioUrl || null;
          } else if (video) {
            content = video.caption || "[Vídeo]";
            contentType = "video";
            mediaMime = video.mimetype || video.mimeType || "video/mp4";
            mediaUrl = video.url || video.link || video.videoUrl || null;
          } else if (doc) {
            content = doc.fileName || doc.filename || "[Documento]";
            contentType = "document";
            mediaMime = doc.mimetype || doc.mimeType || "application/octet-stream";
            mediaUrl = doc.url || doc.link || doc.documentUrl || null;
          } else if (sticker) {
            content = "[Figurinha]";
            contentType = "sticker";
          } else if (location) {
            content = `[Localização] ${location.latitude || location.degreesLatitude},${location.longitude || location.degreesLongitude}`;
            contentType = "location";
          } else if (typeof text === "string" && text) {
            content = text;
          } else {
            content = "[Mensagem não suportada]";
          }

          // 1) contato — chave por phone (real quando possível).
          // Tenta vincular lead se houver referência [Ref: web-...]
          let contactId: string | null = null;
          {
            const { linkLeadToContact } = await import("@/lib/whatsapp.server");
            const linkedId = await linkLeadToContact(content, phone);

            if (linkedId) {
              contactId = linkedId;
            } else {
              const { data: existing } = await supabaseAdmin
                .from("contacts")
                .select("id, name, phone")
                .eq("phone", phone)
                .maybeSingle();
              const looksLikeJustDigits = (n: string | null | undefined) =>
                !n || /^[0-9]+$/.test(String(n).trim());
              if (existing?.id) {
                contactId = existing.id;
                // Atualiza o nome quando o atual está vazio ou é só dígitos (LID), e temos pushName real
                if (pushName && looksLikeJustDigits(existing.name)) {
                  await supabaseAdmin
                    .from("contacts")
                    .update({ name: pushName })
                    .eq("id", existing.id);
                }
              } else {
                const { data: created } = await supabaseAdmin
                  .from("contacts")
                  .insert({ phone, name: pushName || null })
                  .select("id")
                  .single();
                contactId = created?.id || null;
              }
            }
          }

          const instanceRowId = inst?.id || null;

          // 2) conversa (Chatwoot-style: nova conversa entra na fila e tenta atribuição automática)
          let conversationId: string | null = null;
          let isNewConversation = false;
          let needsAssignment = false;
          {
            const { data: existing } = await supabaseAdmin
              .from("conversations")
              .select("id, agent_id, status")
              .eq("whatsapp_chat_id", remoteJid)
              .maybeSingle();
            if (existing?.id) {
              conversationId = existing.id;
              // Se a conversa foi reaberta (resolvida/arquivada) ou continua sem agente, reentrar na fila
              const reopened = existing.status === "resolved" || existing.status === "archived";
              needsAssignment = !existing.agent_id || reopened;
              await supabaseAdmin
                .from("conversations")
                .update({
                  last_message: content,
                  last_message_at: new Date().toISOString(),
                  unread_count:
                    (existing as any).unread_count != null ? (existing as any).unread_count + 1 : 1,
                  status: reopened ? "queue" : existing.status,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", existing.id);
            } else {
              isNewConversation = true;
              needsAssignment = true;
              const { data: created } = await supabaseAdmin
                .from("conversations")
                .insert({
                  contact_id: contactId,
                  instance_id: instanceRowId,
                  whatsapp_chat_id: remoteJid,
                  status: "queue",
                  channel: "whatsapp",
                  last_message: content,
                  last_message_at: new Date().toISOString(),
                  unread_count: 1,
                })
                .select("id")
                .single();
              conversationId = created?.id || null;
            }
          }

          if (!conversationId) return Response.json({ ok: true, skipped: "no_conv" });

          // 3) idempotência
          const { data: dup } = await supabaseAdmin
            .from("messages")
            .select("id")
            .eq("wa_message_id", String(waMsgId))
            .maybeSingle();
          if (dup?.id) return Response.json({ ok: true, dedup: true });

          await supabaseAdmin.from("messages").insert({
            conversation_id: conversationId,
            wa_message_id: String(waMsgId),
            sender_type: "contact",
            content,
            content_type: contentType as any,
            media_url: mediaUrl,
            media_mime: mediaMime,
            status: "delivered",
          });

          // 4) atribuição automática + saudação na 1ª mensagem (Chatwoot-style)
          if (needsAssignment) {
            try {
              const { assignConversation } = await import("@/lib/routing.server");
              await assignConversation(conversationId, contactId);
            } catch (e) {
              console.error("assignConversation failed:", e);
            }
          }

          if (isNewConversation) {
            try {
              const { data: welcome } = await supabaseAdmin
                .from("app_settings")
                .select("value")
                .eq("key", "welcome_message")
                .maybeSingle();
              const text = (welcome?.value || "").trim();
              if (text) {
                await supabaseAdmin.from("messages").insert({
                  conversation_id: conversationId,
                  content: text,
                  sender_type: "bot",
                  status: "sent",
                });
                // Encaminha pelo WhatsApp via instância
                try {
                  if (inst?.provider === "wapi") {
                    const { wapiFetch } = await import("@/lib/wapi.server");
                    const data = inst?.instance_data || {};
                    const credentials = {
                      instanceId: data?.wapi?.instance_id || inst.name,
                      token: inst.instance_key,
                    };
                    const phoneTo =
                      remoteJid.endsWith("@lid") || remoteJid.endsWith("@g.us")
                        ? remoteJid
                        : remoteJid.replace(/[^0-9]/g, "");
                    await wapiFetch(
                      "/v1/message/send-text",
                      {
                        method: "POST",
                        body: JSON.stringify({ phone: phoneTo, message: text }),
                      },
                      credentials as any,
                    );
                  }
                } catch (e) {
                  console.warn("welcome wapi send failed:", (e as any)?.message);
                }
              }
            } catch (e) {
              console.error("welcome flow failed:", e);
            }
          }

          // 5) Auto-reply via IA (Lovable AI Gateway)
          try {
            const { data: aiActive } = await supabaseAdmin
              .from("app_settings")
              .select("value")
              .eq("key", "auto_reply_active")
              .maybeSingle();

            if (aiActive?.value === "true") {
              const { data: convRow } = await supabaseAdmin
                .from("conversations")
                .select("agent_id, bot_active, auto_reply_enabled")
                .eq("id", conversationId)
                .single();

              const botEnabled =
                convRow && convRow.bot_active !== false && convRow.auto_reply_enabled !== false;
              if (botEnabled) {
                const { data: promptRow } = await supabaseAdmin
                  .from("app_settings")
                  .select("value")
                  .eq("key", "system_prompt")
                  .maybeSingle();

                const { data: hist } = await supabaseAdmin
                  .from("messages")
                  .select("content, sender_type")
                  .eq("conversation_id", conversationId)
                  .order("created_at", { ascending: false })
                  .limit(10);

                const history = (hist || [])
                  .reverse()
                  .map((m: any) => `${m.sender_type}: ${m.content}`)
                  .join("\n");

                const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
                  },
                  body: JSON.stringify({
                    model: "google/gemini-2.5-flash",
                    messages: [
                      {
                        role: "system",
                        content:
                          promptRow?.value ||
                          "Você é um assistente prestativo. Responda de forma breve e amigável em português.",
                      },
                      {
                        role: "user",
                        content: `Histórico da conversa:\n${history}\n\nResponda à última mensagem do contato.`,
                      },
                    ],
                  }),
                });

                if (aiResp.ok) {
                  const aiData = await aiResp.json();
                  const reply = aiData?.choices?.[0]?.message?.content?.trim();
                  if (reply) {
                    await supabaseAdmin.from("messages").insert({
                      conversation_id: conversationId,
                      content: reply,
                      sender_type: "bot",
                      status: "sent",
                    });
                    try {
                      if (inst?.provider === "wapi") {
                        const { wapiFetch } = await import("@/lib/wapi.server");
                        const data = inst?.instance_data || {};
                        const credentials = {
                          instanceId: data?.wapi?.instance_id || inst.name,
                          token: inst.instance_key,
                        };
                        const phoneTo =
                          remoteJid.endsWith("@lid") || remoteJid.endsWith("@g.us")
                            ? remoteJid
                            : remoteJid.replace(/[^0-9]/g, "");
                        await wapiFetch(
                          "/v1/message/send-text",
                          {
                            method: "POST",
                            body: JSON.stringify({ phone: phoneTo, message: reply }),
                          },
                          credentials as any,
                        );
                      }
                    } catch (e) {
                      console.warn("AI reply wapi send failed:", (e as any)?.message);
                    }
                  }
                } else {
                  console.warn("AI gateway error:", aiResp.status, await aiResp.text());
                }
              }
            }
          } catch (e) {
            console.error("auto-reply failed:", e);
          }

          return Response.json({ ok: true, newConversation: isNewConversation });
        } catch (err: any) {
          console.error("W-API webhook error:", err);
          return new Response(JSON.stringify({ ok: false, error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
} as any);
