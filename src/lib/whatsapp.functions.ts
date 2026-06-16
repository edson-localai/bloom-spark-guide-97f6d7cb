"use server";

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AppError, handleServerError } from "./errors";

async function requireAdminOrSupervisor(supabase: any, userId: string) {
  try {
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const list = (roles || []).map((r: any) => r.role);
    if (!list.includes("admin") && !list.includes("supervisor")) {
      throw AppError.forbidden(
        "Você precisa ser administrador ou supervisor para realizar esta ação.",
      );
    }
    return list;
  } catch (err) {
    handleServerError(err);
  }
}

function publicWebhookUrl(): string {
  const projectId = process.env.LOVABLE_PROJECT_ID || "1437f3b0-fe7f-4f6b-8c41-2858d825f265";
  const path = "/api/public/wapi/webhook";
  return `https://project--${projectId}.lovable.app${path}`;
}

async function getInstance(name: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("whatsapp_instances")
    .select("*")
    .eq("name", name)
    .single();
  if (error || !data) throw AppError.validation("Instância não encontrada");
  return data as any;
}

function wapiCredsFrom(inst: any): { instanceId: string; token: string } {
  const data = inst?.instance_data || {};
  const instanceId = data?.wapi?.instance_id || data?.wapi_instance_id || inst.name;
  const token = inst.instance_key || data?.wapi?.token;
  if (!instanceId || !token) {
    throw AppError.validation("Credenciais W-API ausentes (instance_id e token).");
  }
  return { instanceId, token };
}

// --- Create / connect a new instance ---
export const createWhatsAppInstance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        provider: z.enum(["wapi"]).default("wapi"),
        name: z
          .string()
          .min(2)
          .max(60)
          .regex(/^[a-zA-Z0-9_-]+$/, "Use letras, números, _ ou -"),
        displayName: z.string().min(1).max(100),
        // W-API only:
        wapiInstanceId: z.string().min(1),
        wapiToken: z.string().min(1),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await requireAdminOrSupervisor(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      if (data.provider !== "wapi") {
        throw AppError.validation("Apenas o provedor W-API é suportado no momento.");
      }

      // Não buscar QR durante a criação para evitar timeout do worker.
      // O frontend chama getWhatsAppQr() logo em seguida.
      const qr: string | null = null;
      const status: "connected" | "disconnected" | "connecting" = "connecting";
      const { data: row, error } = await supabaseAdmin
        .from("whatsapp_instances")
        .insert({
          provider: "wapi",
          name: data.name,
          display_name: data.displayName,
          status,
          qr_code: qr,
          instance_key: data.wapiToken,
          webhook_url: publicWebhookUrl(),
          instance_data: { wapi: { instance_id: data.wapiInstanceId } } as any,
        })
        .select()
        .single();

      if (error) throw AppError.internal("Falha ao registrar instância.");

      // Register webhook event URLs at W-API (best-effort).
      try {
        const { wapiSetWebhooks } = await import("./wapi.server");
        await wapiSetWebhooks(
          { instanceId: data.wapiInstanceId, token: data.wapiToken },
          publicWebhookUrl(),
        );
      } catch (e: any) {
        console.warn("[createWhatsAppInstance] wapiSetWebhooks failed:", e?.message);
      }
      return { instance: row, qr };
    } catch (err) {
      handleServerError(err);
    }
  });

// --- Refresh QR code / connection ---
export const getWhatsAppQrCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ name: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    await requireAdminOrSupervisor(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const inst = await getInstance(data.name);

    if (inst.provider !== "wapi") {
      throw AppError.validation("Apenas o provedor W-API é suportado no momento.");
    }

    const { wapiGetQr } = await import("./wapi.server");
    const { qr, connected } = await wapiGetQr(wapiCredsFrom(inst));
    await supabaseAdmin
      .from("whatsapp_instances")
      .update({
        qr_code: qr,
        status: connected ? "connected" : "connecting",
        updated_at: new Date().toISOString(),
      })
      .eq("name", data.name);
    return { qr, connected };
  });

// --- Sync status from API ---
export const syncWhatsAppInstance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ name: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    await requireAdminOrSupervisor(context.supabase, context.userId);
    try {
      const inst = await getInstance(data.name);
      if (inst.provider !== "wapi") {
        throw AppError.validation("Apenas o provedor W-API é suportado no momento.");
      }
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { wapiIsConnected } = await import("./wapi.server");
      const connected = await wapiIsConnected(wapiCredsFrom(inst));
      const status = connected ? "connected" : inst.qr_code ? "connecting" : "disconnected";
      await supabaseAdmin
        .from("whatsapp_instances")
        .update({
          status,
          qr_code: connected ? null : inst.qr_code,
          updated_at: new Date().toISOString(),
          last_seen: new Date().toISOString(),
        })
        .eq("name", data.name);
      return { status };
    } catch (err) {
      handleServerError(err);
    }
  });

// --- Restart ---
export const restartWhatsAppInstance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ name: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    await requireAdminOrSupervisor(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const inst = await getInstance(data.name);
    if (inst.provider !== "wapi") {
      throw AppError.validation("Apenas o provedor W-API é suportado no momento.");
    }
    // No documented restart endpoint — just refresh QR.
    const { wapiGetQr } = await import("./wapi.server");
    const { qr } = await wapiGetQr(wapiCredsFrom(inst));
    await supabaseAdmin
      .from("whatsapp_instances")
      .update({ qr_code: qr, status: "connecting", updated_at: new Date().toISOString() })
      .eq("name", data.name);
    return { ok: true };
  });

// --- Disconnect (logout) ---
export const disconnectWhatsAppInstance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ name: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    await requireAdminOrSupervisor(context.supabase, context.userId);
    try {
      const inst = await getInstance(data.name);
      if (inst.provider !== "wapi") {
        throw AppError.validation("Apenas o provedor W-API é suportado no momento.");
      }
      // W-API não expõe logout público — apenas marcar como desconectado localmente.
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("whatsapp_instances")
        .update({
          status: "disconnected",
          qr_code: null,
          phone_number: null,
          updated_at: new Date().toISOString(),
        })
        .eq("name", data.name);
      return { ok: true };
    } catch (err) {
      handleServerError(err);
    }
  });

// --- Delete instance entirely ---
export const deleteWhatsAppInstance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().min(1),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await requireAdminOrSupervisor(context.supabase, context.userId);
    const sb = context.supabase;

    try {
      // W-API não requer cleanup remoto via API pública (gerenciado via painel).
      // Se houvesse, colocaríamos aqui.
    } catch (e) {
      console.warn("[deleteWhatsAppInstance] external cleanup skipped:", (e as any)?.message);
    }

    const { data: result, error } = await sb.rpc("delete_whatsapp_instance", {
      _instance_id: data.id ?? undefined,
      _instance_name: data.name ?? undefined,
    });

    if (error) {
      console.error("[deleteWhatsAppInstance] RPC failed:", error);
      throw AppError.internal("Falha ao excluir instância.");
    }
    return result ?? { ok: true };
  });

// --- Send a text message via WhatsApp (called from the chat) ---
export const sendWhatsAppMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        conversationId: z.string().uuid(),
        content: z.string().min(1).max(10000),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const roleList = (roles || []).map((r: any) => r.role);
    if (
      !roleList.includes("admin") &&
      !roleList.includes("supervisor") &&
      !roleList.includes("agent")
    ) {
      throw AppError.forbidden();
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { jidToPhone } = await import("./whatsapp.server");

    const { data: conv, error: convErr } = await supabaseAdmin
      .from("conversations")
      .select("id, whatsapp_chat_id, instance_id")
      .eq("id", data.conversationId)
      .single();

    if (convErr || !conv) throw new Error("Conversation not found");
    if (!conv.whatsapp_chat_id) return { skipped: true, reason: "no_chat_id" };

    let inst: any = null;
    if (conv.instance_id) {
      const { data: i } = await supabaseAdmin
        .from("whatsapp_instances")
        .select("*")
        .eq("id", conv.instance_id)
        .single();
      inst = i;
    }
    if (!inst) {
      const { data: any2 } = await supabaseAdmin
        .from("whatsapp_instances")
        .select("*")
        .eq("status", "connected")
        .limit(1)
        .maybeSingle();
      inst = any2;
    }
    if (!inst) return { skipped: true, reason: "no_instance" };

    const chatId = String(conv.whatsapp_chat_id);
    // W-API: preservar sufixo @lid (LID universal) e @g.us (grupo); apenas @s.whatsapp.net/@c.us viram número puro.
    const wapiPhone =
      chatId.endsWith("@lid") || chatId.endsWith("@g.us") ? chatId : jidToPhone(chatId);
    const number = jidToPhone(chatId);

    try {
      if (inst.provider === "wapi") {
        const { wapiFetch } = await import("./wapi.server");
        const res = await wapiFetch(
          `/v1/message/send-text`,
          { method: "POST", body: JSON.stringify({ phone: wapiPhone, message: data.content }) },
          wapiCredsFrom(inst),
        );
        console.log("[sendWhatsAppMessage] wapi send-text →", { phone: wapiPhone, response: res });
        return { ok: true, id: res?.messageId || res?.insertedId || null };
      }
      throw new Error("Provedor não suportado para envio de mensagens");
    } catch (err: any) {
      console.error("WhatsApp send failed:", err);
      return { ok: false, error: "Falha ao enviar mensagem. Tente novamente." };
    }
  });

// --- Sync Contacts from WhatsApp ---
export const syncWhatsAppContacts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ name: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    await requireAdminOrSupervisor(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const inst = await getInstance(data.name);

    if (inst.provider !== "wapi") {
      throw AppError.validation("Apenas o provedor W-API é suportado no momento.");
    }

    if (inst.status !== "connected") {
      throw AppError.validation("A instância precisa estar conectada para sincronizar contatos.");
    }

    try {
      const { wapiGetContacts } = await import("./wapi.server");
      const contacts = await wapiGetContacts(wapiCredsFrom(inst));

      let created = 0;
      let updated = 0;

      // Sincroniza em batches para evitar sobrecarga
      for (const raw of contacts) {
        const phone = String(raw.phone || raw.id || "").replace(/[^0-9]/g, "");
        const name = raw.name || raw.pushName || raw.notify || null;

        if (!phone || phone.length < 8) continue;

        const { data: existing } = await supabaseAdmin
          .from("contacts")
          .select("id, name")
          .eq("phone", phone)
          .maybeSingle();

        if (existing) {
          if (name && (!existing.name || /^[0-9]+$/.test(existing.name))) {
            await supabaseAdmin.from("contacts").update({ name }).eq("id", existing.id);
            updated++;
          }
        } else {
          await supabaseAdmin.from("contacts").insert({
            phone,
            name,
            source: "whatsapp_sync",
            stage: "novo",
          });
          created++;
        }
      }

      return { ok: true, created, updated, total: contacts.length };
    } catch (err) {
      handleServerError(err);
    }
  });
