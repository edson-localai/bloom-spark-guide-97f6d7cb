-- Fix handle_new_message_notification: messages table has no `direction` column.
-- "inbound" maps to sender_type = 'contact'.
CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  conv_agent_id UUID;
  conv_dept TEXT;
BEGIN
  SELECT agent_id, assigned_department INTO conv_agent_id, conv_dept
  FROM public.conversations WHERE id = NEW.conversation_id;

  IF NEW.sender_type = 'contact' AND COALESCE(NEW.is_internal, false) = false THEN
    IF conv_agent_id IS NULL THEN
      INSERT INTO public.notifications (department, title, message, type, conversation_id)
      VALUES (conv_dept, 'Novo Atendimento Aguardando', 'Uma nova mensagem requer atenção.', 'assignment_required', NEW.conversation_id);
    ELSE
      INSERT INTO public.notifications (user_id, title, message, type, conversation_id)
      SELECT user_id, 'Nova Mensagem', 'Você recebeu uma nova mensagem em um chat atribuído.', 'new_message', NEW.conversation_id
      FROM public.agents WHERE id = conv_agent_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Recreate trigger on messages to make notifications actually fire
DROP TRIGGER IF EXISTS messages_new_notification ON public.messages;
CREATE TRIGGER messages_new_notification
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.handle_new_message_notification();

-- Ensure conversation assignment trigger is installed (clears waiting queue on assignment)
DROP TRIGGER IF EXISTS conversations_assignment_trigger ON public.conversations;
CREATE TRIGGER conversations_assignment_trigger
AFTER UPDATE OF agent_id ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.handle_conversation_assignment();

-- Lock down SECURITY DEFINER helpers so only the intended callers can execute them.
-- has_role / has_any_role / get_my_roles are used inside RLS policies — keep them callable by authenticated.
-- The others should not be reachable by arbitrary signed-in users.
REVOKE EXECUTE ON FUNCTION public.delete_whatsapp_instance(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_whatsapp_instance(uuid, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_agents_with_email() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_agents_with_email() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.accept_conversation_assignment(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_conversation_assignment(uuid) TO authenticated;

-- Internal helpers / triggers — no API exposure needed
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_admin_assignment() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_message_notification() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_conversation_assignment() FROM PUBLIC, anon, authenticated;