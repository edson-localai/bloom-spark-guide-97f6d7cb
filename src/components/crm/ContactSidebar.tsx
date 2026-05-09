import { User, Car, Tag, MapPin, Calendar, FileText, ChevronRight, Clock, History, CalendarClock, XCircle, CheckCircle2 } from 'lucide-react';
import { Contact } from '@/types/crm';
import { useTimeline } from '@/hooks/useTimeline';
import { useScheduledMessages } from '@/hooks/useScheduledMessages';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface ContactSidebarProps {
  contact: Contact | null;
  conversationId?: string | null;
}

export function ContactSidebar({ contact, conversationId }: ContactSidebarProps) {
  if (!contact) return null;

  return (
    <div className="w-80 shrink-0 h-full flex flex-col overflow-y-auto custom-scrollbar" style={{ background: '#0F1117', borderLeft: '1px solid #1F232E' }}>
      {/* Profile Info */}
      <div className="p-6 text-center border-b border-[#1F232E]">
        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mx-auto flex items-center justify-center mb-4">
          <User className="h-10 w-10 text-cyan-500" />
        </div>
        <h3 className="text-white font-semibold">{contact.name || 'Sem nome'}</h3>
        <p className="text-xs text-zinc-500 mt-1">{contact.phone}</p>
      </div>

      {/* Vehicle Section */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Veículo</h4>
          <button className="text-[10px] text-cyan-500 hover:underline">Editar</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Car className="h-3.5 w-3.5" />
              <span className="text-[10px]">Marca/Modelo</span>
            </div>
            <p className="text-xs text-zinc-200 font-medium">
              {contact.vehicle_brand || '-'} {contact.vehicle_model || ''}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-[10px]">Ano</span>
            </div>
            <p className="text-xs text-zinc-200 font-medium">{contact.vehicle_year || '-'}</p>
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="px-6 py-4 border-t border-[#1F232E] space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Tags</h4>
          <Tag className="h-3 w-3 text-zinc-500" />
        </div>
        <div className="flex flex-wrap gap-2">
          {contact.tags?.length > 0 ? (
            contact.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-[#1F232E] text-zinc-400 border border-[#1F232E]">
                {tag}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-zinc-600 italic">Nenhuma tag</span>
          )}
          <button className="text-[10px] px-2 py-0.5 rounded border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300">
            + Adicionar
          </button>
        </div>
      </div>

      {/* Scheduled Messages Section */}
      <div className="px-6 py-4 border-t border-[#1F232E] space-y-4 max-h-60 flex flex-col">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Agendamentos</h4>
          <CalendarClock className="h-3 w-3 text-zinc-500" />
        </div>
        <ScheduledList conversationId={conversationId} />
      </div>

      {/* Timeline Section */}
      <div className="px-6 py-4 border-t border-[#1F232E] space-y-4 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Linha do Tempo</h4>
          <History className="h-3 w-3 text-zinc-500" />
        </div>
        <Timeline contactId={contact.id} />
      </div>

      {/* Quick Actions */}
      <div className="p-6 space-y-2 border-t border-[#1F232E]">
        <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#151821] border border-[#1F232E] text-sm text-zinc-300 hover:border-cyan-500/30 hover:text-white transition-all group">
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-cyan-500" />
            <span>Gerar Proposta</span>
          </div>
          <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-cyan-500 transition-colors" />
        </button>
      </div>
    </div>
  );
}

function Timeline({ contactId }: { contactId: string }) {
  const { events, loading } = useTimeline(contactId);

  if (loading) return <div className="text-[10px] text-zinc-600 animate-pulse">Carregando eventos...</div>;

  return (
    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
      {events.map((ev) => (
        <div key={ev.id} className="relative pl-4 border-l border-[#1F232E]">
          <div className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-cyan-500/40" />
          <p className="text-[11px] text-zinc-300 font-medium">
            {ev.action === 'kanban.move' ? 'Status alterado' : ev.action}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Clock className="h-3 w-3 text-zinc-600" />
            <span className="text-[9px] text-zinc-600">
              {formatDistanceToNow(new Date(ev.created_at), { addSuffix: true, locale: ptBR })}
            </span>
          </div>
          {ev.new_data?.status && (
            <p className="text-[9px] text-zinc-500 mt-1 uppercase font-bold tracking-widest">
              Para: {ev.new_data.status}
            </p>
          )}
        </div>
      ))}
      {events.length === 0 && (
        <p className="text-[10px] text-zinc-600 italic">Nenhuma atividade recente.</p>
      )}
    </div>
  );
}
