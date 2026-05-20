import { SearchX, User } from 'lucide-react';
import { Conversation, Contact } from '@/types/crm';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface ConversationListProps {
  conversations: (Conversation & { contact: Contact | null })[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  return (
    <div className="flex flex-col h-full" style={{ background: '#0F1117' }}>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {conversations.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center flex flex-col items-center gap-2"
            >
              <SearchX className="h-8 w-8 text-zinc-800" />
              <p className="text-sm text-zinc-500">Nenhuma conversa encontrada</p>
            </motion.div>
          ) : (
            conversations.map((conv) => (
              <motion.button
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full text-left p-4 flex gap-3 transition-colors border-b border-[#1F232E]/50 relative overflow-hidden ${
                  selectedId === conv.id ? 'bg-cyan-500/5' : 'hover:bg-[#151821]'
                }`}
              >
                {selectedId === conv.id && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 top-0 w-1 h-full bg-cyan-500 shadow-[0_0_10px_rgba(0,204,238,0.5)]" 
                  />
                )}
                <div className="h-10 w-10 rounded-full bg-[#1F232E] flex items-center justify-center shrink-0 border border-zinc-800">
                  <User className="h-5 w-5 text-zinc-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className={`text-sm font-medium truncate ${selectedId === conv.id ? 'text-cyan-400' : 'text-zinc-200'}`}>
                      {conv.contact?.name || conv.whatsapp_chat_id}
                    </p>
                    <span className="text-[10px] text-zinc-500 shrink-0">
                      {conv.last_message_at ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false, locale: ptBR }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate line-clamp-1">
                    {conv.last_message || 'Iniciando conversa...'}
                  </p>
                  
                  {/* Labels rendering */}
                  {conv.labels && conv.labels.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {conv.labels.map(label => (
                        <span 
                          key={label.id}
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase"
                          style={{ backgroundColor: label.color + '44', border: `1px solid ${label.color}` }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 flex gap-1.5">
                    {conv.status === 'bot' && (
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        BOT
                      </span>
                    )}
                    {conv.unread_count > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500 text-black">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}