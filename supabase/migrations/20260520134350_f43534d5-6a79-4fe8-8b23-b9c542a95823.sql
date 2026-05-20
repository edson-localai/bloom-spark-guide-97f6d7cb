CREATE OR REPLACE FUNCTION public.accept_conversation_assignment(p_conversation_id UUID)
RETURNS VOID AS $$
DECLARE
  v_agent_id UUID;
BEGIN
  -- Get the agent ID for the current authenticated user
  SELECT id INTO v_agent_id FROM public.agents WHERE user_id = auth.uid();
  
  IF v_agent_id IS NULL THEN
    RAISE EXCEPTION 'Current user is not an agent';
  END IF;

  -- 1. Assign the agent to the conversation
  UPDATE public.conversations 
  SET agent_id = v_agent_id 
  WHERE id = p_conversation_id;

  -- 2. Mark related assignment notifications as read/resolved
  UPDATE public.notifications
  SET is_read = true,
      user_id = auth.uid()
  WHERE conversation_id = p_conversation_id
    AND type = 'assignment_required'
    AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
