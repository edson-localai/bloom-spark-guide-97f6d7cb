import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { EvoConfig, evoFetch, normalizeStatus, jidToPhone } from "@/lib/whatsapp.server";

export class WhatsAppService {
  private static instance: WhatsAppService;
  private configCache: EvoConfig | null = null;
  private cacheExpiry: number = 0;

  private constructor() {}

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  private async getConfig(): Promise<EvoConfig> {
    const now = Date.now();
    if (this.configCache && now < this.cacheExpiry) {
      return this.configCache;
    }

    const { data, error } = await supabaseAdmin
      .from("app_settings")
      .select("key, value")
      .in("key", ["whatsapp_api_url", "whatsapp_api_key"]);

    if (error) throw new Error(`Failed to read WhatsApp settings: ${error.message}`);

    const map = Object.fromEntries((data || []).map((r: any) => [r.key, r.value]));
    const url = (map.whatsapp_api_url || "").replace(/\/+$/, "");
    const apiKey = map.whatsapp_api_key || "";

    if (!url || !apiKey) {
      throw new Error(
        "WhatsApp API not configured. Set whatsapp_api_url and whatsapp_api_key in settings.",
      );
    }

    this.configCache = { url, apiKey };
    this.cacheExpiry = now + 60000; // 1 minute cache
    return this.configCache;
  }

  private async fetch(path: string, init: RequestInit = {}): Promise<any> {
    const config = await this.getConfig();
    return evoFetch(path, init, config);
  }

  async createInstance(data: {
    name: string;
    displayName: string;
    apiKey?: string;
    webhookUrl: string;
  }) {
    const created = await this.fetch("/instance/create", {
      method: "POST",
      body: JSON.stringify({
        instanceName: data.name,
        qrcode: true,
        token: data.apiKey,
        integration: "WHATSAPP-BAILEYS",
        webhookUrl: data.webhookUrl,
        webhookByEvents: false,
        webhookBase64: false,
        events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE", "QRCODE_UPDATED"],
      }),
    });

    const qr = created?.qrcode?.base64 || created?.qrcode?.code || null;
    const status = normalizeStatus(created?.instance?.status);

    const { data: row, error } = await supabaseAdmin
      .from("whatsapp_instances")
      .insert({
        name: data.name,
        display_name: data.displayName,
        status,
        qr_code: qr,
        instance_key: data.apiKey || created?.instance?.token || created?.hash || null,
        webhook_url: data.webhookUrl,
        instance_data: created as any,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { instance: row, qr };
  }

  async deleteInstance(idOrName: string) {
    const { data: target, error: findError } = await supabaseAdmin
      .from("whatsapp_instances")
      .select("id, name")
      .or(`id.eq.${idOrName},name.eq.${idOrName}`)
      .maybeSingle();

    if (findError || !target) {
      return { ok: true, alreadyDeleted: true };
    }

    // Clear references
    await supabaseAdmin
      .from("conversations")
      .update({ instance_id: null, updated_at: new Date().toISOString() })
      .eq("instance_id", target.id);

    try {
      await this.fetch(`/instance/delete/${encodeURIComponent(target.name)}`, {
        method: "DELETE",
      }).catch(() => {});
    } catch {}

    const { error, count } = await supabaseAdmin
      .from("whatsapp_instances")
      .delete({ count: "exact" })
      .eq("id", target.id);

    if (error) throw new Error(error.message);
    return { ok: true, count };
  }

  async syncInstance(name: string) {
    const state = await this.fetch(`/instance/connectionState/${encodeURIComponent(name)}`);
    const status = normalizeStatus(state?.instance?.state || state?.state);

    let phone: string | null = null;
    try {
      const list = await this.fetch(
        `/instance/fetchInstances?instanceName=${encodeURIComponent(name)}`,
      );
      const inst = Array.isArray(list) ? list[0] : list;
      phone = inst?.instance?.owner
        ? jidToPhone(inst.instance.owner)
        : inst?.owner
          ? jidToPhone(inst.owner)
          : null;
    } catch {}

    const update: any = {
      status,
      updated_at: new Date().toISOString(),
      last_seen: new Date().toISOString(),
    };
    if (phone) update.phone_number = phone;
    if (status === "connected") update.qr_code = null;

    await supabaseAdmin.from("whatsapp_instances").update(update).eq("name", name);
    return { status, phone };
  }

  async logoutInstance(name: string) {
    await this.fetch(`/instance/logout/${encodeURIComponent(name)}`, { method: "DELETE" });
    await supabaseAdmin
      .from("whatsapp_instances")
      .update({
        status: "disconnected",
        qr_code: null,
        phone_number: null,
        updated_at: new Date().toISOString(),
      })
      .eq("name", name);
    return { ok: true };
  }
}
