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

    async function fetchRoles(userId: string) {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      setRoles((data ?? []).map((r) => r.role as AppRole));
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
