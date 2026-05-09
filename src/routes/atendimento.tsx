import { createFileRoute, Outlet, useNavigate, Link, useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Inbox,
  KanbanSquare,
  Users,
  MessageSquare,
  Settings,
  BarChart3,
  Smartphone,
  LogOut,
  Loader2,
} from 'lucide-react';

export const Route = createFileRoute('/atendimento')({
  component: AtendimentoLayout,
  head: () => ({ meta: [{ title: 'HCB CRM — Atendimento' }] }),
});

function AtendimentoLayout() {
  const { loading, isAuthenticated, hasAnyRole, user, roles } = useCrmAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: '/login' });
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0F' }}>
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (!hasAnyRole) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0A0A0F' }}>
        <div className="max-w-md text-center rounded-2xl p-8" style={{ background: '#151821', border: '1px solid #1F232E' }}>
          <h2 className="text-lg font-semibold text-white mb-2">Sem permissão</h2>
          <p className="text-sm text-zinc-400 mb-6">
            Sua conta ({user?.email}) ainda não tem nenhum papel atribuído. Peça ao admin para liberar seu acesso.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm px-4 py-2 rounded-md"
            style={{ background: '#1F232E', color: '#A1A1AA' }}
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0A0A0F', color: '#F4F4F5' }}>
      <Sidebar email={user?.email ?? ''} role={roles[0]} />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

function Sidebar({ email, role }: { email: string; role?: string }) {
  const location = useLocation();

  const items = [
    { to: '/atendimento', icon: Inbox, label: 'Inbox', exact: true },
    { to: '/atendimento/kanban', icon: KanbanSquare, label: 'Kanban' },
    { to: '/atendimento/contatos', icon: Users, label: 'Contatos' },
    { to: '/atendimento/respostas', icon: MessageSquare, label: 'Respostas' },
    { to: '/atendimento/whatsapp', icon: Smartphone, label: 'WhatsApp' },
    { to: '/atendimento/dashboard', icon: BarChart3, label: 'Dashboard' },
    { to: '/atendimento/config', icon: Settings, label: 'Configurações' },
  ];

  return (
    <aside
      className="w-60 shrink-0 flex flex-col"
      style={{ background: '#0F1117', borderRight: '1px solid #1F232E' }}
    >
      <div className="px-5 py-5 flex items-center gap-3 border-b" style={{ borderColor: '#1F232E' }}>
        <div
          className="h-9 w-9 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(0,204,238,0.15)', color: '#00CCEE' }}
        >
          <MessageSquare className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">HCB CRM</p>
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Atendimento</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors"
              style={{
                background: active ? 'rgba(0,204,238,0.1)' : 'transparent',
                color: active ? '#00CCEE' : '#A1A1AA',
                fontWeight: active ? 600 : 500,
              }}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t" style={{ borderColor: '#1F232E' }}>
        <div className="px-3 py-2 mb-2">
          <p className="text-xs text-zinc-300 truncate">{email}</p>
          {role && <p className="text-[10px] uppercase tracking-wider text-cyan-400 mt-0.5">{role}</p>}
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-zinc-400 hover:text-white transition-colors"
          style={{ background: '#151821' }}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
