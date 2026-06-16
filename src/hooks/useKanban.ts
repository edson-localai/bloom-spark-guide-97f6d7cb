import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, Contact } from "@/types/crm";
import { logAudit } from "@/services/auditService";

export function useKanban() {
  const [items, setItems] = useState<(Conversation & { contact: Contact | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKanban();
  }, []);

  async function fetchKanban() {
    setLoading(true);
    const { data } = await supabase
      .from("conversations")
      .select("*, contact:contact_id(*)")
      .order("updated_at", { ascending: false });
    if (data) setItems(data as any);
    setLoading(false);
  }

  async function moveCard(id: string, newStatus: string) {
    try {
      const old = items.find((i) => i.id === id);
      const { error } = await supabase
        .from("conversations")
        .update({
          status: newStatus as any,
          resolved_at: newStatus === "resolved" ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus as any } : item)),
      );

      logAudit({
        action: "kanban.move",
        entityType: "conversation",
        entityId: id,
        oldData: { status: old?.status },
        newData: { status: newStatus },
      });

      // Se resolvido, envia NPS automático
      if (newStatus === "resolved") {
        await supabase.from("messages").insert({
          conversation_id: id,
          content: "Obrigado por falar com a HCB! 🌟 Como você avalia nosso atendimento de 0 a 10?",
          sender_type: "bot",
        });
      }
    } catch (error) {
      console.error("Error moving card:", error);
    }
  }

  return { items, loading, moveCard };
}
