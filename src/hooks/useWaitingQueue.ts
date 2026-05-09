import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAgents } from './useAgents';
import { toast } from 'sonner';

export interface QueueEntry {
  id: string;
  conversation_id: string;
  contact_id: string | null;
  priority: string;
  entered_at: string;
}

export function useWaitingQueue() {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { onlineAgents } = useAgents();

  useEffect(() => {
    fetchQueue();

    const channel = supabase
      .channel('public:waiting_queue')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'waiting_queue' },
        () => fetchQueue()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-reatribuição: quando um agente fica online e há fila, atribui o mais antigo
  useEffect(() => {
    if (onlineAgents.length > 0 && queue.length > 0) {
      autoAssign();
    }
  }, [onlineAgents, queue]);

  async function fetchQueue() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('waiting_queue')
        .select('*')
        .order('entered_at', { ascending: true });
      if (error) throw error;
      setQueue(data as QueueEntry[]);
    } catch (err) {
      console.error('Error fetching queue:', err);
    } finally {
      setLoading(false);
    }
  }

  async function autoAssign() {
    try {
      const oldestEntry = queue[0];
      if (!oldestEntry) return;

      // Pega o primeiro agente online disponível
      const { data: agents } = await supabase
        .from('agents')
        .select('id, name, user_id')
        .in('user_id', onlineAgents)
        .limit(1);

      if (!agents || agents.length === 0) return;

      const targetAgent = agents[0];

      const { error } = await supabase
        .from('conversations')
        .update({ 
          agent_id: targetAgent.id,
          status: 'active' as any
        })
        .eq('id', oldestEntry.conversation_id);

      if (!error) {
        toast.success(`Conversa atribuída automaticamente para ${targetAgent.name}`);
      }
    } catch (err) {
      console.error('Auto-assign error:', err);
    }
  }

  async function addToQueue(conversationId: string, contactId?: string) {
    try {
      const { error } = await supabase
        .from('waiting_queue')
        .upsert({
          conversation_id: conversationId,
          contact_id: contactId,
        }, { onConflict: 'conversation_id' });
      
      if (error) throw error;
    } catch (err) {
      console.error('Error adding to queue:', err);
      throw err;
    }
  }

  return { queue, loading, addToQueue, autoAssign };
}
