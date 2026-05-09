import { createFileRoute } from '@tanstack/react-router';
import { KanbanSquare, Plus, MoreHorizontal, User, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useKanban } from '@/hooks/useKanban';
import { DndContext, closestCorners } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';

export const Route = createFileRoute('/atendimento/kanban')({
  component: KanbanPage,
});

const COLUMNS = [
  { id: 'bot', title: 'Novo Lead', color: '#00CCEE' },
  { id: 'queue', title: 'Fila de Espera', color: '#F59E0B' },
  { id: 'active', title: 'Em Atendimento', color: '#8B5CF6' },
  { id: 'resolved', title: 'Finalizado', color: '#10B981' },
];

function KanbanPage() {
  const { items, loading, moveCard } = useKanban();

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Se soltou em cima de uma coluna (o id da coluna é o status)
    if (COLUMNS.some(c => c.id === overId)) {
      moveCard(activeId, overId);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col" style={{ background: '#0A0A0F' }}>
        <div className="p-8 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Fluxo de Negociações</h1>
            <p className="text-zinc-500 text-sm">Arraste os cards para mudar o status do atendimento.</p>
          </div>
          <button className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
            <Plus className="h-4 w-4" />
            Novo Card
          </button>
        </div>

        <div className="flex-1 overflow-x-auto p-8 pt-4 flex gap-6 custom-scrollbar">
          {COLUMNS.map((col) => (
            <KanbanColumn 
              key={col.id} 
              column={col} 
              cards={items.filter(i => i.status === col.id)} 
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
}

function KanbanColumn({ column, cards }: any) {
  return (
    <div className="w-80 shrink-0 flex flex-col h-full bg-[#0F1117]/50 rounded-2xl border border-[#1F232E]">
      <div className="p-4 flex items-center justify-between border-b border-[#1F232E]">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: column.color }} />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{column.title}</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1F232E] text-zinc-500">{cards.length}</span>
        </div>
        <button className="p-1 text-zinc-600 hover:text-white transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
        {cards.map((card: any) => (
          <KanbanCard key={card.id} card={card} />
        ))}

        {cards.length === 0 && (
          <div className="h-32 border-2 border-dashed border-[#1F232E] rounded-2xl flex flex-col items-center justify-center text-zinc-700">
            <AlertCircle className="h-5 w-5 mb-2 opacity-20" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-20">Vazio</span>
          </div>
        )}
      </div>
    </div>
  );
}

import { useDraggable } from '@dnd-kit/core';

function KanbanCard({ card }: any) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : undefined,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className="bg-[#151821] border border-[#1F232E] rounded-xl p-4 hover:border-cyan-500/30 transition-all cursor-grab active:cursor-grabbing group"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
          {card.channel}
        </span>
        <button className="text-zinc-600 hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <h4 className="text-sm font-semibold text-zinc-200 mb-1 truncate">{card.contact?.name || card.whatsapp_chat_id}</h4>
      <p className="text-xs text-zinc-500 mb-4 line-clamp-2">{card.last_message || 'Sem mensagens'}</p>
      
      <div className="flex items-center justify-between pt-3 border-t border-[#1F232E]">
        <div className="flex items-center gap-1.5 text-zinc-600">
          <Clock className="h-3 w-3" />
          <span className="text-[10px] font-medium">
            {new Date(card.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="h-5 w-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-[9px] text-cyan-500 font-bold uppercase">
          {card.contact?.name?.substring(0, 2) || 'WC'}
        </div>
      </div>
    </div>
  );
}
