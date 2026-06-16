import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useTimeline(contactId: string | null) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!contactId) return;
    fetchEvents();
  }, [contactId]);

  async function fetchEvents() {
    if (!contactId) return;
    setLoading(true);
    try {
      const { data: convs } = await supabase
        .from("conversations")
        .select("id")
        .eq("contact_id", contactId);

      const convIds = convs?.map((c) => c.id) || [];
      const filter =
        convIds.length > 0
          ? `entity_id.eq.${contactId},entity_id.in.(${convIds.join(",")})`
          : `entity_id.eq.${contactId}`;

      const { data: logs } = await supabase
        .from("audit_logs")
        .select("*")
        .or(filter)
        .order("created_at", { ascending: false });

      setEvents(logs || []);
    } catch (err) {
      console.error("Timeline fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  return { events, loading, refresh: fetchEvents };
}
