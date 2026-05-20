import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Conversation, Label } from '@/types/crm';

export type ConversationFilter = 'mine' | 'unassigned' | 'all' | 'resolved';

interface UseConversationsOptions {
  filter?: ConversationFilter;
  search?: string;
}

export function useConversations(options: UseConversationsOptions = {}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { filter = 'all', search = '' } = options;

  useEffect(() => {
    fetchConversations();

    const channel = supabase
      .channel('public:conversations_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => {
          // Re-fetch to get nested data (labels, contact) easily
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversation_labels' },
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter, search]);

  async function fetchConversations() {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;


      // Get current agent ID
      const { data: agentData } = await supabase
        .from('agents')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const agentId = agentData?.id;

      let query = supabase
        .from('conversations')
        .select(`
          *,
          contact:contact_id(*),
          conversation_labels(
            label:label_id(*)
          )
        `)
        .order('last_message_at', { ascending: false });

      // Apply filters
      if (filter === 'mine' && agentId) {
        query = query.eq('agent_id', agentId).neq('status', 'resolved');
      } else if (filter === 'unassigned') {
        query = query.is('agent_id', null).neq('status', 'resolved');
      } else if (filter === 'resolved') {
        query = query.eq('status', 'resolved');
      } else {
        // 'all' - excluding resolved usually by default in inbox views
        query = query.neq('status', 'resolved');
      }

      if (search) {
        // Simplified search, usually better handled by a dedicated search or computed on client for small lists
        // But for consistency:
        query = query.or(`whatsapp_chat_id.ilike.%${search}%,last_message.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Map labels from nested structure
      const mappedData = (data as any[]).map(conv => ({
        ...conv,
        labels: conv.conversation_labels?.map((cl: any) => cl.label).filter(Boolean) || []
      }));

      setConversations(mappedData);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }

  return { conversations, loading, refetch: fetchConversations };
}
