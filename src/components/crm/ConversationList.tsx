import { Search, Filter, User } from 'lucide-react';
import { Conversation, Contact } from '@/types/crm';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConversationListProps {
  conversations: (Conversation & { contact: Contact | null })[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  return (
    <div className="flex flex-col h-full" style={{ background: '#0F1117', borderRight: '1px solid #1F232E' }}>
      <div className="p-4 space-y-3">
        <h2 className="text-lg font-semibold text-white">Mensagens</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar conversa..."
            className="w-full bg-[#151821] border border-[#1F232E] rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex-1 py-1 px-2 text-[11px] font-medium rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Abertas
          </button>
          <button className="flex-1 py-1 px-2 text-[11px] font-medium rounded text-zinc-500 hover:text-zinc-300 transition-colors">
            Fila
          </button>
          <button className="flex-1 py-1 px-2 text-[11px] font-medium rounded text-zinc-500 hover:text-zinc-300 transition-colors">
            Resolvidas
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {conversations.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-zinc-500">Nenhuma conversa encontrada</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full text-left p-4 flex gap-3 transition-colors border-b border-[#1F232E]/50 ${
                selectedId === conv.id ? 'bg-cyan-500/5' : 'hover:bg-[#151821]'
              }`}
            >
              <div className="h-10 w-10 rounded-full bg-[#1F232E] flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-zinc-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <p className={`text-sm font-medium truncate ${selectedId === conv.id ? 'text-cyan-400' : 'text-zinc-200'}`}>
                    {conv.contact?.name || conv.whatsapp_chat_id}
                  </p>
                  <span className="text-[10px] text-zinc-500 shrink-0">
                    {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false, locale: ptBR })}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 truncate line-clamp-1">
                  {conv.last_message || 'Iniciando conversa...'}
                </p>
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
            </button>
          ))
        )}
      </div>
    </div>
  );
}
