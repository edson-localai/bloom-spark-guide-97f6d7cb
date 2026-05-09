import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useTimeline(contactId: string | null) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!contactId) return;
    fetchEvents();
  }, [contactId]);

  async function fetchEvents() {
    setLoading(true);
    try {
      // Busca logs de auditoria e eventos de conversa relacionados ao contato
      // Para simplificar, buscamos audit_logs onde entity_id é o contactId ou conversationIds do contato
      
      const { data: convs } = await supabase
        .from('conversations')
        .select('id')
        .eq('contact_id', contactId);
      
      const convIds = convs?.map(c => c.id) || [];

      const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .or(`entity_id.eq.${contactId},entity_id.in.(${convIds.join(',')})`)
        .order('created_at', { ascending: false });

      setEvents(logs || []);
    } catch (err) {
      console.error('Timeline fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  return { events, loading, refresh: fetchEvents };
}
