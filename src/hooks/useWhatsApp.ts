import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WhatsAppInstance } from '@/types/crm';

export function useWhatsApp() {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstances();
  }, []);

  async function fetchInstances() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setInstances(data as WhatsAppInstance[]);
    } catch (err) {
      console.error('Error fetching WhatsApp instances:', err);
    } finally {
      setLoading(false);
    }
  }

  return { instances, loading, fetchInstances };
}
