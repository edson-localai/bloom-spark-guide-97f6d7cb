import { createFileRoute } from '@tanstack/react-router';
import { KanbanSquare, Plus, MoreHorizontal, User, Clock, AlertCircle } from 'lucide-react';

export const Route = createFileRoute('/atendimento/kanban')({
  component: KanbanPage,
});

const COLUMNS = [
  { id: 'novo', title: 'Novo Lead', color: '#00CCEE' },
  { id: 'orcamento', title: 'Orçamento', color: '#F59E0B' },
  { id: 'aguardando', title: 'Aguardando Peça', color: '#8B5CF6' },
  { id: 'finalizado', title: 'Finalizado', color: '#10B981' },
];

function KanbanPage() {
  return (
    <div className="h-full flex flex-col" style={{ background: '#0A0A0F' }}>
      <div className="p-8 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Fluxo de Negociações</h1>
          <p className="text-zinc-500 text-sm">Acompanhe o progresso de cada orçamento e serviço.</p>
        </div>
        <button className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
          <Plus className="h-4 w-4" />
          Novo Card
        </button>
      </div>

      <div className="flex-1 overflow-x-auto p-8 pt-4 flex gap-6 custom-scrollbar">
        {COLUMNS.map((col) => (
          <div key={col.id} className="w-80 shrink-0 flex flex-col h-full bg-[#0F1117]/50 rounded-2xl border border-[#1F232E]">
            <div className="p-4 flex items-center justify-between border-b border-[#1F232E]">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ background: col.color }} />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{col.title}</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1F232E] text-zinc-500">0</span>
              </div>
              <button className="p-1 text-zinc-600 hover:text-white transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
              {/* Mock Card */}
              {col.id === 'novo' && (
                <div className="bg-[#151821] border border-[#1F232E] rounded-xl p-4 hover:border-cyan-500/30 transition-all cursor-grab active:cursor-grabbing group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                      MANUTENÇÃO
                    </span>
                    <button className="text-zinc-600 hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-200 mb-1">Peça Compressor Denso</h4>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-4">
                    <User className="h-3 w-3" />
                    <span>João Silva - Hilux 2022</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#1F232E]">
                    <div className="flex items-center gap-1.5 text-amber-500/80">
                      <Clock className="h-3 w-3" />
                      <span className="text-[10px] font-medium">2h atrás</span>
                    </div>
                    <div className="flex -space-x-2">
                      <div className="h-5 w-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-[9px] text-cyan-500 font-bold">
                        CL
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State Mock */}
              {col.id !== 'novo' && (
                <div className="h-32 border-2 border-dashed border-[#1F232E] rounded-2xl flex flex-col items-center justify-center text-zinc-700">
                  <AlertCircle className="h-5 w-5 mb-2 opacity-20" />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-20">Vazio</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
