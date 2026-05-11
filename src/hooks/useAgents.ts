import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Agent } from '@/types/crm';

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [onlineAgents, setOnlineAgents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();

    // Configuração de Presence/Realtime — nome único evita reusar canal já inscrito (StrictMode/HMR)
    const channelName = `online-agents-${Math.random().toString(36).slice(2, 8)}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: 'user',
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineIds = Object.values(state)
          .flat()
          .map((p: any) => p.user_id)
          .filter(Boolean);
        setOnlineAgents(onlineIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
            // Marca o próprio agente como online no banco (lido pelo webhook para auto-atribuição)
            await supabase.from('agents').update({ status: 'online' }).eq('user_id', user.id);
          }
        }
      });

    const setOffline = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.from('agents').update({ status: 'offline' }).eq('user_id', user.id);
    };
    window.addEventListener('beforeunload', setOffline);

    return () => {
      window.removeEventListener('beforeunload', setOffline);
      setOffline();
      supabase.removeChannel(channel);
    };
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

  return { agents, onlineAgents, loading, fetchAgents };
}
