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
  const text = await res.text();
  let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) {
    const msg = typeof body === 'string' ? body : (body?.message || body?.error || res.statusText);
    throw new Error(`W-API ${res.status}: ${Array.isArray(msg) ? msg.join('; ') : msg}`);
  }
  return body;
}

// QR code (image=enable returns base64 PNG; disable returns code text)
export async function wapiGetQr(creds: WapiCreds): Promise<{ qr: string | null; connected: boolean }> {
  try {
    const r = await wapiFetch(`/v1/instance/qr-code?image=enable`, { method: 'GET' }, creds);
    // Common shapes: { qrCode: 'data:image/png;base64,...' } or { base64: '...' } or { connected: true }
    const qr = r?.qrCode || r?.qr || r?.base64 || r?.image || null;
    const connected = !!(r?.connected || r?.status === 'connected');
    return { qr, connected };
  } catch (e: any) {
    // If already connected, the endpoint may 4xx; treat as connected unknown.
    if (/conectad|connected|already/i.test(e?.message || '')) return { qr: null, connected: true };
    throw e;
  }
}

export function normalizeWapiStatus(raw: any): 'connected' | 'disconnected' | 'connecting' {
  const s = String(raw?.status ?? raw?.connectionStatus ?? raw ?? '').toLowerCase();
  if (raw?.connected === true || s === 'connected' || s === 'open') return 'connected';
  if (s === 'connecting' || s === 'qr' || s === 'qrcode' || s === 'pairing') return 'connecting';
  return 'disconnected';
}
