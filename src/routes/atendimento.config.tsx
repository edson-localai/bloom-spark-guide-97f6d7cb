import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  Save,
  Bot,
  Shield,
  Clock,
  Bell,
  Loader2,
  Sparkles,
  ShieldAlert,
  Users,
  ChevronRight,
  MessageCircle,
  QrCode,
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import { useCrmAuth } from "@/hooks/useCrmAuth";

export const Route = createFileRoute("/atendimento/config")({
  component: ConfigPage,
});

function ConfigPage() {
  const { roles, loading: authLoading } = useCrmAuth();
  const isAdmin = roles.includes("admin");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const { data } = await supabase.from("app_settings").select("*");
    if (data) setSettings(data);
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      for (const setting of settings) {
        await supabase
          .from("app_settings")
          .upsert({ key: setting.key, value: setting.value }, { onConflict: "key" });
      }
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => {
      const exists = prev.some((s) => s.key === key);
      if (exists) return prev.map((s) => (s.key === key ? { ...s, value } : s));
      return [...prev, { key, value }];
    });
  };

  const getSetting = (key: string) => settings.find((s) => s.key === key)?.value || "";

  if (authLoading || loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0A0A0F]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-[#0A0A0F]">
        <div className="max-w-md text-center bg-[#0F1117] border border-[#1F232E] rounded-3xl p-12">
          <div className="h-16 w-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Você não tem permissão para acessar as Configurações. Este módulo é restrito apenas a
            administradores.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col overflow-auto custom-scrollbar"
      style={{ background: "#0A0A0F" }}
    >
      <div className="p-8 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Configurações do CRM</h1>
          <p className="text-zinc-500 text-sm">
            Ajuste o comportamento da Ana e as regras do sistema.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black px-6 py-2 rounded-xl font-bold text-sm transition-all"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Alterações
        </button>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* IA / Ana Settings */}
        <div className="space-y-6">
          <div className="bg-[#0F1117] rounded-3xl border border-[#1F232E] overflow-hidden">
            <div className="p-6 border-b border-[#1F232E] flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Personalidade da Ana</h3>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                  IA Engine Settings
                </p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  System Prompt (Instruções)
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                </label>
                <textarea
                  value={getSetting("system_prompt")}
                  onChange={(e) => updateSetting("system_prompt", e.target.value)}
                  className="w-full h-64 bg-[#151821] border border-[#1F232E] rounded-2xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                  placeholder="Instruções para a IA..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    IA Provider
                  </label>
                  <select
                    value={getSetting("active_ai_provider")}
                    onChange={(e) => updateSetting("active_ai_provider", e.target.value)}
                    className="w-full bg-[#151821] border border-[#1F232E] rounded-xl p-2.5 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="lovable">Lovable (Recomendado)</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Temperatura
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={getSetting("ai_temperature")}
                    onChange={(e) => updateSetting("ai_temperature", e.target.value)}
                    className="w-full bg-[#151821] border border-[#1F232E] rounded-xl p-2 text-sm text-zinc-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* General System Settings */}
        <div className="space-y-6">
          <div className="bg-[#0F1117] rounded-3xl border border-[#1F232E] overflow-hidden">
            <div className="p-6 border-b border-[#1F232E] flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Horário de Funcionamento</h3>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                  Business Rules
                </p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Mensagem de Offline
                </label>
                <textarea
                  value={getSetting("offline_message")}
                  onChange={(e) => updateSetting("offline_message", e.target.value)}
                  className="w-full h-24 bg-[#151821] border border-[#1F232E] rounded-2xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                />
              </div>
              <div className="p-4 bg-[#151821] rounded-2xl border border-[#1F232E] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Auto-Resposta (Bot)</p>
                    <p className="text-[10px] text-zinc-500">Ana responde sozinha em 'Bot'</p>
                  </div>
                  <button
                    onClick={() =>
                      updateSetting(
                        "auto_reply_active",
                        getSetting("auto_reply_active") === "true" ? "false" : "true",
                      )
                    }
                    className={`h-6 w-11 rounded-full relative transition-colors ${getSetting("auto_reply_active") === "true" ? "bg-cyan-500" : "bg-zinc-700"}`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white absolute top-1 transition-all ${getSetting("auto_reply_active") === "true" ? "right-1" : "left-1"}`}
                    />
                  </button>
                </div>
                <div className="h-px bg-[#1F232E]" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-bold uppercase tracking-widest">
                    Segunda a Sexta
                  </span>
                  <span className="text-cyan-400 font-mono">08:00 — 18:00</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-bold uppercase tracking-widest">Sábado</span>
                  <span className="text-cyan-400 font-mono">08:00 — 13:00</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-bold uppercase tracking-widest">Domingo</span>
                  <span className="text-red-500 font-bold uppercase tracking-widest">Fechado</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0F1117] rounded-3xl border border-[#1F232E] overflow-hidden">
            <div className="p-6 border-b border-[#1F232E] flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Segurança & API</h3>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                  Developer & Auth
                </p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#151821] rounded-2xl border border-[#1F232E]">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm text-zinc-300">Notificações Push</span>
                </div>
                <div className="h-5 w-10 rounded-full bg-emerald-500 relative cursor-pointer">
                  <div className="h-4 w-4 rounded-full bg-white absolute right-0.5 top-0.5 shadow-sm" />
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest px-2">
                  Links Rápidos
                </p>
                <a
                  href="/atendimento/usuarios"
                  className="flex items-center justify-between p-4 bg-cyan-500/5 hover:bg-cyan-500/10 rounded-2xl border border-cyan-500/20 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm text-cyan-100 font-semibold">
                      Gerenciar Usuários & Roles
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-cyan-500 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Stevo WhatsApp Connection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0F1117] rounded-3xl border border-[#1F232E] overflow-hidden">
            <div className="p-6 border-b border-[#1F232E] flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Stevo WhatsApp</h3>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                  Conexão da API & Pareamento
                </p>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Credenciais */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <Link2 className="h-3 w-3" /> URL da API Stevo
                  </label>
                  <input
                    type="text"
                    value={getSetting("stevo_api_url")}
                    onChange={(e) => updateSetting("stevo_api_url", e.target.value)}
                    placeholder="https://api.seudominio.com"
                    className="w-full bg-[#151821] border border-[#1F232E] rounded-xl p-2.5 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={getSetting("stevo_api_key")}
                    onChange={(e) => updateSetting("stevo_api_key", e.target.value)}
                    placeholder="apikey fornecida pela Stevo"
                    className="w-full bg-[#151821] border border-[#1F232E] rounded-xl p-2.5 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Nome da Instância
                  </label>
                  <input
                    type="text"
                    value={getSetting("stevo_instance_name")}
                    onChange={(e) => updateSetting("stevo_instance_name", e.target.value)}
                    placeholder="ex: hcb-principal"
                    className="w-full bg-[#151821] border border-[#1F232E] rounded-xl p-2.5 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed pt-2">
                  Salve as credenciais antes de conectar. A URL deve apontar para o domínio da sua
                  API Stevo (sem barra no final).
                </p>
              </div>

              {/* QR Code area */}
              <div className="space-y-4">
                <div className="aspect-square bg-[#151821] border-2 border-dashed border-[#1F232E] rounded-2xl flex flex-col items-center justify-center text-center p-6">
                  <QrCode className="h-16 w-16 text-zinc-700 mb-4" />
                  <p className="text-sm font-semibold text-zinc-400">QR Code aparecerá aqui</p>
                  <p className="text-xs text-zinc-600 mt-2 max-w-xs">
                    Após salvar as credenciais, clique em "Conectar Número" para gerar o QR e
                    parear o WhatsApp.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    toast.info("Integração Stevo será habilitada após configurar o backend.")
                  }
                  disabled={
                    !getSetting("stevo_api_url") ||
                    !getSetting("stevo_api_key") ||
                    !getSetting("stevo_instance_name")
                  }
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black px-6 py-3 rounded-xl font-bold text-sm transition-all"
                >
                  <QrCode className="h-4 w-4" />
                  Conectar Número
                </button>
                <div className="flex items-center justify-between p-3 bg-[#151821] rounded-xl border border-[#1F232E]">
                  <span className="text-xs text-zinc-500 uppercase font-bold tracking-widest">
                    Status
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">Desconectado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8" />
    </div>
  );
}
