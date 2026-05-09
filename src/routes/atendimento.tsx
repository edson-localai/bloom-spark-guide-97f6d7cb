import { createFileRoute, Outlet, useNavigate, Link, useLocation, redirect } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
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
  FileText,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

export const Route = createFileRoute('/atendimento')({
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: '/login' });

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id);
    
    const userRoles = (roles ?? []).map(r => r.role as string);
    const path = location.pathname;

    if (path.includes('/dashboard') || path.includes('/whatsapp')) {
      if (!userRoles.includes('admin') && !userRoles.includes('supervisor')) {
        throw redirect({ to: '/atendimento' });
      }
    }

    if (path.includes('/config') || path.includes('/usuarios')) {
      if (!userRoles.includes('admin')) {
        throw redirect({ to: '/atendimento' });
      }
    }
  },
  component: AtendimentoLayout,
  head: () => ({ meta: [{ title: 'HCB CRM — Atendimento' }] }),
});

function AtendimentoLayout() {
  const { loading, isAuthenticated, hasAnyRole, user, roles } = useCrmAuth();
  const navigate = useNavigate();
  
  useNotifications(isAuthenticated && hasAnyRole);

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
      <main className="flex-1 min-w-0 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function Sidebar({ email, role }: { email: string; role?: string }) {
  const location = useLocation();

  const allItems: { to: string; icon: typeof Inbox; label: string; exact?: boolean; ready?: boolean; roles?: string[] }[] = [
    { to: '/atendimento', icon: Inbox, label: 'Inbox', exact: true, ready: true },
    { to: '/atendimento/kanban', icon: KanbanSquare, label: 'Kanban', ready: true },
    { to: '/atendimento/contatos', icon: Users, label: 'Contatos', ready: true },
    { to: '/atendimento/propostas', icon: FileText, label: 'Propostas', ready: true },
    { to: '/atendimento/respostas', icon: MessageSquare, label: 'Respostas', ready: true },
    { to: '/atendimento/whatsapp', icon: Smartphone, label: 'WhatsApp', ready: true, roles: ['admin', 'supervisor'] },
    { to: '/atendimento/dashboard', icon: BarChart3, label: 'Dashboard', ready: true, roles: ['admin', 'supervisor'] },
    { to: '/atendimento/treinamento', icon: GraduationCap, label: 'Treinamento', ready: true },
    { to: '/atendimento/usuarios', icon: ShieldCheck, label: 'Usuários', ready: true, roles: ['admin'] },
    { to: '/atendimento/config', icon: Settings, label: 'Configurações', ready: true, roles: ['admin'] },
  ];

  const items = allItems.filter(item => !item.roles || (role && item.roles.includes(role)));

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
          const style = {
            background: active ? 'rgba(0,204,238,0.1)' : 'transparent',
            color: active ? '#00CCEE' : item.ready ? '#A1A1AA' : '#52525B',
            fontWeight: active ? 600 : 500,
          } as const;
          const className = 'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors';
          const inner = (
            <>
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {!item.ready && (
                <span className="text-[9px] uppercase tracking-wider opacity-60">em breve</span>
              )}
            </>
          );
          return item.ready ? (
            <Link key={item.to} to={item.to} className={className} style={style}>
              {inner}
            </Link>
          ) : (
            <span key={item.to} className={className + ' cursor-not-allowed'} style={style}>
              {inner}
            </span>
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
