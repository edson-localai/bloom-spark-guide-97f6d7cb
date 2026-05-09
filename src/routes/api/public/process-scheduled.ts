import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const Route = createFileRoute('/api/public/process-scheduled')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          console.log('Starting scheduled messages processing...');
          
          const { data: pending, error: fetchError } = await supabaseAdmin
            .from('scheduled_messages')
            .select('*')
            .eq('status', 'pending')
            .lte('scheduled_for', new Date().toISOString());

          if (fetchError) throw fetchError;
          if (!pending || pending.length === 0) {
            return new Response(JSON.stringify({ success: true, processed: 0 }), {
              headers: { 'Content-Type': 'application/json' },
            });
          }

          const results = [];

          for (const msg of pending) {
            try {
              const { error: msgError } = await supabaseAdmin.from('messages').insert({
                conversation_id: msg.conversation_id,
                content: msg.content,
                sender_type: 'agent',
                sender_id: msg.agent_id,
                created_at: msg.scheduled_for,
              });

              if (msgError) throw msgError;

              const { error: updateError } = await supabaseAdmin
                .from('scheduled_messages')
                .update({ 
                  status: 'sent', 
                  sent_at: new Date().toISOString() 
                })
                .eq('id', msg.id);

              if (updateError) throw updateError;
              
              results.push({ id: msg.id, status: 'sent' });
            } catch (err) {
              results.push({ id: msg.id, status: 'failed', error: err });
            }
          }

          return new Response(JSON.stringify({ success: true, processed: pending.length, results }), {
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error: any) {
          return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    },
  },
} as any);
