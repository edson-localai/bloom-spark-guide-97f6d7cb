import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { Save, Bot, Shield, Clock, Bell, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/atendimento/config')({
  component: ConfigPage,
});

function ConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const { data } = await supabase.from('app_settings').select('*');
    if (data) setSettings(data);
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      for (const setting of settings) {
        await supabase
          .from('app_settings')
          .update({ value: setting.value })
          .eq('key', setting.key);
      }
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const getSetting = (key: string) => settings.find(s => s.key === key)?.value || '';

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-auto custom-scrollbar" style={{ background: '#0A0A0F' }}>
      <div className="p-8 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Configurações do CRM</h1>
          <p className="text-zinc-500 text-sm">Ajuste o comportamento da Clara e as regras do sistema.</p>
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
        {/* IA / Clara Settings */}
        <div className="space-y-6">
          <div className="bg-[#0F1117] rounded-3xl border border-[#1F232E] overflow-hidden">
            <div className="p-6 border-b border-[#1F232E] flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Personalidade da Clara</h3>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">IA Engine Settings</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  System Prompt (Instruções)
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                </label>
                <textarea
                  value={getSetting('system_prompt')}
                  onChange={(e) => updateSetting('system_prompt', e.target.value)}
                  className="w-full h-64 bg-[#151821] border border-[#1F232E] rounded-2xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                  placeholder="Instruções para a IA..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">IA Provider</label>
                  <select 
                    value={getSetting('active_ai_provider')}
                    onChange={(e) => updateSetting('active_ai_provider', e.target.value)}
                    className="w-full bg-[#151821] border border-[#1F232E] rounded-xl p-2.5 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="lovable">Lovable (Recomendado)</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Temperatura</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={getSetting('ai_temperature')}
                    onChange={(e) => updateSetting('ai_temperature', e.target.value)}
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
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Business Rules</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Mensagem de Offline</label>
                <textarea
                  value={getSetting('offline_message')}
                  onChange={(e) => updateSetting('offline_message', e.target.value)}
                  className="w-full h-24 bg-[#151821] border border-[#1F232E] rounded-2xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                />
              </div>
              <div className="p-4 bg-[#151821] rounded-2xl border border-[#1F232E] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-bold uppercase tracking-widest">Segunda a Sexta</span>
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
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Developer & Auth</p>
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
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-8" />
    </div>
  );
}
