import { createFileRoute } from '@tanstack/react-router';
import { useQuickReplies } from '@/hooks/useQuickReplies';
import { MessageSquare, Plus, Search, Command, Loader2, Trash2 } from 'lucide-react';

export const Route = createFileRoute('/atendimento/respostas')({
  component: RespostasPage,
});

function RespostasPage() {
  const { replies, loading } = useQuickReplies();

  return (
    <div className="h-full flex flex-col" style={{ background: '#0A0A0F' }}>
      <div className="p-8 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Respostas Rápidas</h1>
          <p className="text-zinc-500 text-sm">Crie templates de mensagens para agilizar o atendimento.</p>
        </div>
        <button className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
          <Plus className="h-4 w-4" />
          Nova Resposta
        </button>
      </div>

      <div className="px-8 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por título ou atalho..."
            className="w-full max-w-md bg-[#151821] border border-[#1F232E] rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 pb-8 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {replies.map((reply) => (
              <div
                key={reply.id}
                className="bg-[#0F1117] rounded-2xl border border-[#1F232E] p-6 hover:border-cyan-500/30 transition-all group relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                      <MessageSquare className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{reply.title}</h3>
                      <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] mt-0.5">
                        <Command className="h-3 w-3" />
                        <span className="bg-[#1F232E] px-1.5 py-0.5 rounded text-cyan-400 font-mono">/{reply.shortcut}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-zinc-400 line-clamp-3 mb-4 leading-relaxed">
                  {reply.content}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#1F232E]">
                  <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">
                    {reply.use_count} usos
                  </span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {replies.length === 0 && (
              <div className="col-span-full text-center py-20 bg-[#151821] rounded-2xl border border-[#1F232E]">
                <p className="text-zinc-500">Nenhuma resposta rápida cadastrada.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
