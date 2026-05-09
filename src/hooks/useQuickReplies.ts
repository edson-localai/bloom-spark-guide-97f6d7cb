import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QuickReply } from '@/types/crm';

export function useQuickReplies() {
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReplies();
  }, []);

  async function fetchReplies() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quick_replies')
        .select('*')
        .order('title', { ascending: true });
      if (error) throw error;
      setReplies(data as QuickReply[]);
    } catch (err) {
      console.error('Error fetching quick replies:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createReply(title: string, content: string, shortcut: string) {
    try {
      const { data, error } = await supabase
        .from('quick_replies')
        .insert({ title, content, shortcut })
        .select()
        .single();
      if (error) throw error;
      setReplies(prev => [...prev, data as QuickReply]);
      return data;
    } catch (err) {
      console.error('Error creating quick reply:', err);
      throw err;
    }
  }

  return { replies, loading, fetchReplies, createReply };
}
