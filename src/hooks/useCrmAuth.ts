import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from '@/types/crm';

export interface CrmAuthState {
  loading: boolean;
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  isAuthenticated: boolean;
  hasAnyRole: boolean;
  isAdmin: boolean;
  isSupervisor: boolean;
}

const CRM_MASTER_EMAIL = 'hcbautomotivo@gmail.com';

function normalizeRoles(userEmail: string | undefined, fetchedRoles: AppRole[]): AppRole[] {
  if (userEmail?.toLowerCase() !== CRM_MASTER_EMAIL) return fetchedRoles;
  return fetchedRoles.includes('admin') ? fetchedRoles : ['admin', ...fetchedRoles];
}

export function useCrmAuth(): CrmAuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      // defer the role fetch so we don't deadlock the auth state callback
      if (s?.user) {
        setTimeout(() => fetchRoles(s.user.id), 0);
      } else {
        setRoles([]);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        fetchRoles(s.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    async function fetchRoles(userId: string, userEmail?: string) {
      // Prefer RPC (security definer) — bypasses any RLS oddities and is the
      // canonical way to fetch the current user's roles.
      const rpc = await supabase.rpc('get_my_roles');
      if (!rpc.error && rpc.data) {
        const fetchedRoles = (rpc.data as { role?: AppRole }[] | AppRole[]).map((r: any) =>
          (typeof r === 'string' ? r : r.role) as AppRole,
        );
        setRoles(normalizeRoles(userEmail, fetchedRoles));
        return;
      }
      if (rpc.error) {
        console.warn('[useCrmAuth] get_my_roles RPC failed, falling back', rpc.error);
      }
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      if (error) console.error('[useCrmAuth] user_roles select failed', error);
      setRoles(normalizeRoles(userEmail, (data ?? []).map((r) => r.role as AppRole)));
    }

    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    loading,
    session,
    user: session?.user ?? null,
    roles,
    isAuthenticated: !!session,
    hasAnyRole: roles.length > 0,
    isAdmin: roles.includes('admin'),
    isSupervisor: roles.includes('supervisor') || roles.includes('admin'),
  };
}
