import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Paperclip, MoreVertical, ShieldCheck, Clock } from 'lucide-react';
import { Message, Conversation, Contact } from '@/types/crm';
import { useMessages } from '@/hooks/useMessages';

interface ChatWindowProps {
  conversation: (Conversation & { contact: Contact | null }) | null;
}

export function ChatWindow({ conversation }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const { messages, loading, sendMessage } = useMessages(conversation?.id ?? null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const content = input;
    setInput('');
    await sendMessage(content);
  };

  if (!conversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4" style={{ background: '#0A0A0F' }}>
        <div className="h-16 w-16 rounded-3xl bg-[#151821] flex items-center justify-center border border-[#1F232E]">
          <Bot className="h-8 w-8 text-zinc-600" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-400">Selecione uma conversa</p>
          <p className="text-xs text-zinc-600">Seus atendimentos ativos aparecerão aqui</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ background: '#0A0A0F' }}>
      {/* Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-[#1F232E]" style={{ background: '#0F1117' }}>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#1F232E] flex items-center justify-center border border-cyan-500/20">
            <User className="h-5 w-5 text-cyan-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{conversation.contact?.name || conversation.whatsapp_chat_id}</p>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <p className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider">Online</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-zinc-400 hover:text-white transition-colors">
            <ShieldCheck className="h-5 w-5" />
          </button>
          <button className="p-2 text-zinc-400 hover:text-white transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar" ref={scrollRef}>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender_type === 'agent';
            const isSystem = msg.sender_type === 'system';
            
            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 bg-[#151821] px-3 py-1 rounded-full border border-[#1F232E]">
                    {msg.content}
                  </span>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] space-y-1`}>
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm ${
                      isMe 
                        ? 'bg-cyan-500 text-black font-medium rounded-tr-none shadow-[0_0_15px_rgba(0,204,238,0.2)]' 
                        : 'bg-[#151821] text-zinc-200 border border-[#1F232E] rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div className={`flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <Clock className="h-3 w-3 text-zinc-600" />
                    <span className="text-[10px] text-zinc-600">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#1F232E]" style={{ background: '#0F1117' }}>
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <button type="button" className="p-2 text-zinc-500 hover:text-cyan-400 transition-colors">
            <Paperclip className="h-5 w-5" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="w-full bg-[#151821] border border-[#1F232E] rounded-xl py-2.5 px-4 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim()}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
