
-- 1) Replace overly permissive notifications policy with service_role-only scope
DROP POLICY IF EXISTS "Service role can manage notifications" ON public.notifications;
CREATE POLICY "Service role can manage notifications"
  ON public.notifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2) Add policies for agent_workflows (RLS enabled but no policies)
CREATE POLICY "Agents can read workflows"
  ON public.agent_workflows
  FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins and supervisors manage workflows"
  ON public.agent_workflows
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor'));

-- 3) Add policies for routing_history (RLS enabled but no policies)
CREATE POLICY "Admins and supervisors read routing history"
  ON public.routing_history
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor'));

-- 4) Harden SECURITY DEFINER functions: set search_path and revoke anon EXECUTE
CREATE OR REPLACE FUNCTION public.accept_conversation_assignment(p_conversation_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_agent_id UUID;
BEGIN
  SELECT id INTO v_agent_id FROM public.agents WHERE user_id = auth.uid();
  IF v_agent_id IS NULL THEN
    RAISE EXCEPTION 'Current user is not an agent';
  END IF;

  UPDATE public.conversations
  SET agent_id = v_agent_id
  WHERE id = p_conversation_id;

  UPDATE public.notifications
  SET is_read = true,
      user_id = auth.uid()
  WHERE conversation_id = p_conversation_id
    AND type = 'assignment_required'
    AND is_read = false;
END;
$function$;

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

  IF NEW.direction = 'inbound' THEN
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

-- Revoke anon execute on SECURITY DEFINER functions exposed via PostgREST
REVOKE EXECUTE ON FUNCTION public.accept_conversation_assignment(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_message_notification() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_conversation_assignment(uuid) TO authenticated;
