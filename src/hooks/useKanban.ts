import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Conversation, Contact } from '@/types/crm';

export function useKanban() {
  const [items, setItems] = useState<(Conversation & { contact: Contact | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKanban();
  }, []);

  async function fetchKanban() {
    setLoading(true);
    const { data } = await supabase
      .from('conversations')
      .select('*, contact:contact_id(*)')
      .order('updated_at', { ascending: false });
    if (data) setItems(data as any);
    setLoading(false);
  }

  async function moveCard(id: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status: newStatus as any })
        .eq('id', id);
      if (error) throw error;
      setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus as any } : item));
    } catch (error) {
      console.error('Error moving card:', error);
    }
  }

  return { items, loading, moveCard };
}
