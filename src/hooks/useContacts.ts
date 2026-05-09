import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/types/crm';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setContacts(data as Contact[]);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateContact(id: string, updates: Partial<Contact>) {
    try {
      const { error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
      setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (err) {
      console.error('Error updating contact:', err);
      throw err;
    }
  }

  return { contacts, loading, fetchContacts, updateContact };
}
