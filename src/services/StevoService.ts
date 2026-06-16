import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface StevoConfig {
  apiUrl: string;
  apiKey: string;
}

export interface StevoInstance {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "qr_pending" | "error";
  qrCode?: string;
  phoneNumber?: string;
  createdAt: string;
}

export class StevoService {
  private static instance: StevoService;
  private configCache: StevoConfig | null = null;
  private cacheExpiry: number = 0;

  private constructor() {}

  public static getInstance(): StevoService {
    if (!StevoService.instance) {
      StevoService.instance = new StevoService();
    }
    return StevoService.instance;
  }

  private async getConfig(): Promise<StevoConfig> {
    const now = Date.now();
    if (this.configCache && now < this.cacheExpiry) {
      return this.configCache;
    }

    const { data, error } = await supabaseAdmin
      .from("app_settings")
      .select("key, value")
      .in("key", ["stevo_api_url", "stevo_api_key"]);

    if (error) throw new Error(`Failed to read Stevo settings: ${error.message}`);

    const map = Object.fromEntries((data || []).map((r: any) => [r.key, r.value]));
    const apiUrl = (map.stevo_api_url || "").replace(/\/+$/, "");
    const apiKey = map.stevo_api_key || "";

    if (!apiUrl || !apiKey) {
      throw new Error("Stevo API not configured. Set stevo_api_url and stevo_api_key in settings.");
    }

    this.configCache = { apiUrl, apiKey };
    this.cacheExpiry = now + 60000; // 1 minute cache
    return this.configCache;
  }

  private async fetch(path: string, init: RequestInit = {}): Promise<any> {
    const config = await this.getConfig();
    const url = `${config.apiUrl}${path}`;

    const response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        apikey: config.apiKey,
        ...init.headers,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Stevo API error (${response.status}): ${text}`);
    }

    return response.json();
  }

  async createInstance(data: { name: string; displayName: string; webhookUrl: string }) {
    // Connect instance
    const connected = await this.fetch("/instance/connect", {
      method: "POST",
      body: JSON.stringify({
        instanceName: data.name,
      }),
    });

    // Get QR code
    let qrCode = null;
    try {
      const qrResponse = await this.fetch("/instance/qr", {
        method: "GET",
      });
      qrCode = qrResponse?.qr || qrResponse?.qrCode || null;
    } catch (err) {
      console.warn("Could not fetch QR code immediately:", err);
    }

    // Store in database
    const { data: row, error } = await supabaseAdmin
      .from("whatsapp_instances")
      .insert({
        name: data.name,
        display_name: data.displayName,
        status: qrCode ? "qr_pending" : "disconnected",
        qr_code: qrCode,
        webhook_url: data.webhookUrl,
        instance_data: { connected, qrCode } as any,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { instance: row, qr: qrCode };
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

    // Clear references in conversations
    await supabaseAdmin
      .from("conversations")
      .update({ instance_id: null, updated_at: new Date().toISOString() })
      .eq("instance_id", target.id);

    // Delete from database
    const { error, count } = await supabaseAdmin
      .from("whatsapp_instances")
      .delete({ count: "exact" })
      .eq("id", target.id);

    if (error) throw new Error(error.message);
    return { ok: true, count };
  }

  async syncInstance(name: string) {
    try {
      const status = await this.fetch("/instance/status", {
        method: "GET",
      });

      const isConnected = status?.status === "connected" || status?.state === "connected";
      const phoneNumber = status?.phoneNumber || status?.phone || null;

      const update: any = {
        status: isConnected ? "connected" : "disconnected",
        updated_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
      };

      if (phoneNumber) update.phone_number = phoneNumber;
      if (isConnected) update.qr_code = null;

      await supabaseAdmin.from("whatsapp_instances").update(update).eq("name", name);

      return { status: isConnected ? "connected" : "disconnected", phone: phoneNumber };
    } catch (err) {
      console.error("Error syncing Stevo instance:", err);
      await supabaseAdmin
        .from("whatsapp_instances")
        .update({
          status: "error",
          updated_at: new Date().toISOString(),
        })
        .eq("name", name);
      throw err;
    }
  }

  async disconnectInstance(name: string) {
    await this.fetch("/instance/disconnect", {
      method: "POST",
      body: JSON.stringify({ instanceName: name }),
    });

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

  async sendMessage(phoneNumber: string, message: string) {
    return this.fetch("/message/send", {
      method: "POST",
      body: JSON.stringify({
        number: phoneNumber,
        text: message,
      }),
    });
  }
}

export const stevoService = StevoService.getInstance();
