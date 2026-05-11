import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useQuickReplies } from '@/hooks/useQuickReplies';
import { MessageSquare, Plus, Search, Command, Loader2, Trash2, X, Save, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { QuickReply } from '@/types/crm';

export const Route = createFileRoute('/atendimento/respostas')({
  component: RespostasPage,
});

function RespostasPage() {
  const { replies, loading, createReply, updateReply, deleteReply } = useQuickReplies();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Partial<QuickReply> | null>(null);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return replies.filter(r => !s || r.title.toLowerCase().includes(s) || (r.shortcut || '').toLowerCase().includes(s));
  }, [replies, search]);

  const save = async () => {
    if (!editing?.title || !editing?.content) { toast.error('Preencha título e conteúdo'); return; }
    const shortcut = (editing.shortcut || '').replace(/^\/+/, '').toLowerCase();
    try {
      if (editing.id) await updateReply(editing.id, { title: editing.title, content: editing.content, shortcut });
      else await createReply(editing.title, editing.content, shortcut);
      toast.success('Resposta salva');
      setEditing(null);
    } catch (e: any) { toast.error('Erro: ' + e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir esta resposta?')) return;
    try { await deleteReply(id); toast.success('Excluída'); } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#0A0A0F' }}>
      <div className="p-8 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Respostas Rápidas</h1>
          <p className="text-zinc-500 text-sm">Use <span className="font-mono text-cyan-400">/atalho</span> no chat para inserir.</p>
        </div>
        <button onClick={() => setEditing({ title: '', content: '', shortcut: '' })} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg font-semibold text-sm">
          <Plus className="h-4 w-4" /> Nova Resposta
        </button>
      </div>

      <div className="px-8 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Buscar por título ou atalho..."
            className="w-full max-w-md bg-[#151821] border border-[#1F232E] rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 pb-8 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-cyan-400" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((reply) => (
              <div key={reply.id} className="bg-[#0F1117] rounded-2xl border border-[#1F232E] p-6 hover:border-cyan-500/30 transition-all group relative">
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
                <p className="text-sm text-zinc-400 line-clamp-3 mb-4 leading-relaxed">{reply.content}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#1F232E]">
                  <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">{reply.use_count} usos</span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditing(reply)} className="p-2 text-zinc-500 hover:text-cyan-400"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => remove(reply.id)} className="p-2 text-zinc-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-20 bg-[#151821] rounded-2xl border border-[#1F232E]">
                <p className="text-zinc-500">Nenhuma resposta cadastrada.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setEditing(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-[#0F1117] border border-[#1F232E]"
            >
              <div className="p-5 border-b border-[#1F232E] flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{editing.id ? 'Editar' : 'Nova'} resposta rápida</h3>
                <button onClick={() => setEditing(null)} className="text-zinc-500 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Título</label>
                  <input value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full bg-[#151821] border border-[#1F232E] rounded-lg px-3 py-2 text-sm text-zinc-200" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Atalho (sem barra)</label>
                  <input value={editing.shortcut || ''} onChange={(e) => setEditing({ ...editing, shortcut: e.target.value.replace(/^\/+/, '').toLowerCase() })} placeholder="ex: ola" className="w-full bg-[#151821] border border-[#1F232E] rounded-lg px-3 py-2 text-sm font-mono text-cyan-400" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Conteúdo</label>
                  <textarea rows={5} value={editing.content || ''} onChange={(e) => setEditing({ ...editing, content: e.target.value })} className="w-full bg-[#151821] border border-[#1F232E] rounded-lg px-3 py-2 text-sm text-zinc-200" />
                </div>
              </div>
              <div className="p-4 border-t border-[#1F232E] flex justify-end gap-3">
                <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white">Cancelar</button>
                <button onClick={save} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-black font-semibold text-sm hover:bg-cyan-400">
                  <Save className="h-4 w-4" /> Salvar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
