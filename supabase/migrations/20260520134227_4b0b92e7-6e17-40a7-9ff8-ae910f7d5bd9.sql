-- Add assigned_department to conversations
ALTER TABLE public.conversations 
ADD COLUMN assigned_department TEXT;

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  department TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'assignment_required', 'new_message', etc.
  conversation_id UUID REFERENCES public.conversations(id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id OR (department IS NOT NULL AND EXISTS (
  SELECT 1 FROM public.agents WHERE user_id = auth.uid() AND department = notifications.department
)));

CREATE POLICY "Service role can manage notifications"
ON public.notifications FOR ALL
USING (true)
WITH CHECK (true);

-- Trigger to notify on new unassigned messages or specific assignments
CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  conv_agent_id UUID;
  conv_dept TEXT;
BEGIN
  SELECT agent_id, assigned_department INTO conv_agent_id, conv_dept 
  FROM public.conversations WHERE id = NEW.conversation_id;

  -- Only notify if it's an incoming message (from contact)
  IF NEW.direction = 'inbound' THEN
    IF conv_agent_id IS NULL THEN
      -- Notify all agents in the department or everyone if no department assigned
      INSERT INTO public.notifications (department, title, message, type, conversation_id)
      VALUES (conv_dept, 'Novo Atendimento Aguardando', 'Uma nova mensagem requer atenção.', 'assignment_required', NEW.conversation_id);
    ELSE
      -- Notify specific assigned agent
      INSERT INTO public.notifications (user_id, title, message, type, conversation_id)
      SELECT user_id, 'Nova Mensagem', 'Você recebeu uma nova mensagem em um chat atribuído.', 'new_message', NEW.conversation_id
      FROM public.agents WHERE id = conv_agent_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_message_notify
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_message_notification();
