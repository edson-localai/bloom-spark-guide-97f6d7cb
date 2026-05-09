CREATE OR REPLACE FUNCTION public.handle_conversation_assignment()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.agent_id IS NOT NULL AND (OLD.agent_id IS NULL OR NEW.agent_id != OLD.agent_id) THEN
    DELETE FROM public.waiting_queue WHERE conversation_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;