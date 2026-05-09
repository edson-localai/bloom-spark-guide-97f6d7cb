import { createFileRoute } from '@tanstack/react-router';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { Smartphone, RefreshCw, Plus, CheckCircle2, XCircle, Loader2, QrCode, Shield } from 'lucide-react';

export const Route = createFileRoute('/atendimento/whatsapp')({
  component: WhatsAppPage,
});

function WhatsAppPage() {
  const { instances, loading, fetchInstances } = useWhatsApp();

  return (
    <div className="h-full flex flex-col" style={{ background: '#0A0A0F' }}>
      <div className="p-8 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Conexões WhatsApp</h1>
          <p className="text-zinc-500 text-sm">Gerencie as instâncias e aparelhos conectados ao CRM.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchInstances()}
            className="p-2.5 bg-[#151821] border border-[#1F232E] text-zinc-400 hover:text-white rounded-lg transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
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
              {/* Background Glow */}
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
                    <p className="text-sm text-zinc-500 font-mono">{inst.phone_number || 'Sem número'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#151821] rounded-2xl p-4 border border-[#1F232E]">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      {inst.status === 'connected' ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-semibold text-emerald-500">Conectado</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-semibold text-red-500 italic">Desconectado</span>
                        </>
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

                <div className="pt-4 flex gap-3">
                  <button className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 py-2.5 rounded-xl text-sm font-semibold transition-all">
                    Reiniciar Instância
                  </button>
                  <button className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2.5 rounded-xl text-sm font-semibold transition-all">
                    Desconectar
                  </button>
                </div>
              </div>

              {/* QR Code Section (Mock) */}
              <div className="w-full md:w-48 shrink-0 flex flex-col items-center justify-center p-6 bg-[#151821] rounded-2xl border border-[#1F232E] relative">
                {inst.status === 'connected' ? (
                  <div className="text-center space-y-2">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto opacity-20" />
                    <p className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-wider">Pronto para uso</p>
                  </div>
                ) : (
                  <>
                    <QrCode className="h-32 w-32 text-zinc-700 opacity-40" />
                    <div className="absolute inset-0 flex items-center justify-center bg-[#151821]/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer">
                      <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20">
                        Gerar QR Code
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}

        {instances.length === 0 && !loading && (
          <div className="col-span-full text-center py-20 bg-[#151821] rounded-2xl border border-[#1F232E]">
            <p className="text-zinc-500">Nenhuma instância de WhatsApp encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
