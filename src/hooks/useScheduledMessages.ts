import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScheduledMessage } from "@/types/crm";

export function useScheduledMessages(conversationId: string | null) {
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setScheduledMessages([]);
      return;
    }

    fetchScheduled();

    const channel = supabase
      .channel(`public:scheduled_messages:conversation_id=eq.${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scheduled_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          fetchScheduled();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function fetchScheduled() {
    if (!conversationId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("scheduled_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("scheduled_for", { ascending: true });
      if (error) throw error;
      setScheduledMessages(data as ScheduledMessage[]);
    } catch (err) {
      console.error("Error fetching scheduled messages:", err);
    } finally {
      setLoading(false);
    }
  }

  async function cancelMessage(id: string) {
    try {
      const { error } = await supabase
        .from("scheduled_messages")
        .update({ status: "cancelled" } as any)
        .eq("id", id);

      if (error) throw error;

      // Atualização local otimista
      setScheduledMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "cancelled" } : m)),
      );
    } catch (err) {
      console.error("Error cancelling message:", err);
      throw err;
    }
  }

  return { scheduledMessages, loading, cancelMessage, refresh: fetchScheduled };
}
