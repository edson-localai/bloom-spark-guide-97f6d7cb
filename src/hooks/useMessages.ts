import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

import { Message } from "@/types/crm";
import { handleAutoReply } from "@/lib/ai.functions";
import { sendWhatsAppMessage } from "@/lib/whatsapp.functions";
import { toast } from "sonner";

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
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // Trigger Auto-reply se for mensagem do contato
          if (newMsg.sender_type === "contact") {
            handleAutoReply({
              data: {
                conversationId: conversationId,
                content: newMsg.content || "",
              },
            });
          }
        },
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
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data as Message[]);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(content: string, type: any = "text", isInternal: boolean = false) {
    if (!conversationId) return;
    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        content,
        content_type: type,
        sender_type: "agent",
        is_internal: isInternal,
      });
      if (error) throw error;

      // Se um humano responder, bloqueia a IA por 24h e move para atendimento humano
      if (!isInternal) {
        await supabase
          .from("conversations")
          .update({
            bot_active: false,
            bot_disabled_at: new Date().toISOString(),
            status: "open",
          })
          .eq("id", conversationId);
      }

      // Forward to WhatsApp (skip internal notes)
      if (!isInternal && type === "text") {
        try {
          await sendWhatsAppMessage({ data: { conversationId, content } });
        } catch (waErr) {
          console.warn("WhatsApp delivery failed:", waErr);
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  }

  async function deleteMessage(messageId: string) {
    if (!conversationId) return;
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId)
        .eq("conversation_id", conversationId);

      if (error) throw error;

      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      toast.success("Mensagem apagada!");
    } catch (err) {
      console.error("Error deleting message:", err);
      toast.error("Erro ao apagar mensagem.");
    }
  }

  const addEvent = useCallback(
    async (content: string) => {
      if (!conversationId) return;
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        content,
        content_type: "event",
        sender_type: "system",
      });
    },
    [conversationId],
  );

  return { messages, loading, sendMessage, deleteMessage, addEvent };
}
