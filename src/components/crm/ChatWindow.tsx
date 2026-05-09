import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Paperclip, MoreVertical, ShieldCheck, Clock, Sparkles, Loader2, Smile, Zap, Hammer } from 'lucide-react';
import { Message, Conversation, Contact } from '@/types/crm';
import { useMessages } from '@/hooks/useMessages';
import { getAiSuggestions, AiSuggestions } from '@/services/aiService';
import { extractContactData } from '@/lib/ai.functions';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWindowProps {
  conversation: (Conversation & { contact: Contact | null }) | null;
}

export function ChatWindow({ conversation }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AiSuggestions | null>(null);
  const { messages, loading, sendMessage } = useMessages(conversation?.id ?? null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // Limpa sugestões ao mudar de conversa
    setSuggestions(null);
  }, [messages, conversation?.id]);

  const handleAiSuggest = async () => {
    if (!conversation || messages.length === 0) return;
    setIsAiLoading(true);
    setSuggestions(null);
    try {
      const data = await getAiSuggestions(conversation.id, messages);
      if (data) {
        setSuggestions(data);
        toast.success('Clara gerou três opções de resposta!');
      }
    } catch (error) {
      toast.error('Erro ao buscar sugestão da Clara.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const content = input;
    setInput('');
    await sendMessage(content);
    
    // Auto-extração a cada 3 mensagens (simples heuristic)
    if (conversation && messages.length % 3 === 0) {
      extractContactData({ 
        data: {
          conversationId: conversation.id, 
          contactId: conversation.contact_id!
        }
      }).then(res => {
        if (res && 'updated' in res && res.updated) {
          toast.info('Clara atualizou dados do veículo!', {
            description: `Detectado: ${res.data.vehicle_brand || ''} ${res.data.vehicle_model || ''}`
          });
        }
      });
    }
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
              {isAiLoading ? (
                <div className="flex gap-0.5 items-center">
                  <span className="h-1 w-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0s' }}></span>
                  <span className="h-1 w-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="h-1 w-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  <p className="text-[10px] text-cyan-400 ml-1 font-bold uppercase tracking-wider">Clara pensando...</p>
                </div>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <p className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider">Online</p>
                </>
              )}
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
        <form onSubmit={handleSend} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={isAiLoading || !conversation}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold uppercase tracking-wider hover:bg-cyan-500/20 transition-all disabled:opacity-50"
              >
                {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                Opções da Clara
              </button>
              <span className="text-[10px] text-zinc-600 font-medium">Extraia o melhor tom para este cliente</span>
            </div>

            <AnimatePresence>
              {suggestions && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-2"
                >
                  <SuggestionButton 
                    icon={Smile} 
                    label="Amigável" 
                    text={suggestions.friendly} 
                    onClick={() => { setInput(suggestions.friendly); setSuggestions(null); }} 
                  />
                  <SuggestionButton 
                    icon={Zap} 
                    label="Direto" 
                    text={suggestions.direct} 
                    onClick={() => { setInput(suggestions.direct); setSuggestions(null); }} 
                  />
                  <SuggestionButton 
                    icon={Hammer} 
                    label="Técnico" 
                    text={suggestions.technical} 
                    onClick={() => { setInput(suggestions.technical); setSuggestions(null); }} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
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
          </div>
        </form>
      </div>
    </div>
  );
}
