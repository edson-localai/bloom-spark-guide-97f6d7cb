import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import {
  Smartphone, RefreshCw, Plus, CheckCircle2, XCircle, Loader2, QrCode,
  Shield, ShieldAlert, X, Trash2, Settings as SettingsIcon, Save,
} from 'lucide-react';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  createWhatsAppInstance,
  getWhatsAppQrCode,
  syncWhatsAppInstance,
  restartWhatsAppInstance,
  disconnectWhatsAppInstance,
  deleteWhatsAppInstance,
} from '@/lib/whatsapp.functions';

export const Route = createFileRoute('/atendimento/whatsapp')({
  component: WhatsAppPage,
});

function WhatsAppPage() {
  const { roles, loading: authLoading } = useCrmAuth();
  const isSupervisor = roles.includes('admin') || roles.includes('supervisor');
  const isAdmin = roles.includes('admin');
  const { instances, loading, fetchInstances } = useWhatsApp();

  const [showCreate, setShowCreate] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [qrModal, setQrModal] = useState<{ name: string; qr: string | null } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  if (authLoading) return null;

  if (!isSupervisor) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-[#0A0A0F]">
        <div className="max-w-md text-center bg-[#0F1117] border border-[#1F232E] rounded-3xl p-12">
          <div className="h-16 w-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Você não tem permissão para acessar as Conexões de WhatsApp. Este módulo é restrito a supervisores e administradores.
          </p>
        </div>
      </div>
    );
  }

  const runAction = async (key: string, fn: () => Promise<any>, success: string) => {
    setBusy(key);
    try {
      await fn();
      toast.success(success);
      await fetchInstances();
    } catch (err: any) {
      toast.error(err?.message || 'Erro');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#0A0A0F' }}>
      <div className="p-8 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Conexões WhatsApp</h1>
          <p className="text-zinc-500 text-sm">Gerencie as instâncias e aparelhos conectados ao CRM.</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <button
              onClick={() => setShowConfig(true)}
              className="p-2.5 bg-[#151821] border border-[#1F232E] text-zinc-400 hover:text-white rounded-lg transition-colors"
              title="Configurar API"
            >
              <SettingsIcon className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => fetchInstances()}
            className="p-2.5 bg-[#151821] border border-[#1F232E] text-zinc-400 hover:text-white rounded-lg transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nova Conexão
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 xl:grid-cols-2 gap-8 overflow-auto custom-scrollbar">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        ) : (
          instances.map((inst) => (
            <div
              key={inst.id}
              className="bg-[#0F1117] rounded-3xl border border-[#1F232E] p-8 flex flex-col md:flex-row gap-8 hover:border-cyan-500/20 transition-all relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-10 pointer-events-none transition-colors ${
                inst.status === 'connected' ? 'bg-emerald-500' : 'bg-red-500'
              }`} />

              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border ${
                    inst.status === 'connected'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-500'
                  }`}>
                    <Smartphone className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{inst.display_name}</h3>
                    <div className="flex flex-col">
                      <p className="text-xs text-zinc-500 font-mono">ID: {inst.name}</p>
                      {inst.phone_number && <p className="text-xs text-zinc-500 font-mono">Fone: {inst.phone_number}</p>}
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 space-y-2">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-amber-500/60">Credenciais da Instância</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-zinc-600 font-mono">Instance Name:</span>
                        <span className="text-[10px] text-zinc-400 font-mono">{inst.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-zinc-600 font-mono">API Key:</span>
                        <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[150px]" title={inst.instance_key || ''}>
                          {inst.instance_key || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#151821] rounded-2xl p-4 border border-[#1F232E]">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      {inst.status === 'connected' ? (
                        <><CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-semibold text-emerald-500">Conectado</span></>
                      ) : inst.status === 'connecting' ? (
                        <><Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
                          <span className="text-sm font-semibold text-amber-500">Conectando</span></>
                      ) : (
                        <><XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-semibold text-red-500 italic">Desconectado</span></>
                      )}
                    </div>
                  </div>
                  <div className="bg-[#151821] rounded-2xl p-4 border border-[#1F232E]">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 mb-1">Sessão</p>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-cyan-500" />
                      <span className="text-sm font-semibold text-zinc-300">Criptografada</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-2">
                  <button
                    disabled={!!busy}
                    onClick={() => runAction(`sync-${inst.name}`, () => syncWhatsAppInstance({ data: { name: inst.name } }), 'Status atualizado')}
                    className="flex-1 min-w-[120px] bg-[#151821] hover:bg-[#1F232E] text-zinc-200 border border-[#1F232E] py-2.5 rounded-xl text-sm font-semibold transition-all"
                  >
                    Sincronizar
                  </button>
                  <button
                    disabled={!!busy}
                    onClick={() => runAction(`restart-${inst.name}`, () => restartWhatsAppInstance({ data: { name: inst.name } }), 'Instância reiniciada')}
                    className="flex-1 min-w-[120px] bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  >
                    Reiniciar
                  </button>
                  <button
                    disabled={!!busy}
                    onClick={() => runAction(`logout-${inst.name}`, () => disconnectWhatsAppInstance({ data: { name: inst.name } }), 'Desconectado')}
                    className="flex-1 min-w-[120px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  >
                    Desconectar
                  </button>
                  {isAdmin && (
                    <button
                      disabled={!!busy}
                      onClick={() => {
                        if (!confirm(`Excluir definitivamente a instância "${inst.name}"?`)) return;
                        runAction(`del-${inst.name}`, () => deleteWhatsAppInstance({ data: { id: inst.id, name: inst.name } }), 'Instância excluída');
                      }}
                      className="p-2.5 bg-red-500/5 hover:bg-red-500/15 text-red-500 border border-red-500/10 rounded-xl transition-all"
                      title="Excluir instância"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="w-full md:w-48 shrink-0 flex flex-col items-center justify-center p-6 bg-[#151821] rounded-2xl border border-[#1F232E] relative">
                {inst.status === 'connected' ? (
                  <div className="text-center space-y-2">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto opacity-30" />
                    <p className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-wider">Pronto para uso</p>
                  </div>
                ) : (
                  <button
                    disabled={!!busy}
                    onClick={async () => {
                      setBusy(`qr-${inst.name}`);
                      try {
                        const res: any = await getWhatsAppQrCode({ data: { name: inst.name } });
                        setQrModal({ name: inst.name, qr: res?.qr || inst.qr_code || null });
                      } catch (err: any) {
                        toast.error(err?.message || 'Erro ao gerar QR');
                      } finally {
                        setBusy(null);
                      }
                    }}
                    className="flex flex-col items-center gap-2 group/qr"
                  >
                    <QrCode className="h-32 w-32 text-zinc-700 opacity-40 group-hover/qr:text-cyan-500 group-hover/qr:opacity-100 transition-all" />
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20">
                      {busy === `qr-${inst.name}` ? 'Gerando...' : 'Gerar QR Code'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {instances.length === 0 && !loading && (
          <div className="col-span-full text-center py-20 bg-[#151821] rounded-2xl border border-[#1F232E]">
            <p className="text-zinc-500 mb-4">Nenhuma instância de WhatsApp configurada.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg font-semibold text-sm"
            >
              <Plus className="h-4 w-4" /> Criar primeira instância
            </button>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateInstanceModal
          onClose={() => setShowCreate(false)}
          onCreated={(qr, name) => {
            setShowCreate(false);
            setQrModal({ name, qr });
            fetchInstances();
          }}
        />
      )}
      {showConfig && isAdmin && (
        <ConfigApiModal onClose={() => setShowConfig(false)} />
      )}
      {qrModal && <QrModal data={qrModal} onClose={() => { setQrModal(null); fetchInstances(); }} />}
    </div>
  );
}

// ============== MODALS ==============

function CreateInstanceModal({ onClose, onCreated }: { onClose: () => void; onCreated: (qr: string | null, name: string) => void }) {
  const [provider, setProvider] = useState<'evolution' | 'wapi'>('evolution');
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [wapiInstanceId, setWapiInstanceId] = useState('');
  const [wapiToken, setWapiToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload: any = { provider, name: name.trim(), displayName: displayName.trim() };
      if (provider === 'evolution') {
        payload.apiKey = apiKey.trim() || undefined;
      } else {
        payload.wapiInstanceId = wapiInstanceId.trim();
        payload.wapiToken = wapiToken.trim();
      }
      const res: any = await createWhatsAppInstance({ data: payload });
      toast.success('Instância criada! Escaneie o QR Code para conectar.');
      onCreated(res?.qr || null, name.trim());
    } catch (err: any) {
      const message = err?.message || 'Erro ao criar instância';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-[#0F1117] border border-[#1F232E] rounded-2xl p-6 w-full max-w-md space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Nova Conexão WhatsApp</h3>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <div>
          <label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">Provedor</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setProvider('evolution')}
              className={`py-2 rounded-lg text-sm font-semibold border transition-all ${
                provider === 'evolution'
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                  : 'bg-[#151821] border-[#1F232E] text-zinc-400 hover:text-white'
              }`}
            >
              Evolution API
            </button>
            <button
              type="button"
              onClick={() => setProvider('wapi')}
              className={`py-2 rounded-lg text-sm font-semibold border transition-all ${
                provider === 'wapi'
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                  : 'bg-[#151821] border-[#1F232E] text-zinc-400 hover:text-white'
              }`}
            >
              W-API
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">Identificador (interno)</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
            placeholder="hcb-principal"
            required
            className="w-full bg-[#151821] border border-[#1F232E] rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none"
          />
          <p className="text-[10px] text-zinc-600 mt-1">Apenas letras, números, _ e -. Não pode ser alterado depois.</p>
        </div>
        <div>
          <label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">Nome de exibição</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="HCB Atendimento"
            required
            className="w-full bg-[#151821] border border-[#1F232E] rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none"
          />
        </div>

        {provider === 'evolution' ? (
          <div>
            <label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">API Key (opcional)</label>
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Chave da instância (se já existir)"
              className="w-full bg-[#151821] border border-[#1F232E] rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none"
            />
            <p className="text-[10px] text-zinc-600 mt-1">Deixe em branco para gerar uma nova chave automaticamente.</p>
          </div>
        ) : (
          <>
            <div>
              <label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">W-API Instance ID</label>
              <input
                value={wapiInstanceId}
                onChange={(e) => setWapiInstanceId(e.target.value)}
                placeholder="ID da instância no painel W-API"
                required
                className="w-full bg-[#151821] border border-[#1F232E] rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none"
              />
              <p className="text-[10px] text-zinc-600 mt-1">Disponível em painel.w-api.app após criar a instância.</p>
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">W-API Token (Bearer)</label>
              <input
                type="password"
                value={wapiToken}
                onChange={(e) => setWapiToken(e.target.value)}
                placeholder="Token de autenticação da instância"
                required
                className="w-full bg-[#151821] border border-[#1F232E] rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none"
              />
              <p className="text-[10px] text-zinc-600 mt-1">
                Configure o webhook no painel da W-API para:&nbsp;
                <code className="text-cyan-400">/api/public/wapi/webhook</code>
              </p>
            </div>
          </>
        )}
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
        <button
          disabled={submitting}
          type="submit"
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50"
        >
          {submitting ? 'Criando...' : 'Criar e gerar QR Code'}
        </button>
      </form>
    </div>
  );
}

function QrModal({ data, onClose }: { data: { name: string; qr: string | null }; onClose: () => void }) {
  const [qr, setQr] = useState<string | null>(data.qr);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [attempts, setAttempts] = useState(0);
  const [lastPollAt, setLastPollAt] = useState<Date | null>(null);
  const [stopped, setStopped] = useState(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    let n = 0;
    async function poll() {
      if (!data.qr && !cancelled) {
        try {
          const first: any = await getWhatsAppQrCode({ data: { name: data.name } });
          if (cancelled) return;
          if (first?.connected) {
            setStatus('connected');
            setQr(null);
            setTimeout(() => { if (!cancelled) onCloseRef.current(); }, 1500);
            return;
          }
          if (first?.qr) setQr(first.qr);
        } catch {
          if (cancelled) return;
          setStatus('disconnected');
        }
      }
      while (!cancelled && n < 40) {
        n++;
        setAttempts(n);
        try {
          const res: any = await syncWhatsAppInstance({ data: { name: data.name } });
          if (cancelled) return;
          setLastPollAt(new Date());
          if (res?.status === 'connected') {
            setStatus('connected');
            setQr(null);
            setTimeout(() => { if (!cancelled) onCloseRef.current(); }, 1500);
            return;
          }
          setStatus(res?.status === 'disconnected' ? 'disconnected' : 'connecting');
        } catch {
          if (cancelled) return;
          setLastPollAt(new Date());
          setStatus('disconnected');
        }
        await new Promise((r) => setTimeout(r, 2500));
      }
      if (!cancelled) setStopped(true);
    }
    poll();
    return () => { cancelled = true; };
  }, [data.name, data.qr]);

  const src = qr
    ? (qr.startsWith('data:') ? qr : `data:image/png;base64,${qr.replace(/^data:image\/[^;]+;base64,/, '')}`)
    : null;

  const statusMeta =
    status === 'connected'
      ? { dot: 'bg-emerald-400', text: 'text-emerald-300', label: 'Conectado' }
      : status === 'disconnected'
      ? { dot: 'bg-red-400', text: 'text-red-300', label: 'Desconectado' }
      : { dot: 'bg-amber-400 animate-pulse', text: 'text-amber-300', label: 'Conectando...' };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-[#0F1117] border border-[#1F232E] rounded-2xl p-8 w-full max-w-sm text-center space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Escaneie no WhatsApp</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs">
          <span className={`h-2 w-2 rounded-full ${statusMeta.dot}`} />
          <span className={`font-semibold ${statusMeta.text}`}>{statusMeta.label}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-500">tentativa {attempts}{stopped ? ' (parado)' : ''}</span>
        </div>

        {status === 'connected' ? (
          <div className="py-12">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center">
              <span className="text-emerald-300 text-2xl">✓</span>
            </div>
            <p className="text-sm text-emerald-300 mt-3 font-semibold">WhatsApp conectado!</p>
          </div>
        ) : src ? (
          <div className="bg-white p-4 rounded-xl">
            <img src={src} alt="QR Code" className="w-full h-auto" />
          </div>
        ) : (
          <div className="py-12">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto" />
            <p className="text-xs text-zinc-500 mt-3">Aguardando QR Code...</p>
          </div>
        )}

        <p className="text-xs text-zinc-500 leading-relaxed">
          Abra o WhatsApp no celular → <b>Aparelhos conectados</b> → <b>Conectar um aparelho</b> e escaneie o código.
        </p>
        {lastPollAt && (
          <p className="text-[10px] text-zinc-600">
            Última verificação: {lastPollAt.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}

function ConfigApiModal({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['whatsapp_api_url', 'whatsapp_api_key']);
      const map = Object.fromEntries((data || []).map((r: any) => [r.key, r.value]));
      setUrl(map.whatsapp_api_url || '');
      setApiKey(map.whatsapp_api_key || '');
      setLoading(false);
    })();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await supabase.from('app_settings').upsert({ key: 'whatsapp_api_url', value: url.trim() }, { onConflict: 'key' });
      await supabase.from('app_settings').upsert({ key: 'whatsapp_api_key', value: apiKey.trim() }, { onConflict: 'key' });
      toast.success('Configuração salva!');
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSave} className="bg-[#0F1117] border border-[#1F232E] rounded-2xl p-6 w-full max-w-lg space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-cyan-500" />
            <h3 className="text-lg font-bold text-white">Configuração da Evolution API</h3>
          </div>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-cyan-400" /></div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">API URL</label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.seudominio.com"
                  required
                  className="w-full bg-[#151821] border border-[#1F232E] rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none"
                />
                <p className="text-[10px] text-zinc-600 mt-1">URL base da sua Evolution API (sem / no final).</p>
              </div>
              <div>
                <label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">Global API Key</label>
                <div className="relative">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Sua chave global da API"
                    required
                    className="w-full bg-[#151821] border border-[#1F232E] rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none"
                  />
                </div>
                <p className="text-[10px] text-zinc-600 mt-1">Chave de autenticação global configurada na Evolution API.</p>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-transparent hover:bg-white/5 text-zinc-400 py-2.5 rounded-lg font-semibold text-sm border border-[#1F232E]"
              >
                Cancelar
              </button>
              <button
                disabled={saving}
                type="submit"
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar Alterações
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
