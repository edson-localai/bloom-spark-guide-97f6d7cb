import { createFileRoute } from '@tanstack/react-router';
import { BarChart3, Users, MessageSquare, Clock, TrendingUp, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const Route = createFileRoute('/atendimento/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const exportContacts = async () => {
    try {
      const { data } = await supabase.from('contacts').select('*');
      if (!data) return;

      const headers = ['Nome', 'Telefone', 'Veículo', 'Ano', 'Tags'];
      const rows = data.map(c => [
        c.name || '',
        c.phone,
        `${c.vehicle_brand || ''} ${c.vehicle_model || ''}`,
        c.vehicle_year || '',
        c.tags?.join(', ') || ''
      ]);

      const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `contatos_hcb_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Relatório de contatos exportado!');
    } catch (error) {
      toast.error('Erro ao exportar relatório.');
    }
  };
  return (
    <div className="h-full flex flex-col overflow-auto custom-scrollbar" style={{ background: '#0A0A0F' }}>
      <div className="p-8 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard de Performance</h1>
          <p className="text-zinc-500 text-sm">Visão geral do atendimento e produtividade da equipe.</p>
        </div>
        <button 
          onClick={exportContacts}
          className="flex items-center gap-2 bg-[#151821] border border-[#1F232E] text-zinc-300 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Atendimentos" 
          value="1.284" 
          change="+12.5%" 
          trend="up" 
          icon={MessageSquare} 
          color="#00CCEE" 
        />
        <StatCard 
          title="Novos Contatos" 
          value="84" 
          change="+5.2%" 
          trend="up" 
          icon={Users} 
          color="#8B5CF6" 
        />
        <StatCard 
          title="Tempo Médio" 
          value="4m 12s" 
          change="-18%" 
          trend="down" 
          icon={Clock} 
          color="#F59E0B" 
        />
        <StatCard 
          title="Taxa de Conversão" 
          value="24.8%" 
          change="+2.4%" 
          trend="up" 
          icon={TrendingUp} 
          color="#10B981" 
        />
      </div>

      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico Principal (Placeholder) */}
        <div className="lg:col-span-2 bg-[#0F1117] rounded-3xl border border-[#1F232E] p-8 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-white">Volume de Conversas</h3>
            <div className="flex gap-2">
              <button className="text-[10px] px-3 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase">7 dias</button>
              <button className="text-[10px] px-3 py-1 rounded text-zinc-600 hover:text-zinc-400 font-bold uppercase transition-colors">30 dias</button>
            </div>
          </div>
          <div className="flex-1 flex items-end gap-2 pb-4">
            {[45, 78, 56, 92, 67, 84, 110, 89, 120, 105, 95, 130].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-cyan-500/5 to-cyan-500/40 rounded-t-lg group relative" style={{ height: `${h}%` }}>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1F232E] text-white text-[10px] px-2 py-1 rounded border border-[#1F232E] opacity-0 group-hover:opacity-100 transition-opacity">
                  {h * 2}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-zinc-600 font-bold uppercase tracking-wider pt-4 border-t border-[#1F232E]">
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>
        </div>

        {/* Top Agentes */}
        <div className="bg-[#0F1117] rounded-3xl border border-[#1F232E] p-8 flex flex-col">
          <h3 className="font-bold text-white mb-8">Top Agentes</h3>
          <div className="space-y-6">
            <AgentRow name="Clara (IA)" role="Assistente" chats={842} score={98} />
            <AgentRow name="Rodrigo Souza" role="Admin" chats={312} score={95} />
            <AgentRow name="Márcia Lima" role="Agente" chats={130} score={92} />
          </div>
        </div>
      </div>
      
      <div className="p-8" />
    </div>
  );
}

function StatCard({ title, value, change, trend, icon: Icon, color }: any) {
  return (
    <div className="bg-[#0F1117] rounded-3xl border border-[#1F232E] p-6 hover:border-cyan-500/20 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center border transition-colors" 
          style={{ background: `${color}10`, borderColor: `${color}20`, color: color }}>
          <Icon className="h-5 w-5" />
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
          trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
        }`}>
          {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {change}
        </div>
      </div>
      <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function AgentRow({ name, role, chats, score }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#1F232E] flex items-center justify-center font-bold text-cyan-500">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{role}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-white">{chats}</p>
        <p className="text-[10px] text-emerald-500 font-bold">{score}% satisfação</p>
      </div>
    </div>
  );
}
