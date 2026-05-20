// Server-only W-API client (https://docs.w-api.app).
// Auth: per-instance Bearer token + ?instanceId= query param on every endpoint.

export type WapiCreds = { instanceId: string; token: string };

const BASE = 'https://api.w-api.app';

export async function wapiFetch(
  path: string,
  init: RequestInit = {},
  creds: WapiCreds,
): Promise<any> {
  const url = new URL(`${BASE}${path}`);
  if (!url.searchParams.get('instanceId')) {
    url.searchParams.set('instanceId', creds.instanceId);
  }
  const ctrl = new AbortController();
  const timeoutMs = (init as any)?.timeoutMs ?? 12000;
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(url.toString(), {
      ...init,
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${creds.token}`,
        ...(init.headers || {}),
      },
    });
  } catch (e: any) {
    clearTimeout(t);
    if (e?.name === 'AbortError') throw new Error(`W-API timeout após ${timeoutMs}ms`);
    throw e;
  }
  clearTimeout(t);
  const contentType = res.headers.get('content-type') || '';
  if (res.ok && contentType.startsWith('image/')) {
    const bytes = await res.arrayBuffer();
    return `data:${contentType.split(';')[0]};base64,${Buffer.from(bytes).toString('base64')}`;
  }
  const text = await res.text();
  let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) {
    const msg = typeof body === 'string' ? body : (body?.message || body?.error || res.statusText);
    throw new Error(`W-API ${res.status}: ${Array.isArray(msg) ? msg.join('; ') : msg}`);
  }
  return body;
}

// Status check: returns true if WhatsApp is connected to the instance.
export async function wapiIsConnected(creds: WapiCreds): Promise<boolean> {
  try {
    const r = await wapiFetch(`/v1/instance/status-instance`, { method: 'GET' }, creds);
    return !!(r?.connected === true || r?.status === 'connected' || r?.connectionStatus === 'connected');
  } catch {
    return false;
  }
}

// QR code: W-API documents image=disable for base64 and image=enable for raw PNG.
export async function wapiGetQr(creds: WapiCreds): Promise<{ qr: string | null; connected: boolean }> {
  // First check connection status — once paired, qr-code endpoint stops returning a QR.
  const alreadyConnected = await wapiIsConnected(creds);
  if (alreadyConnected) return { qr: null, connected: true };

  try {
    const r = await wapiFetch(`/v1/instance/qr-code?image=disable`, { method: 'GET' }, creds);
    const qr = typeof r === 'string' ? r : (r?.qrcode || r?.qrCode || r?.qr || r?.base64 || r?.image || r?.value || null);
    const connected = !!(r?.connected || r?.status === 'connected');
    return { qr, connected };
  } catch (e: any) {
    if (/conectad|connected|already/i.test(e?.message || '')) return { qr: null, connected: true };
    // Re-check status in case the QR endpoint errored because we just paired.
    const c = await wapiIsConnected(creds);
    if (c) return { qr: null, connected: true };
    throw e;
  }
}

export function normalizeWapiStatus(raw: any): 'connected' | 'disconnected' | 'connecting' {
  const s = String(raw?.status ?? raw?.connectionStatus ?? raw ?? '').toLowerCase();
  if (raw?.connected === true || s === 'connected' || s === 'open') return 'connected';
  if (s === 'connecting' || s === 'qr' || s === 'qrcode' || s === 'pairing') return 'connecting';
  return 'disconnected';
}

// Register all webhook event URLs on the W-API instance.
// W-API does NOT push events until each event-type webhook URL is set per event.
export async function wapiSetWebhooks(creds: WapiCreds, url: string): Promise<void> {
  const endpoints = [
    'update-webhook-received',
    'update-webhook-connected',
    'update-webhook-disconnected',
    'update-webhook-delivery',
    'update-webhook-message-status',
  ];
  await Promise.all(
    endpoints.map((ep) =>
      wapiFetch(`/v1/webhook/${ep}`, { method: 'PUT', body: JSON.stringify({ value: url }) }, creds)
        .catch((e) => console.warn(`[wapiSetWebhooks] ${ep} failed:`, e?.message)),
    ),
  );
}

export async function wapiGetContacts(creds: WapiCreds): Promise<any[]> {
  try {
    // Tenta /v1/contact/all que é o padrão W-API para listar contatos da instância
    const res = await wapiFetch('/v1/contact/all', { method: 'GET' }, creds);
    return Array.isArray(res) ? res : (res?.contacts || res?.data || []);
  } catch (e: any) {
    console.error('[wapiGetContacts] error:', e?.message);
    throw e;
  }
}


