import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const Route = createFileRoute('/api/public/process-scheduled')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          console.log('Starting scheduled messages processing...');
          
          // 1. Busca mensagens pendentes que já deveriam ter sido enviadas
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

          console.log(`Found ${pending.length} messages to send.`);

          const results = [];

          for (const msg of pending) {
            try {
              // 2. Insere na tabela de mensagens real do chat
              const { error: msgError } = await supabaseAdmin.from('messages').insert({
                conversation_id: msg.conversation_id,
                content: msg.content,
                sender_type: 'agent', // Ou 'system'/'bot' dependendo do contexto
                sender_id: msg.agent_id,
                created_at: msg.scheduled_for, // Mantém a data original do agendamento
              });

              if (msgError) throw msgError;

              // 3. Atualiza status do agendamento
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
              console.error(`Failed to process message ${msg.id}:`, err);
              results.push({ id: msg.id, status: 'failed', error: err });
            }
          }

          return new Response(JSON.stringify({ success: true, processed: pending.length, results }), {
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error: any) {
          console.error('Scheduled processing error:', error);
          return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    },
  },
});
