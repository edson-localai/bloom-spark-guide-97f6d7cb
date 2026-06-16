import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Hourglass,
  ShieldAlert,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCrmAuth } from "@/hooks/useCrmAuth";
import { toastError } from "@/lib/error-handler";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/atendimento/dashboard")({
  component: DashboardPage,
});

type Preset = "7d" | "30d" | "custom";

interface DashboardMetrics {
  totalConversations: number;
  totalConversationsPrev: number;
  newContacts: number;
  newContactsPrev: number;
  avgWaitLabel: string;
  waitingNow: number;
  conversionRate: number | null;
  conversionRatePrev: number | null;
  perDay: { date: string; count: number }[];
  topAgents: { id: string; name: string; role: string | null; chats: number }[];
}

const EMPTY_METRICS: DashboardMetrics = {
  totalConversations: 0,
  totalConversationsPrev: 0,
  newContacts: 0,
  newContactsPrev: 0,
  avgWaitLabel: "--",
  waitingNow: 0,
  conversionRate: null,
  conversionRatePrev: null,
  perDay: [],
  topAgents: [],
};

function formatPct(curr: number, prev: number): { label: string; trend: "up" | "down" } {
  if (prev === 0) {
    return { label: curr === 0 ? "Sem dados" : "+100%", trend: curr === 0 ? "down" : "up" };
  }
  const diff = ((curr - prev) / prev) * 100;
  const trend: "up" | "down" = diff >= 0 ? "up" : "down";
  return { label: `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`, trend };
}

function formatPctPoints(curr: number | null, prev: number | null): { label: string; trend: "up" | "down" } {
  if (curr === null || prev === null) return { label: "Sem comparativo", trend: "up" };
  const diff = curr - prev;
  const trend: "up" | "down" = diff >= 0 ? "up" : "down";
  return { label: `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}pp`, trend };
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function DashboardPage() {
  const { roles, loading: authLoading } = useCrmAuth();
  const isSupervisor = roles.includes("admin") || roles.includes("supervisor");
  const [preset, setPreset] = useState<Preset>("7d");
  const [range, setRange] = useState<DateRange | undefined>(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 6);
    return { from: startOfDay(from), to: endOfDay(to) };
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);

  // Resolve effective range from preset
  const effectiveRange = useMemo<{ from: Date; to: Date } | null>(() => {
    if (preset === "custom") {
      if (range?.from && range?.to) return { from: startOfDay(range.from), to: endOfDay(range.to) };
      if (range?.from) return { from: startOfDay(range.from), to: endOfDay(range.from) };
      return null;
    }
    const days = preset === "7d" ? 7 : 30;
    const to = endOfDay(new Date());
    const from = startOfDay(new Date(Date.now() - (days - 1) * 86_400_000));
    return { from, to };
  }, [preset, range]);

  const periodDays = useMemo(() => {
    if (!effectiveRange) return 0;
    return Math.max(1, Math.round((effectiveRange.to.getTime() - effectiveRange.from.getTime()) / 86_400_000) + 1);
  }, [effectiveRange]);

  useEffect(() => {
    if (!isSupervisor || !effectiveRange) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const startCurr = effectiveRange!.from.toISOString();
        const endCurr = effectiveRange!.to.toISOString();
        const spanMs = effectiveRange!.to.getTime() - effectiveRange!.from.getTime();
        const startPrev = new Date(effectiveRange!.from.getTime() - spanMs - 1).toISOString();
        const endPrev = new Date(effectiveRange!.from.getTime() - 1).toISOString();

        const [
          waitingQ,
          convsCurr,
          convsPrev,
          contactsCurr,
          contactsPrev,
          assigned,
          agents,
          msgCounts,
          leadMsgsCurr,
          leadMsgsPrev,
          salesCurr,
          salesPrev,
        ] = await Promise.all([
          supabase.from("waiting_queue").select("*", { count: "exact", head: true }),
          supabase
            .from("conversations")
            .select("id, created_at", { count: "exact" })
            .gte("created_at", startCurr)
            .lte("created_at", endCurr),
          supabase
            .from("conversations")
            .select("id", { count: "exact", head: true })
            .gte("created_at", startPrev)
            .lte("created_at", endPrev),
          supabase
            .from("contacts")
            .select("id", { count: "exact", head: true })
            .gte("created_at", startCurr)
            .lte("created_at", endCurr),
          supabase
            .from("contacts")
            .select("id", { count: "exact", head: true })
            .gte("created_at", startPrev)
            .lte("created_at", endPrev),
          supabase
            .from("conversations")
            .select("created_at, updated_at")
            .not("agent_id", "is", null)
            .gte("created_at", startCurr)
            .lte("created_at", endCurr)
            .limit(500),
          supabase.from("agents").select("id, name, role").limit(20),
          supabase
            .from("messages")
            .select("sender_id")
            .eq("sender_type", "agent")
            .gte("created_at", startCurr)
            .lte("created_at", endCurr)
            .limit(5000),
          // LEADS = contatos distintos com 1ª mensagem recebida no período (created_at)
          supabase
            .from("messages")
            .select("sender_id, conversation_id, created_at")
            .eq("sender_type", "contact")
            .gte("created_at", startCurr)
            .lte("created_at", endCurr)
            .limit(10000),
          supabase
            .from("messages")
            .select("sender_id, conversation_id, created_at")
            .eq("sender_type", "contact")
            .gte("created_at", startPrev)
            .lte("created_at", endPrev)
            .limit(10000),
          // VENDAS = propostas aceitas no período (updated_at)
          supabase
            .from("proposals")
            .select("id, contact_id, conversation_id, updated_at")
            .eq("status", "accepted")
            .gte("updated_at", startCurr)
            .lte("updated_at", endCurr)
            .limit(5000),
          supabase
            .from("proposals")
            .select("id, contact_id, conversation_id, updated_at")
            .eq("status", "accepted")
            .gte("updated_at", startPrev)
            .lte("updated_at", endPrev)
            .limit(5000),
        ]);

        if (cancelled) return;

        // Avg wait time
        let avgWaitLabel = "--";
        if (assigned.data && assigned.data.length > 0) {
          const totalMs = assigned.data.reduce((acc, c) => {
            const created = new Date(c.created_at!).getTime();
            const updated = new Date(c.updated_at!).getTime();
            return acc + Math.max(0, updated - created);
          }, 0);
          const avgSec = Math.floor(totalMs / assigned.data.length / 1000);
          const m = Math.floor(avgSec / 60);
          const s = avgSec % 60;
          avgWaitLabel = `${m}m ${s}s`;
        }

        // Per-day conversation volume
        const perDayMap = new Map<string, number>();
        const dayCount = Math.max(1, Math.round((effectiveRange!.to.getTime() - effectiveRange!.from.getTime()) / 86_400_000) + 1);
        for (let i = 0; i < dayCount; i++) {
          const d = new Date(effectiveRange!.from.getTime() + i * 86_400_000);
          perDayMap.set(d.toISOString().slice(0, 10), 0);
        }
        (convsCurr.data ?? []).forEach((c) => {
          const day = (c.created_at ?? "").slice(0, 10);
          if (perDayMap.has(day)) perDayMap.set(day, (perDayMap.get(day) ?? 0) + 1);
        });
        const perDay = Array.from(perDayMap.entries()).map(([date, count]) => ({ date, count }));

        // Top agents by outbound messages sent
        const counts = new Map<string, number>();
        (msgCounts.data ?? []).forEach((m: any) => {
          if (!m.sender_id) return;
          counts.set(m.sender_id, (counts.get(m.sender_id) ?? 0) + 1);
        });
        const topAgents = (agents.data ?? [])
          .map((a: any) => ({
            id: a.id,
            name: a.name ?? "Agente",
            role: a.role ?? null,
            chats: counts.get(a.id) ?? 0,
          }))
          .sort((a, b) => b.chats - a.chats)
          .slice(0, 5);

        // Conversion rate = conversations with at least one accepted proposal / total conversations
        const totalConv = convsCurr.count ?? 0;
        const totalConvPrev = convsPrev.count ?? 0;
        const convertedCurrSet = new Set(
          (acceptedCurr.data ?? []).map((p: any) => p.conversation_id).filter(Boolean),
        );
        const convertedPrevSet = new Set(
          (acceptedPrev.data ?? []).map((p: any) => p.conversation_id).filter(Boolean),
        );
        const conversionRate = totalConv > 0 ? (convertedCurrSet.size / totalConv) * 100 : null;
        const conversionRatePrev =
          totalConvPrev > 0 ? (convertedPrevSet.size / totalConvPrev) * 100 : null;

        setMetrics({
          totalConversations: totalConv,
          totalConversationsPrev: totalConvPrev,
          newContacts: contactsCurr.count ?? 0,
          newContactsPrev: contactsPrev.count ?? 0,
          avgWaitLabel,
          waitingNow: waitingQ.count ?? 0,
          conversionRate,
          conversionRatePrev,
          perDay,
          topAgents,
        });
      } catch (err) {
        if (!cancelled) {
          toastError(err, "Não foi possível carregar as métricas.");
          setMetrics(EMPTY_METRICS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isSupervisor, effectiveRange?.from.getTime(), effectiveRange?.to.getTime()]);

  const convPct = useMemo(
    () => formatPct(metrics.totalConversations, metrics.totalConversationsPrev),
    [metrics.totalConversations, metrics.totalConversationsPrev],
  );
  const contactsPct = useMemo(
    () => formatPct(metrics.newContacts, metrics.newContactsPrev),
    [metrics.newContacts, metrics.newContactsPrev],
  );
  const conversionDelta = useMemo(
    () => formatPctPoints(metrics.conversionRate, metrics.conversionRatePrev),
    [metrics.conversionRate, metrics.conversionRatePrev],
  );

  const maxDay = Math.max(1, ...metrics.perDay.map((d) => d.count));

  const periodLabel = useMemo(() => {
    if (!effectiveRange) return "—";
    if (preset === "7d") return "Últimos 7 dias";
    if (preset === "30d") return "Últimos 30 dias";
    const sameDay = effectiveRange.from.toDateString() === effectiveRange.to.toDateString();
    if (sameDay) return format(effectiveRange.from, "dd/MM/yyyy", { locale: ptBR });
    return `${format(effectiveRange.from, "dd/MM/yyyy", { locale: ptBR })} – ${format(effectiveRange.to, "dd/MM/yyyy", { locale: ptBR })}`;
  }, [preset, effectiveRange]);

  const exportContacts = async () => {
    try {
      const { data } = await supabase.from("contacts").select("*");
      if (!data || data.length === 0) {
        toast("Nenhum contato para exportar.");
        return;
      }
      const headers = ["Nome", "Telefone", "Veículo", "Ano", "Tags"];
      const rows = data.map((c) => [
        c.name || "",
        c.phone,
        `${c.vehicle_brand || ""} ${c.vehicle_model || ""}`.trim(),
        c.vehicle_year || "",
        c.tags?.join(", ") || "",
      ]);
      const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `contatos_hcb_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Relatório de contatos exportado!");
    } catch (err) {
      toastError(err, "Erro ao exportar relatório.");
    }
  };

  if (authLoading) return null;

  if (!isSupervisor) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-[#0A0A0F]">
        <div className="max-w-md text-center bg-[#0F1117] border border-[#1F232E] rounded-3xl p-12">
          <div className="h-16 w-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Você não tem permissão para acessar o Dashboard. Este módulo é restrito a supervisores e
            administradores.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-auto custom-scrollbar" style={{ background: "#0A0A0F" }}>
      <div className="p-8 pb-4 flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard de Performance</h1>
          <p className="text-zinc-500 text-sm">
            Visão geral do atendimento e produtividade da equipe.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 bg-[#0F1117] border border-[#1F232E] rounded-xl p-1">
            <PresetButton active={preset === "7d"} onClick={() => setPreset("7d")}>7 dias</PresetButton>
            <PresetButton active={preset === "30d"} onClick={() => setPreset("30d")}>30 dias</PresetButton>
            <PresetButton active={preset === "custom"} onClick={() => { setPreset("custom"); setPickerOpen(true); }}>Personalizado</PresetButton>
          </div>
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-2 bg-[#0F1117] border border-[#1F232E] text-zinc-300 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                  preset === "custom" && "border-cyan-500/40 text-cyan-300",
                )}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                {periodLabel}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#0F1117] border-[#1F232E]" align="end">
              <Calendar
                mode="range"
                selected={range}
                onSelect={(r) => {
                  setRange(r);
                  setPreset("custom");
                  if (r?.from && r?.to) setPickerOpen(false);
                }}
                numberOfMonths={2}
                locale={ptBR}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <button
            onClick={exportContacts}
            className="flex items-center gap-2 bg-[#151821] border border-[#1F232E] text-zinc-300 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="px-8 pb-2 text-[10px] uppercase font-bold tracking-widest text-zinc-600">
        Período: {periodLabel} · vs. {periodDays} {periodDays === 1 ? "dia" : "dias"} anteriores
      </div>

      <div className="p-8 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Conversas"
          value={loading ? "…" : metrics.totalConversations.toLocaleString("pt-BR")}
          change={convPct.label}
          trend={convPct.trend}
          icon={MessageSquare}
          color="#00CCEE"
        />
        <StatCard
          title="Novos Contatos"
          value={loading ? "…" : metrics.newContacts.toLocaleString("pt-BR")}
          change={contactsPct.label}
          trend={contactsPct.trend}
          icon={Users}
          color="#8B5CF6"
        />
        <StatCard
          title="Tempo Médio de Espera"
          value={loading ? "…" : metrics.avgWaitLabel}
          change={metrics.waitingNow > 0 ? `${metrics.waitingNow} na fila` : "Fila vazia"}
          trend={metrics.waitingNow > 0 ? "up" : "down"}
          icon={Hourglass}
          color="#F59E0B"
        />
        <StatCard
          title="Taxa de Conversão"
          value={
            loading
              ? "…"
              : metrics.conversionRate !== null
                ? `${metrics.conversionRate.toFixed(1)}%`
                : "--"
          }
          change={conversionDelta.label}
          trend={conversionDelta.trend}
          icon={TrendingUp}
          color="#10B981"
        />
      </div>

      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Volume de Conversas */}
        <div className="lg:col-span-2 bg-[#0F1117] rounded-3xl border border-[#1F232E] p-8 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-white">Volume de Conversas</h3>
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
              {periodLabel}
            </span>
          </div>
          {metrics.perDay.length === 0 || metrics.perDay.every((d) => d.count === 0) ? (
            <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
              {loading ? "Carregando…" : "Sem conversas no período."}
            </div>
          ) : (
            <>
              <div className="flex-1 flex items-end gap-2 pb-4">
                {metrics.perDay.map((d) => (
                  <div
                    key={d.date}
                    className="flex-1 bg-gradient-to-t from-cyan-500/5 to-cyan-500/40 rounded-t-lg group relative"
                    style={{ height: `${Math.max(2, (d.count / maxDay) * 100)}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1F232E] text-white text-[10px] px-2 py-1 rounded border border-[#1F232E] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {d.date.slice(5)} · {d.count}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-zinc-600 font-bold uppercase tracking-wider pt-4 border-t border-[#1F232E]">
                {metrics.perDay.length <= 7 ? (
                  metrics.perDay.map((d) => (
                    <span key={d.date}>
                      {new Date(d.date).toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
                    </span>
                  ))
                ) : (
                  <>
                    <span>{metrics.perDay[0]?.date.slice(5)}</span>
                    <span>{metrics.perDay[Math.floor(metrics.perDay.length / 2)]?.date.slice(5)}</span>
                    <span>{metrics.perDay[metrics.perDay.length - 1]?.date.slice(5)}</span>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Top Agentes */}
        <div className="bg-[#0F1117] rounded-3xl border border-[#1F232E] p-8 flex flex-col">
          <h3 className="font-bold text-white mb-8">Top Agentes</h3>
          {metrics.topAgents.length === 0 || metrics.topAgents.every((a) => a.chats === 0) ? (
            <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm text-center">
              {loading ? "Carregando…" : "Sem atividade de agentes no período."}
            </div>
          ) : (
            <div className="space-y-6">
              {metrics.topAgents
                .filter((a) => a.chats > 0)
                .map((a) => (
                  <AgentRow key={a.id} name={a.name} role={a.role ?? "Agente"} chats={a.chats} />
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-8" />
    </div>
  );
}

function PresetButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-[11px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors",
        active
          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
          : "text-zinc-500 hover:text-zinc-300 border border-transparent",
      )}
    >
      {children}
    </button>
  );
}

function StatCard({ title, value, change, trend, icon: Icon, color }: any) {
  return (
    <div className="bg-[#0F1117] rounded-3xl border border-[#1F232E] p-6 hover:border-cyan-500/20 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center border transition-colors"
          style={{ background: `${color}10`, borderColor: `${color}20`, color: color }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div
          className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
            trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
          }`}
        >
          {trend === "up" ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {change}
        </div>
      </div>
      <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function AgentRow({ name, role, chats }: { name: string; role: string; chats: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#1F232E] flex items-center justify-center font-bold text-cyan-500">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{role}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-white">{chats}</p>
        <p className="text-[10px] text-zinc-500 font-bold">mensagens</p>
      </div>
    </div>
  );
}
