import { useState, useRef, useEffect, useMemo } from "react";
import { MessageCircle, X, Send, Loader2, CheckCircle2, AlertCircle, ArrowRight, Pencil, Save, User, Camera, Upload, Trash2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { landingChat, saveLandingLead, type LeadData } from "@/lib/landing-chat.functions";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/image-utils";
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
  const [isReused, setIsReused] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chat = useServerFn(landingChat);
  const saveLead = useServerFn(saveLandingLead);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [optimizedImage, setOptimizedImage] = useState<{ blob: Blob; contentType: string; extension: string } | null>(null);

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

  const currentSummary = lead 
    ? `Olá! Sou ${lead.name || 'cliente'}, tenho um ${lead.vehicle_brand || ''} ${lead.vehicle_model || ''} ${lead.vehicle_year || ''}. Preciso de: ${lead.need || 'suporte'}. Estou em ${lead.city || 'região'}.`
    : handoff;

  const whatsappLink = currentSummary
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(currentSummary + (leadSaved ? `\n\n[Ref: ${leadSaved}]` : ""))}`
    : `https://wa.me/${WHATSAPP_NUMBER}`;

  const handleWhatsAppClick = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!lead || savingLead) return;
    
    // Validation
    if (!lead.name?.trim() || !lead.city?.trim()) {
      setValidationError("Por favor, informe seu Nome e sua Cidade antes de continuar.");
      return;
    }

    setValidationError(null);
    setSavingLead(true);
    setSaveError(false);
    try {
      const transcript = [
        "RESUMO:",
        currentSummary,
        "",
        "HISTÓRICO DA CONVERSA:",
        ...messages.map(m => `${m.role === 'user' ? 'Cliente' : 'Clara'}: ${m.content}`)
      ].join('\n');

      const res = await saveLead({ 
        data: { 
          ...lead, 
          chat_transcript: transcript 
        } 
      });
      if (res.ok && res.leadId) {
        setLeadSaved(res.leadId as any);
        if (res.reused) setIsReused(true);
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
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !lead) return;

    setUploading(true);
    try {
      const blob = await compressImage(file);
      setCompressedBlob(blob);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error('Error compressing image:', err);
      setValidationError("Erro ao processar a imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!compressedBlob || !lead) return;
    
    setUploading(true);
    try {
      const fileExt = "jpg";
      const fileName = `${Math.random().toString(36).slice(2, 10)}.${fileExt}`;
      const filePath = `leads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, compressedBlob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setLead({ ...lead, avatar_url: publicUrl });
      setPreviewUrl(null);
      setCompressedBlob(null);
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setValidationError("Erro ao salvar a foto. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleCancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCompressedBlob(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleRemoveAvatar = () => {
    if (!lead) return;
    setLead({ ...lead, avatar_url: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openWhatsApp = () => {
    window.open(whatsappLink, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
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
                className={`flex items-end gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {m.role === "user" ? (
                  lead?.avatar_url ? (
                    <img
                      src={lead.avatar_url}
                      alt="Sua foto"
                      className="w-6 h-6 rounded-full object-cover border border-white/20 shrink-0 mb-1"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 mb-1">
                      <User className="w-3.5 h-3.5 text-white/50" />
                    </div>
                  )
                ) : (
                  <img
                    src={attendantImg}
                    alt="Clara"
                    className="w-6 h-6 rounded-full object-cover border border-white/20 shrink-0 mb-1"
                  />
                )}
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#0066CC] text-white rounded-br-none"
                      : "bg-white/5 border border-white/10 text-white/90 rounded-bl-none"
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
                {lead && !leadSaved && !saveError && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2 mb-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Confirme seus dados</h4>
                      {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="text-[#0066CC] hover:text-[#3385ff] text-xs flex items-center gap-1 font-medium">
                          <Pencil className="w-3 h-3" /> Editar
                        </button>
                      ) : (
                        <button onClick={() => setIsEditing(false)} className="text-green-500 hover:text-green-400 text-xs flex items-center gap-1 font-medium">
                          <Save className="w-3 h-3" /> Concluir
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                      <div className="flex items-center gap-3 py-2 border-b border-white/5">
                        <div className="relative group">
                          {(previewUrl || lead.avatar_url) ? (
                            <div className="relative">
                              <img 
                                src={previewUrl || lead.avatar_url || ''} 
                                alt="Sua foto" 
                                className={`w-10 h-10 rounded-full object-cover border-2 ${previewUrl ? 'border-yellow-500 animate-pulse' : 'border-white/20'}`} 
                              />
                              {!previewUrl && (
                                <button 
                                  onClick={handleRemoveAvatar}
                                  className="absolute -top-1 -right-1 p-1 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Remover foto"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                              <User className="w-5 h-5 text-white/30" />
                            </div>
                          )}
                          
                          {previewUrl ? (
                            <div className="absolute -bottom-1 -right-4 flex gap-1">
                              <button 
                                onClick={handleConfirmUpload}
                                disabled={uploading}
                                className="p-1 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                                title="Confirmar upload"
                              >
                                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                              </button>
                              <button 
                                onClick={handleCancelPreview}
                                disabled={uploading}
                                className="p-1 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                title="Cancelar"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploading}
                              className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#0066CC] text-white shadow-lg hover:bg-[#3385ff] transition-colors disabled:opacity-50"
                            >
                              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                            </button>
                          )}
                          
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] text-white font-medium">
                            {previewUrl ? 'Pré-visualização (otimizada)' : 'Sua foto de perfil'}
                          </p>
                          <p className="text-[9px] text-white/40 leading-tight">
                            {previewUrl ? 'Clique no check verde para salvar esta versão.' : 'Será usada no chat se a do WhatsApp não carregar.'}
                          </p>
                          {(lead.avatar_url && !previewUrl) && (
                            <button 
                              onClick={handleRemoveAvatar}
                              className="text-[9px] text-red-400 hover:text-red-300 mt-0.5 font-medium flex items-center gap-1 sm:hidden"
                            >
                              <Trash2 className="w-2 h-2" /> Remover foto
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] text-white/40 uppercase font-semibold">Nome</label>
                        {isEditing ? (
                          <input 
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0066CC]"
                            value={lead.name || ''} 
                            onChange={e => setLead({...lead, name: e.target.value})} 
                          />
                        ) : (
                          <p className="text-xs text-white px-0.5">{lead.name || 'Não informado'}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] text-white/40 uppercase font-semibold">Veículo</label>
                        {isEditing ? (
                          <div className="grid grid-cols-3 gap-2">
                            <input 
                              placeholder="Marca"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0066CC]"
                              value={lead.vehicle_brand || ''} 
                              onChange={e => setLead({...lead, vehicle_brand: e.target.value})} 
                            />
                            <input 
                              placeholder="Modelo"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0066CC]"
                              value={lead.vehicle_model || ''} 
                              onChange={e => setLead({...lead, vehicle_model: e.target.value})} 
                            />
                            <input 
                              placeholder="Ano"
                              type="number"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0066CC]"
                              value={lead.vehicle_year || ''} 
                              onChange={e => setLead({...lead, vehicle_year: parseInt(e.target.value) || null})} 
                            />
                          </div>
                        ) : (
                          <p className="text-xs text-white px-0.5">
                            {lead.vehicle_brand} {lead.vehicle_model} {lead.vehicle_year && `(${lead.vehicle_year})`}
                            {(!lead.vehicle_brand && !lead.vehicle_model) && 'Não informado'}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] text-white/40 uppercase font-semibold">Necessidade</label>
                        {isEditing ? (
                          <textarea 
                            rows={2}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0066CC] resize-none"
                            value={lead.need || ''} 
                            onChange={e => setLead({...lead, need: e.target.value})} 
                          />
                        ) : (
                          <p className="text-xs text-white px-0.5 leading-relaxed">{lead.need || 'Não informado'}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] text-white/40 uppercase font-semibold">Cidade/Bairro</label>
                        {isEditing ? (
                          <input 
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0066CC]"
                            value={lead.city || ''} 
                            onChange={e => setLead({...lead, city: e.target.value})} 
                          />
                        ) : (
                          <p className="text-xs text-white px-0.5">{lead.city || 'Não informado'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {validationError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-red-400 font-medium">{validationError}</p>
                      <button 
                        onClick={() => {
                          setIsEditing(true);
                          setValidationError(null);
                        }} 
                        className="text-[10px] text-white/60 hover:text-white underline mt-1"
                      >
                        Corrigir agora
                      </button>
                    </div>
                  </div>
                )}

                {!leadSaved && !saveError && (
                  <button
                    onClick={() => handleWhatsAppClick()}
                    disabled={savingLead || isEditing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold text-sm transition-all shadow-lg active:scale-95 disabled:opacity-70"
                  >
                    {savingLead ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando seus dados...
                      </>
                    ) : (
                      <>
                        {isEditing ? 'Conclua a edição para continuar' : 'Continuar pelo WhatsApp'}
                        {!isEditing && <ArrowRight className="w-4 h-4" />}
                      </>
                    )}
                  </button>
                )}

                {leadSaved && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center space-y-3">
                    <div className="flex flex-col items-center gap-2 text-green-400">
                      <CheckCircle2 className="w-8 h-8" />
                      <p className="font-semibold text-sm">
                        {isReused ? "Dados identificados!" : "Dados salvos com sucesso!"}
                      </p>
                    </div>
                    <p className="text-white/60 text-xs px-2">
                      {isReused 
                        ? "Já encontramos seu cadastro com esses dados. Vamos continuar o atendimento?" 
                        : "Sua solicitação foi registrada. Clique abaixo para iniciar a conversa no WhatsApp."}
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
