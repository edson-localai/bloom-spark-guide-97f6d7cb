-- Excluir todas as mensagens
DELETE FROM public.messages;

-- Excluir todos os eventos de conversa
DELETE FROM public.conversation_events;

-- Excluir todas as conversas (atendimentos)
DELETE FROM public.conversations;

-- Excluir fila de espera
DELETE FROM public.waiting_queue;

-- Excluir follow-ups de contato
DELETE FROM public.contact_followups;

-- Opcional: Se desejar limpar também as propostas vinculadas a atendimentos
-- DELETE FROM public.proposals;

-- Opcional: Se desejar limpar mensagens agendadas
-- DELETE FROM public.scheduled_messages;
