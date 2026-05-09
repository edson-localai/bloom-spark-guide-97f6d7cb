-- Tabela de Fila de Espera
CREATE TABLE IF NOT EXISTS public.waiting_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID UNIQUE NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id),
  priority TEXT DEFAULT 'normal',
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.waiting_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agents_manage_queue" ON public.waiting_queue
  FOR ALL TO authenticated 
  USING (public.has_any_role(auth.uid())) 
  WITH CHECK (public.has_any_role(auth.uid()));

-- Função para limpar fila quando conversa for assumida
CREATE OR REPLACE FUNCTION public.handle_conversation_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.agent_id IS NOT NULL AND (OLD.agent_id IS NULL OR NEW.agent_id != OLD.agent_id) THEN
    DELETE FROM public.waiting_queue WHERE conversation_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_on_assign_clear_queue ON public.conversations;
CREATE TRIGGER trg_on_assign_clear_queue
  AFTER UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_conversation_assignment();