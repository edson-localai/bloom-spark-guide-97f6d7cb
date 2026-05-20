import { useState, useEffect } from 'react';
import { User, Car, Tag, Calendar, FileText, ChevronRight, Clock, History, CalendarClock, XCircle, CheckCircle2, Mail, MapPin, IdCard, Edit2, Plus, Users, UserCheck } from 'lucide-react';
import { Contact, LeadStage } from '@/types/crm';
import { useTimeline } from '@/hooks/useTimeline';
import { useScheduledMessages } from '@/hooks/useScheduledMessages';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { ContactEditor } from './ContactEditor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContactSidebarProps {
  contact: Contact | null;
  conversationId?: string | null;
  variant?: 'desktop' | 'mobile';
}

const STAGE_COLORS: Record<LeadStage, string> = {
  novo: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20',
  qualificado: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  proposta: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  fechado: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  perdido: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function ContactSidebar({ contact, conversationId, variant = 'desktop' }: ContactSidebarProps) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState<Contact | null>(contact);
  const [newTag, setNewTag] = useState('');
  const [addingTag, setAddingTag] = useState(false);

  const c = local && local.id === contact?.id ? local : contact;
  if (!c) return null;

  const stage = (c.stage || 'novo') as LeadStage;
  const fullAddress = [c.street, c.street_number].filter(Boolean).join(', ') +
    (c.district ? ` — ${c.district}` : '') +
    (c.city ? `, ${c.city}` : '') +
    (c.state ? `/${c.state}` : '');

  const addTag = async () => {
    const t = newTag.trim();
    if (!t) return;
    const next = Array.from(new Set([...(c.tags || []), t]));
    const { error } = await supabase.from('contacts').update({ tags: next }).eq('id', c.id);
    if (error) return toast.error('Erro ao salvar tag');
    setLocal({ ...c, tags: next });
    setNewTag('');
    setAddingTag(false);
  };
  const removeTag = async (t: string) => {
    const next = (c.tags || []).filter((x) => x !== t);
    const { error } = await supabase.from('contacts').update({ tags: next }).eq('id', c.id);
    if (error) return toast.error('Erro ao remover tag');
    setLocal({ ...c, tags: next });
  };

  return (
    <>
      <div className={`${variant === 'mobile' ? 'w-full' : 'w-80 shrink-0'} h-full flex flex-col overflow-y-auto custom-scrollbar`} style={{ background: '#0F1117', borderLeft: variant === 'mobile' ? 'none' : '1px solid #1F232E' }}>
        {/* Profile */}
        <div className="p-6 text-center border-b border-[#1F232E] relative">
          <button onClick={() => setEditing(true)} className="absolute top-3 right-3 p-1.5 text-zinc-500 hover:text-cyan-400 transition-colors" title="Editar contato">
            <Edit2 className="h-4 w-4" />
          </button>
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mx-auto flex items-center justify-center mb-4">
            <User className="h-10 w-10 text-cyan-500" />
          </div>
          <h3 className="text-white font-semibold">{c.name || 'Sem nome'}</h3>
          <p className="text-xs text-zinc-500 mt-1">{c.phone}</p>
          <span className={`inline-block mt-3 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${STAGE_COLORS[stage]}`}>
            {stage}
          </span>
        </div>

        {/* Dados pessoais */}
        <Section title="Dados pessoais">
          <Row icon={Mail} label="E-mail" value={c.email} />
          <Row icon={IdCard} label="CPF" value={c.cpf} />
          <Row icon={Calendar} label="Nascimento" value={c.birthdate ? format(new Date(c.birthdate), 'dd/MM/yyyy') : null} />
          <Row icon={Tag} label="Origem" value={c.source} />
        </Section>

        {/* Endereço */}
        <Section title="Endereço">
          <Row icon={MapPin} label="CEP" value={c.cep} />
          <Row icon={MapPin} label="Endereço" value={fullAddress.trim() ? fullAddress : null} multiline />
          {c.complement && <Row icon={MapPin} label="Compl." value={c.complement} />}
        </Section>

        {/* Veículo */}
        <Section title="Veículo">
          <Row icon={Car} label="Marca/Modelo" value={[c.vehicle_brand, c.vehicle_model].filter(Boolean).join(' ') || null} />
          <Row icon={Calendar} label="Ano" value={c.vehicle_year ? String(c.vehicle_year) : null} />
        </Section>

        {/* Tags */}
        <div className="px-6 py-4 border-t border-[#1F232E] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Tags</h4>
            <Tag className="h-3 w-3 text-zinc-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            {(c.tags || []).map((tag) => (
              <span key={tag} className="group text-[10px] px-2 py-0.5 rounded bg-[#1F232E] text-zinc-300 border border-[#1F232E] flex items-center gap-1">
                {tag}
                <button onClick={() => removeTag(tag)} className="opacity-0 group-hover:opacity-100 text-red-400">×</button>
              </span>
            ))}
            {addingTag ? (
              <input
                autoFocus
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addTag(); if (e.key === 'Escape') { setAddingTag(false); setNewTag(''); } }}
                onBlur={() => { if (newTag) addTag(); else setAddingTag(false); }}
                className="text-[10px] px-2 py-0.5 rounded bg-black/40 border border-cyan-500/30 text-zinc-200 outline-none w-20"
                placeholder="tag..."
              />
            ) : (
              <button onClick={() => setAddingTag(true)} className="text-[10px] px-2 py-0.5 rounded border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                <Plus className="h-3 w-3" /> Adicionar
              </button>
            )}
          </div>
        </div>

        {/* Agendamentos */}
        <div className="px-6 py-4 border-t border-[#1F232E] space-y-4 max-h-60 flex flex-col">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Agendamentos</h4>
            <CalendarClock className="h-3 w-3 text-zinc-500" />
          </div>
          <ScheduledList conversationId={conversationId} />
        </div>

        {/* Timeline */}
        <div className="px-6 py-4 border-t border-[#1F232E] space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Linha do Tempo</h4>
            <History className="h-3 w-3 text-zinc-500" />
          </div>
          <Timeline contactId={c.id} />
        </div>

        {/* Quick Actions */}
        <div className="p-6 space-y-2 border-t border-[#1F232E]">
          <a href={`/atendimento/propostas?contact=${c.id}`} className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#151821] border border-[#1F232E] text-sm text-zinc-300 hover:border-cyan-500/30 hover:text-white transition-all group">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-cyan-500" />
              <span>Gerar Proposta</span>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-cyan-500 transition-colors" />
          </a>
        </div>
      </div>

      {editing && (
        <ContactEditor
          contact={c}
          onClose={() => setEditing(false)}
          onSaved={(updates) => setLocal((prev) => prev ? { ...prev, ...updates } as Contact : prev)}
        />
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-4 border-t border-[#1F232E] space-y-3">
      <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, value, multiline }: { icon: any; label: string; value: string | null; multiline?: boolean }) {
  if (!value) return (
    <div className="flex items-center gap-2 text-zinc-700">
      <Icon className="h-3.5 w-3.5" />
      <span className="text-[11px]">{label}: <span className="italic text-zinc-700">não informado</span></span>
    </div>
  );
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-3.5 w-3.5 text-zinc-500 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</p>
        <p className={`text-xs text-zinc-200 ${multiline ? '' : 'truncate'}`}>{value}</p>
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
      {events.length === 0 && <p className="text-[10px] text-zinc-600 italic">Nenhuma atividade recente.</p>}
    </div>
  );
}

function ScheduledList({ conversationId }: { conversationId?: string | null }) {
  const { scheduledMessages, loading, cancelMessage } = useScheduledMessages(conversationId || null);
  if (loading && scheduledMessages.length === 0) return <div className="text-[10px] text-zinc-600 animate-pulse">Carregando agendamentos...</div>;
  return (
    <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
      <AnimatePresence mode="popLayout">
        {scheduledMessages.map((msg) => (
          <motion.div
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            key={msg.id}
            className="p-2.5 rounded-xl bg-black/20 border border-[#1F232E] group relative"
          >
            <div className="flex justify-between items-start mb-1.5">
              <div className="flex items-center gap-1.5">
                {msg.status === 'pending' && <Clock className="h-2.5 w-2.5 text-amber-500" />}
                {msg.status === 'sent' && <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />}
                {msg.status === 'cancelled' && <XCircle className="h-2.5 w-2.5 text-red-500" />}
                <span className={`text-[8px] font-bold uppercase tracking-widest ${msg.status === 'pending' ? 'text-amber-500' : msg.status === 'sent' ? 'text-emerald-500' : 'text-zinc-600'}`}>
                  {msg.status}
                </span>
              </div>
              {msg.status === 'pending' && (
                <button onClick={() => cancelMessage(msg.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500/50 hover:text-red-500 p-1">
                  <XCircle className="h-3 w-3" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-zinc-400 line-clamp-2 italic mb-2">"{msg.content}"</p>
            <div className="flex items-center gap-1 text-zinc-600">
              <Calendar className="h-2.5 w-2.5" />
              <span className="text-[9px]">{format(new Date(msg.scheduled_for), "dd/MM 'às' HH:mm", { locale: ptBR })}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {scheduledMessages.length === 0 && <p className="text-[10px] text-zinc-700 italic">Sem agendamentos para este chat.</p>}
    </div>
  );
}
