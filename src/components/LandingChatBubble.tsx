import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, CheckCircle2, AlertCircle, ArrowRight, Pencil, Save } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { landingChat, saveLandingLead, type LeadData } from "@/lib/landing-chat.functions";
import attendantImg from "@/assets/attendant.jpg";

const WHATSAPP_NUMBER = "5591985161991";

type ChatMessage = { role: "user" | "assistant"; content: string };

const initialAssistant: ChatMessage = {
  role: "assistant",
  content: "Olá! 👋 Sou a Clara, da HCB Automotivo. Para te ajudar melhor, qual é o seu nome?",
};

export default function LandingChatBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialAssistant]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [handoff, setHandoff] = useState<string | null>(null);
  const [lead, setLead] = useState<LeadData | null>(null);
  const [savingLead, setSavingLead] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [leadSaved, setLeadSaved] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chat = useServerFn(landingChat);
  const saveLead = useServerFn(saveLandingLead);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await chat({ data: { messages: next } });
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
      if (res.ready) {
        setHandoff(res.summary || "Olá! Vim pelo site e gostaria de mais informações.");
        if (res.lead) setLead(res.lead);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Tive um problema. Vamos continuar pelo WhatsApp?" }]);
      setHandoff("Olá! Vim pelo site e gostaria de mais informações.");
    } finally {
      setLoading(false);
    }
  };

  const whatsappLink = handoff
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(handoff + (leadSaved ? `\n\n[Ref: ${leadSaved}]` : ""))}`
    : `https://wa.me/${WHATSAPP_NUMBER}`;

  const handleWhatsAppClick = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!lead || savingLead) return;
    
    setSavingLead(true);
    setSaveError(false);
    try {
      const res = await saveLead({ data: lead });
      if (res.ok && res.leadId) {
        setLeadSaved(res.leadId as any);
      } else {
        setSaveError(true);
      }
    } catch (err) {
      console.warn('[landing-chat] save lead failed', err);
      setSaveError(true);
    } finally {
      setSavingLead(false);
    }
  };

  const openWhatsApp = () => {
    window.open(whatsappLink, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir atendimento"
          className="fixed bottom-5 right-5 z-50 group flex items-center gap-3 pl-2 pr-4 py-2 rounded-full bg-[#0A0A0A]/90 border border-white/10 backdrop-blur-md shadow-2xl hover:bg-[#0066CC] transition-all"
        >
          <span className="relative">
            <img
              src={attendantImg}
              alt="Atendente"
              width={48}
              height={48}
              loading="lazy"
              className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#0A0A0A] rounded-full animate-pulse" />
          </span>
          <span className="hidden sm:flex flex-col items-start text-left">
            <span className="text-xs text-white/60 leading-tight">Atendimento online</span>
            <span className="text-sm font-semibold text-white leading-tight">Fale com a Clara</span>
          </span>
          <MessageCircle className="w-5 h-5 text-white sm:hidden" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-[380px] h-[560px] max-h-[80vh] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#0066CC] to-[#0052A3] border-b border-white/10">
            <img
              src={attendantImg}
              alt="Clara"
              width={40}
              height={40}
              loading="lazy"
              className="w-10 h-10 rounded-full object-cover border border-white/30"
            />
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Clara — HCB Automotivo</p>
              <p className="text-white/80 text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full" /> Online agora
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="p-1.5 rounded-md hover:bg-white/10 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0F0F0F]">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#0066CC] text-white rounded-br-sm"
                      : "bg-white/5 border border-white/10 text-white/90 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/60 text-sm flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> digitando...
                </div>
              </div>
            )}
            {handoff && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {!leadSaved && !saveError && (
                  <button
                    onClick={() => handleWhatsAppClick()}
                    disabled={savingLead}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold text-sm transition-all shadow-lg active:scale-95 disabled:opacity-70"
                  >
                    {savingLead ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando seus dados...
                      </>
                    ) : (
                      <>
                        Continuar pelo WhatsApp
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}

                {leadSaved && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center space-y-3">
                    <div className="flex flex-col items-center gap-2 text-green-400">
                      <CheckCircle2 className="w-8 h-8" />
                      <p className="font-semibold text-sm">Dados salvos com sucesso!</p>
                    </div>
                    <p className="text-white/60 text-xs px-2">
                      Sua solicitação foi registrada. Clique abaixo para iniciar a conversa no WhatsApp.
                    </p>
                    <button
                      onClick={openWhatsApp}
                      className="w-full py-2.5 rounded-lg bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold text-sm transition-colors"
                    >
                      Abrir WhatsApp agora
                    </button>
                  </div>
                )}

                {saveError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center space-y-3">
                    <div className="flex flex-col items-center gap-2 text-red-400">
                      <AlertCircle className="w-8 h-8" />
                      <p className="font-semibold text-sm">Ops! Erro ao salvar dados</p>
                    </div>
                    <p className="text-white/60 text-xs px-2">
                      Não conseguimos registrar seus dados, mas você ainda pode falar conosco.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleWhatsAppClick()}
                        className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
                      >
                        Tentar novamente
                      </button>
                      <button
                        onClick={openWhatsApp}
                        className="flex-1 py-2 rounded-lg bg-[#25D366] hover:bg-[#1ebe57] text-white text-xs font-medium transition-colors"
                      >
                        Ir para WhatsApp
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 bg-[#0A0A0A]">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={handoff ? "Atendimento finalizado" : "Digite sua mensagem..."}
                disabled={loading || !!handoff}
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#0066CC] disabled:opacity-50"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim() || !!handoff}
                aria-label="Enviar"
                className="p-2.5 rounded-full bg-[#0066CC] hover:bg-[#0052A3] disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
