import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/crm';
import { handleAutoReply } from '@/lib/ai.functions';

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    fetchMessages(conversationId);

    const channel = supabase
      .channel(`public:messages:conversation_id=eq.${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function fetchMessages(id: string) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages(data as Message[]);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(content: string, type: any = 'text', isInternal: boolean = false) {
    if (!conversationId) return;
    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        content,
        content_type: type,
        sender_type: 'agent',
        is_internal: isInternal,
      });
      if (error) throw error;
    } catch (err) {
      console.error('Error sending message:', err);
    }
  }

  return { messages, loading, sendMessage };
}
