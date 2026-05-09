import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useNotifications(enabled: boolean = true) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Pede permissão para notificações nativas
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    // Beep sintético para nova mensagem
    audioRef.current = typeof Audio !== 'undefined' 
      ? new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=')
      : null;

    const channel = supabase
      .channel('notif:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload: any) => {
          const msg = payload.new;
          if (msg.sender_type !== 'contact') return;

          // Toast in-app
          toast.info('Nova mensagem recebida', {
            description: msg.content?.substring(0, 80) || 'Nova mídia',
          });

          // Notificação nativa (quando aba está em background)
          if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('HCB CRM — Nova mensagem', {
              body: msg.content?.substring(0, 120) || 'Nova mensagem do cliente',
              icon: '/favicon.ico',
            });
          }

          // Beep
          audioRef.current?.play().catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled]);
}
