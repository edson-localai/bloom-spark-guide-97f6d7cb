import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useNotifications(enabled: boolean = true) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioScheduledRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let alertInterval: number | null = null;
    const playAlertSound = () => {
      audioRef.current?.play().catch(() => {});
    };

    const startRecursiveAlert = () => {
      if (alertInterval) return;
      playAlertSound();
      alertInterval = window.setInterval(playAlertSound, 10000); // 10 seconds interval
    };

    const stopRecursiveAlert = () => {
      if (alertInterval) {
        clearInterval(alertInterval);
        alertInterval = null;
      }
    };

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    audioRef.current =
      typeof Audio !== "undefined"
        ? new Audio(
            "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=",
          )
        : null;

    audioScheduledRef.current =
      typeof Audio !== "undefined"
        ? new Audio(
            "data:audio/wav;base64,UklGRpQGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXAGAAD//wEA//8AAAEA//8AAAAAAQD//wEA//8BAAAAAAAAAAAAAAAAAAEAAAAAAAEAAAAAAAEA//8AAAAAAQAAAP//AQAAAAAA//8BAAAAAQAAAP//AAABAP//AQD//wAA",
          )
        : null;

    const channel = supabase
      .channel("notif:all")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload: any) => {
          const notif = payload.new;
          if (notif.is_read) return;

          toast.warning(notif.title, {
            description: notif.message,
            duration: 10000,
            action: {
              label: "Aceitar Atendimento",
              onClick: async () => {
                stopRecursiveAlert();
                if (notif.conversation_id) {
                  const { error } = await supabase.rpc("accept_conversation_assignment", {
                    p_conversation_id: notif.conversation_id,
                  });
                  if (error) toast.error("Erro ao aceitar atendimento");
                  else toast.success("Você assumiu este atendimento!");
                }
              },
            },
          });

          if (notif.type === "assignment_required") {
            startRecursiveAlert();
          } else {
            playAlertSound();
          }

          if (
            document.hidden &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification(notif.title, { body: notif.message });
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications" },
        (payload: any) => {
          if (payload.new.is_read || payload.new.user_id) {
            // If someone read it or it was assigned to someone (user_id populated),
            // check if we can stop the loop
            supabase
              .from("notifications")
              .select("id")
              .eq("type", "assignment_required")
              .eq("is_read", false)
              .is("user_id", null)
              .limit(1)
              .then(({ data }) => {
                if (!data || data.length === 0) stopRecursiveAlert();
              });
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload: any) => {
          const msg = payload.new;
          if (msg.sender_type !== "contact" && msg.sender_type !== "system") return;

          const isHandover = msg.sender_type === "system" && msg.content_type === "event";

          if (isHandover) {
            toast.warning("Transbordo solicitado!", {
              description: msg.content,
              duration: 6000,
            });
          } else if (msg.sender_type === "contact") {
            toast.info("Nova mensagem recebida", {
              description: msg.content?.substring(0, 80) || "Nova mídia",
            });
          }

          if (
            document.hidden &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            const title = isHandover ? "🚨 HCB CRM — Transbordo" : "HCB CRM — Nova mensagem";
            const body = msg.content?.substring(0, 120) || "Nova mensagem do cliente";

            new Notification(title, {
              body,
              icon: "/favicon.ico",
            });
          }

          audioRef.current?.play().catch(() => {});
        },
      )
      .subscribe();

    const scheduledChannel = supabase
      .channel("notif:scheduled")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "scheduled_messages" },
        (payload: any) => {
          if (payload.new.status === "sent" && payload.old.status === "pending") {
            toast.success("📅 Agendamento enviado!", {
              description: "Sua mensagem programada foi entregue ao cliente.",
              duration: 4000,
            });
            audioScheduledRef.current?.play().catch(() => {});
          }
        },
      )
      .subscribe();

    return () => {
      stopRecursiveAlert();
      supabase.removeChannel(channel);
      supabase.removeChannel(scheduledChannel);
    };
  }, [enabled]);
}
