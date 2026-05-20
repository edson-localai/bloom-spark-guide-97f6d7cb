import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, User, Bot, Paperclip, MoreVertical, ShieldCheck, Clock, Sparkles, Loader2, Smile, Zap, Hammer, StickyNote, MessageCircle, CalendarClock, File as FileIcon, UserPlus, CheckCircle2, Archive, RotateCcw, Command, Trash2, Tag, ChevronDown } from 'lucide-react';

import { Message, Conversation, Contact } from '@/types/crm';
import { useMessages } from '@/hooks/useMessages';
import { useAgents } from '@/hooks/useAgents';
import { useWaitingQueue } from '@/hooks/useWaitingQueue';
import { useQuickReplies } from '@/hooks/useQuickReplies';
import { getAiSuggestions, AiSuggestions } from '@/services/aiService';
import { extractContactData } from '@/lib/ai.functions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function MediaPreview({ path, type, name }: { path: string, type: string, name: string }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUrl() {
      // Se for uma URL completa (dados legados), usa direto
      if (path.startsWith('http')) {
        setSignedUrl(path);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.storage
          .from('crm_media')
          .createSignedUrl(path, 3600); // 1 hora de validade
        
        if (error) throw error;
        setSignedUrl(data.signedUrl);
      } catch (err) {
        console.error('Error signing URL:', err);
      } finally {
        setLoading(false);
      }
    }
    getUrl();
  }, [path]);

  if (loading) return <div className="h-20 flex items-center justify-center bg-black/10 rounded-lg"><Loader2 className="h-4 w-4 animate-spin text-cyan-500" /></div>;
  if (!signedUrl) return <div className="p-2 text-[10px] text-red-400 italic bg-red-500/5 rounded">Erro ao carregar mídia</div>;

  if (type.startsWith('image')) {
    return (
      <div className="mb-2 rounded-lg overflow-hidden border border-white/10 cursor-pointer">
        <img src={signedUrl} alt="Mídia" className="max-w-full h-auto hover:scale-[1.02] transition-transform" />
      </div>
    );
  }

  return (
    <a href={signedUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-black/20 hover:bg-black/40 transition-colors">
      <FileIcon className="h-4 w-4 text-cyan-400" />
      <span className="text-xs truncate">{name}</span>
    </a>
  );
}

interface ChatWindowProps {
  conversation: (Conversation & { contact: Contact | null }) | null;
}

export function ChatWindow({ conversation }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [suggestions, setSuggestions] = useState<AiSuggestions | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  
  const { messages, loading, sendMessage, deleteMessage } = useMessages(conversation?.id ?? null);
  const { agents, onlineAgents } = useAgents();
  const { addToQueue } = useWaitingQueue();
  const { replies: quickReplies } = useQuickReplies();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick-reply autocomplete: type "/" then shortcut to filter
  const slashMatch = useMemo(() => {
    const m = input.match(/^\/(\S*)$/);
    return m ? m[1].toLowerCase() : null;
  }, [input]);
  const quickMatches = useMemo(() => {
    if (slashMatch === null) return [];
    return quickReplies.filter(
      (r) =>
        (r.shortcut || '').toLowerCase().startsWith(slashMatch) ||
        r.title.toLowerCase().includes(slashMatch),
    ).slice(0, 5);
  }, [slashMatch, quickReplies]);

  const updateStatus = async (status: 'resolved' | 'archived' | 'active') => {
    if (!conversation) return;
    const updates: any = { status, updated_at: new Date().toISOString() };
    if (status === 'resolved') updates.resolved_at = new Date().toISOString();
    if (status === 'active') updates.resolved_at = null;
    const { error } = await supabase.from('conversations').update(updates).eq('id', conversation.id);
    if (error) return toast.error('Erro ao atualizar status');
    toast.success(
      status === 'resolved' ? 'Atendimento resolvido!' :
      status === 'archived' ? 'Conversa arquivada' : 'Conversa reaberta'
    );
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    setSuggestions(null);
    setShowSchedule(false);
    setShowTransfer(false);
  }, [messages, conversation?.id]);

  const handleTransfer = async (agentId: string) => {
    if (!conversation) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('conversations')
        .update({ 
          agent_id: agentId,
          transferred_from: user?.id as any,
          transferred_at: new Date().toISOString()
        } as any)
        .eq('id', conversation.id);

      if (error) throw error;

      toast.success('Chat transferido com sucesso!');
      setShowTransfer(false);
    } catch (err) {
      toast.error('Erro ao transferir chat.');
    }
  };

  const handleTransferToQueue = async () => {
    if (!conversation) return;
    
    if (onlineAgents.length === 0) {
      try {
        await addToQueue(conversation.id, conversation.contact_id || undefined);
        await supabase
          .from('conversations')
          .update({ status: 'queue' as any, agent_id: null })
          .eq('id', conversation.id);
        
        toast.info('Sem agentes online. Chat colocado na fila de espera.', {
          description: 'Será atribuído automaticamente assim que alguém ficar disponível.'
        });
        setShowTransfer(false);
      } catch (err) {
        toast.error('Erro ao adicionar à fila.');
      }
    } else {
      toast.error('Há agentes online. Escolha um para transferir.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversation) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${conversation.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('crm_media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      await sendMessage(file.name, file.type.startsWith('image/') ? 'image' : 'document', false);
      
      // Armazena o PATH do arquivo em vez da URL pública (bucket privado)
      await supabase.from('messages')
        .update({
          media_url: filePath,
          media_mime: file.type
        } as any)
        .eq('content', file.name)
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: false })
        .limit(1);

      toast.success('Arquivo enviado!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar arquivo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleScheduleMessage = async () => {
    if (!input.trim() || !scheduledDate || !scheduledTime || !conversation) return;
    
    const dateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    
    try {
      const { error } = await supabase.from('scheduled_messages').insert({
        conversation_id: conversation.id,
        content: input,
        scheduled_for: dateTime.toISOString(),
      });

      if (error) throw error;

      toast.success(`Mensagem agendada para ${format(dateTime, "dd/MM 'às' HH:mm", { locale: ptBR })}`);
      setInput('');
      setShowSchedule(false);
    } catch (error) {
      toast.error('Erro ao agendar mensagem.');
    }
  };

  const handleAiSuggest = async () => {
    if (!conversation || messages.length === 0) return;
    setIsAiLoading(true);
    setSuggestions(null);
    try {
      const data = await getAiSuggestions(conversation.id, messages);
      if (data) {
        setSuggestions(data);
        toast.success('Ana gerou três opções de resposta!');
      }
    } catch (error) {
      toast.error('Erro ao buscar sugestão da Ana.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const content = input;
    const internal = isInternal;
    setInput('');
    if (internal) setIsInternal(false);
    await sendMessage(content, 'text', internal);
    
    if (conversation && messages.length % 3 === 0) {
      extractContactData({ 
        data: {
          conversationId: conversation.id, 
          contactId: conversation.contact_id!
        }
      }).then(res => {
        if (res && 'updated' in res && res.updated) {
          toast.info('Ana atualizou dados do veículo!', {
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
      <div className="h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between border-b border-[#1F232E] gap-2" style={{ background: '#0F1117' }}>
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
                  <p className="text-[10px] text-cyan-400 ml-1 font-bold uppercase tracking-wider">Ana pensando...</p>
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
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#151821] border border-[#1F232E] mr-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">IA Auto</span>
            <button
              onClick={async () => {
                const newValue = !conversation.auto_reply_enabled;
                const { error } = await supabase
                  .from('conversations')
                  .update({ auto_reply_enabled: newValue } as any)
                  .eq('id', conversation.id);
                
                if (!error) {
                  toast.success(newValue ? 'Auto-resposta ativada para este chat' : 'Auto-resposta desativada para este chat');
                }
              }}
              className={`h-5 w-9 rounded-full relative transition-colors ${conversation.auto_reply_enabled ? 'bg-cyan-500' : 'bg-zinc-700'}`}
            >
              <div className={`h-3 w-3 rounded-full bg-white absolute top-1 transition-all ${conversation.auto_reply_enabled ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
          <button 
            onClick={() => setShowTransfer(!showTransfer)}
            className={`p-2 transition-colors ${showTransfer ? 'text-cyan-400' : 'text-zinc-400 hover:text-white'}`}
            title="Transferir Atendimento"
          >
            <UserPlus className="h-5 w-5" />
          </button>
          {conversation.status !== 'resolved' && conversation.status !== 'archived' ? (
            <>
              <button onClick={() => updateStatus('resolved')} className="p-2 text-zinc-400 hover:text-emerald-400 transition-colors" title="Resolver atendimento">
                <CheckCircle2 className="h-5 w-5" />
              </button>
              <button onClick={() => updateStatus('archived')} className="p-2 text-zinc-400 hover:text-amber-400 transition-colors" title="Arquivar">
                <Archive className="h-5 w-5" />
              </button>
            </>
          ) : (
            <button onClick={() => updateStatus('active')} className="p-2 text-zinc-400 hover:text-cyan-400 transition-colors" title="Reabrir">
              <RotateCcw className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showTransfer && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#151821] border-b border-[#1F232E] overflow-hidden"
          >
            <div className="p-4 flex gap-3 overflow-x-auto custom-scrollbar">
              {agents.map(agent => {
                const isOnline = onlineAgents.includes(agent.user_id!);
                return (
                  <button
                    key={agent.id}
                    onClick={() => isOnline ? handleTransfer(agent.id) : toast.error(`${agent.name} está offline no momento.`)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-black/20 border transition-all min-w-[100px] ${
                      isOnline ? 'border-[#1F232E] hover:border-cyan-500/30' : 'border-red-500/10 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold relative ${
                      isOnline ? 'bg-cyan-500/10 text-cyan-500' : 'bg-zinc-800 text-zinc-600'
                    }`}>
                      {agent.name.charAt(0)}
                      {isOnline && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[#151821]" />}
                    </div>
                    <span className="text-[10px] text-zinc-300 font-medium truncate w-full text-center">{agent.name}</span>
                    <span className={`text-[8px] uppercase font-bold tracking-tighter ${isOnline ? 'text-emerald-500' : 'text-zinc-600'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </button>
                );
              })}
              
              {/* Botão de Fila de Espera */}
              <button
                onClick={handleTransferToQueue}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-amber-500/5 border-2 border-dashed transition-all min-w-[100px] ${
                  onlineAgents.length === 0 ? 'border-amber-500/40 hover:bg-amber-500/10' : 'border-zinc-700/40 opacity-60 cursor-not-allowed'
                }`}
                disabled={onlineAgents.length > 0}
                title={onlineAgents.length > 0 ? 'Use somente quando não houver agentes online' : 'Adicionar à fila'}
              >
                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/30">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="text-[10px] text-zinc-300 font-medium truncate w-full text-center">Fila de Espera</span>
                <span className="text-[8px] uppercase font-bold tracking-tighter text-amber-400">
                  Auto
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 custom-scrollbar" ref={scrollRef}>
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
                <div className={`max-w-[85%] sm:max-w-[70%] space-y-1`}>
                  {msg.is_internal && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-500 uppercase tracking-widest w-fit ml-auto mb-1">
                      <StickyNote className="h-2.5 w-2.5" />
                      Nota Interna
                    </div>
                  )}
                  <div className="group relative">
                    {!isSystem && (
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className={`absolute -top-2 ${isMe ? '-left-6' : '-right-6'} p-1.5 rounded-full bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20`}
                        title="Apagar mensagem"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl text-sm ${
                        msg.is_internal
                          ? 'bg-amber-500/10 text-amber-200 border border-amber-500/30 italic'
                          : isMe 
                            ? 'bg-cyan-500 text-black font-medium rounded-tr-none shadow-[0_0_15px_rgba(0,204,238,0.2)]' 
                            : 'bg-[#151821] text-zinc-200 border border-[#1F232E] rounded-tl-none'
                      }`}
                    >
                      {msg.media_url && (
                        <MediaPreview 
                          path={msg.media_url} 
                          type={msg.content_type} 
                          name={msg.content || 'Arquivo'} 
                        />
                      )}
                      {msg.content}
                    </div>
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
      <div className="p-3 sm:p-4 border-t border-[#1F232E]" style={{ background: '#0F1117' }}>
        <form onSubmit={handleSend} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={isAiLoading || !conversation || messages.length === 0}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold uppercase tracking-wider hover:bg-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={messages.length === 0 ? "Aguardando primeira mensagem do cliente" : "Pedir opções para a Ana"}
              >
                {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                Opções da Ana
              </button>
              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${
                  showSchedule ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-500 hover:bg-zinc-500/20'
                }`}
              >
                <CalendarClock className="h-3 w-3" />
                Agendar
              </button>
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

              {showSchedule && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#151821] border border-amber-500/20 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-end"
                >
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Data</label>
                    <input 
                      type="date" 
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full bg-black/20 border border-[#1F232E] rounded-lg p-2 text-sm text-white" 
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Hora</label>
                    <input 
                      type="time" 
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full bg-black/20 border border-[#1F232E] rounded-lg p-2 text-sm text-white" 
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleScheduleMessage}
                    disabled={!scheduledDate || !scheduledTime || !input.trim()}
                    className="bg-amber-500 text-black font-bold text-xs px-4 py-2.5 rounded-lg hover:bg-amber-400 disabled:opacity-50 transition-colors"
                  >
                    Confirmar Agendamento
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-[#151821] rounded-xl p-1 border border-[#1F232E]">
              <button
                type="button"
                onClick={() => setIsInternal(false)}
                className={`p-2 rounded-lg transition-all ${!isInternal ? 'bg-cyan-500 text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="Mensagem Pública"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsInternal(true)}
                className={`p-2 rounded-lg transition-all ${isInternal ? 'bg-amber-500 text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="Nota Interna"
              >
                <StickyNote className="h-4 w-4" />
              </button>
            </div>
            
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*,application/pdf"
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2 text-zinc-500 hover:text-cyan-400 transition-colors disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
            </button>

            <div className="flex-1 relative">
              {quickMatches.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#0F1117] border border-cyan-500/20 rounded-xl overflow-hidden shadow-2xl z-20 max-h-60 overflow-y-auto custom-scrollbar">
                  <div className="px-3 py-1.5 border-b border-[#1F232E] text-[9px] font-bold uppercase tracking-widest text-cyan-400/80 flex items-center gap-1.5">
                    <Command className="h-3 w-3" /> Respostas rápidas
                  </div>
                  {quickMatches.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => { setInput(r.content); supabase.from('quick_replies').update({ use_count: (r.use_count || 0) + 1 }).eq('id', r.id); }}
                      className="w-full text-left px-3 py-2 hover:bg-cyan-500/5 border-b border-[#1F232E]/40 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">/{r.shortcut}</span>
                        <span className="text-xs font-medium text-zinc-200">{r.title}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1">{r.content}</p>
                    </button>
                  ))}
                </div>
              )}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isInternal ? "Escrever nota interna..." : 'Digite sua mensagem... ("/" para respostas rápidas)'}
                className={`w-full bg-[#151821] border rounded-xl py-2.5 px-4 text-sm transition-colors focus:outline-none ${
                  isInternal 
                    ? 'border-amber-500/50 text-amber-100 placeholder:text-amber-500/40' 
                    : 'border-[#1F232E] text-zinc-200 focus:border-cyan-500/50'
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim()}
              className={`h-10 w-10 flex items-center justify-center rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isInternal ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-cyan-500 text-black hover:bg-cyan-400'
              }`}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SuggestionButton({ icon: Icon, label, text, onClick }: { icon: any, label: string, text: string, onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col text-left p-2.5 rounded-xl bg-[#151821] border border-[#1F232E] hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all group"
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="h-3 w-3 text-cyan-400" />
        <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 group-hover:text-cyan-400">{label}</span>
      </div>
      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed group-hover:text-zinc-200">{text}</p>
    </button>
  );
}