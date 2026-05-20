import { createFileRoute, Outlet, useNavigate, Link, useLocation, redirect } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { InstallAppPrompt } from '@/components/InstallAppPrompt';
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
  Menu,
  X,
  User,
} from 'lucide-react';

export const Route = createFileRoute('/atendimento')({
  beforeLoad: async ({ location }) => {
    if (typeof window === 'undefined') return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: '/login' });

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id);
    
    const userRoles = (roles ?? []).map(r => r.role as string);
    const path = location.pathname;

    const hasAdmin = userRoles.includes('admin');
    const hasSupervisor = userRoles.includes('supervisor') || hasAdmin;

    if (path.includes('/dashboard') || path.includes('/whatsapp')) {
      if (!hasSupervisor) {
        throw redirect({ to: '/atendimento' });
      }
    }

    if (path.includes('/config') || path.includes('/usuarios')) {
      if (!hasAdmin) {
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
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useNotifications(isAuthenticated && hasAnyRole);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: '/login' });
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
    <div
      className="h-[100dvh] flex flex-col md:flex-row overflow-hidden"
      style={{ background: '#0A0A0F', color: '#F4F4F5' }}
    >
      {/* Mobile Top Bar */}
      <div
        className="md:hidden h-14 px-4 flex items-center justify-between border-b shrink-0"
        style={{ background: '#0F1117', borderColor: '#1F232E' }}
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,204,238,0.15)', color: '#00CCEE' }}>
            <MessageSquare className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold text-white">HCB CRM</p>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 text-zinc-400 hover:text-white"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop / Tablet Sidebar */}
      <Sidebar email={user?.email ?? ''} role={roles[0]} />

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-72 z-50 flex flex-col"
              style={{ background: '#0F1117', borderRight: '1px solid #1F232E' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#1F232E' }}>
                <p className="text-sm font-semibold text-white">Menu</p>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-zinc-400">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarLinks role={roles[0]} />
              <SidebarFooter email={user?.email ?? ''} role={roles[0]} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 min-w-0 overflow-hidden relative pb-16 md:pb-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full relative"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav role={roles[0]} />

      <InstallAppPrompt />
    </div>
  );
}

function getNavItems(role?: string) {
  const all: { to: string; icon: typeof Inbox; label: string; exact?: boolean; roles?: string[] }[] = [
    { to: '/atendimento', icon: Inbox, label: 'Inbox', exact: true },
    { to: '/atendimento/kanban', icon: KanbanSquare, label: 'Kanban' },
    { to: '/atendimento/contatos', icon: Users, label: 'Contatos' },
    { to: '/atendimento/propostas', icon: FileText, label: 'Propostas' },
    { to: '/atendimento/respostas', icon: MessageSquare, label: 'Respostas' },
    { to: '/atendimento/whatsapp', icon: Smartphone, label: 'WhatsApp', roles: ['admin', 'supervisor'] },
    { to: '/atendimento/dashboard', icon: BarChart3, label: 'Dashboard', roles: ['admin', 'supervisor'] },
    { to: '/atendimento/treinamento', icon: GraduationCap, label: 'Treinamento' },
    { to: '/atendimento/usuarios', icon: ShieldCheck, label: 'Usuários', roles: ['admin'] },
    { to: '/atendimento/config', icon: Settings, label: 'Config', roles: ['admin'] },
    { to: '/atendimento/perfil', icon: User, label: 'Meu Perfil' },
  ];
  return all.filter(item => !item.roles || (role && item.roles.includes(role)));
}

function MobileBottomNav({ role }: { role?: string }) {
  const location = useLocation();
  const items = getNavItems(role).slice(0, 5);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 grid grid-cols-5 z-30 pb-[env(safe-area-inset-bottom)]"
      style={{ background: '#0F1117', borderTop: '1px solid #1F232E' }}
    >
      {items.map(item => {
        const Icon = item.icon;
        const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center gap-0.5 transition-colors"
            style={{ color: active ? '#00CCEE' : '#71717A' }}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarLinks({ role }: { role?: string }) {
  const location = useLocation();
  const items = getNavItems(role);

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {items.map(item => {
        const Icon = item.icon;
        const active = item.exact
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to);
        const style = {
          background: active ? 'rgba(0,204,238,0.1)' : 'transparent',
          color: active ? '#00CCEE' : '#A1A1AA',
          fontWeight: active ? 600 : 500,
        } as const;
        return (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors"
            style={style}
          >
            <Icon className="h-4 w-4" />
            <span className="flex-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ email, role }: { email: string; role?: string }) {
  return (
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
  );
}

function Sidebar({ email, role }: { email: string; role?: string }) {
  return (
    <aside
      className="hidden md:flex w-60 shrink-0 flex-col"
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

      <SidebarLinks role={role} />
      <SidebarFooter email={email} role={role} />
    </aside>
  );
}
