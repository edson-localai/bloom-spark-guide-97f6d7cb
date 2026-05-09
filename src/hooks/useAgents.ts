import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Agent } from '@/types/crm';

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setAgents(data as any);
    } catch (err) {
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  }

  return { agents, loading, fetchAgents };
}
