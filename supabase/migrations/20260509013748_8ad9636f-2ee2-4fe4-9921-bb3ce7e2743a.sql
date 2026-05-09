-- Mensagens Agendadas
CREATE TABLE IF NOT EXISTS public.scheduled_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agents_all_scheduled" ON public.scheduled_messages
  FOR ALL TO authenticated 
  USING (public.has_any_role(auth.uid())) 
  WITH CHECK (public.has_any_role(auth.uid()));

-- Propostas Comerciais
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES auth.users(id),
  proposal_number TEXT UNIQUE NOT NULL DEFAULT ('PROP-' || to_char(now(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 6)),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','rejected')),
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agents_all_proposals" ON public.proposals
  FOR ALL TO authenticated 
  USING (public.has_any_role(auth.uid())) 
  WITH CHECK (public.has_any_role(auth.uid()));

CREATE TRIGGER trg_proposals_updated BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Suporte a transferências
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS transferred_from UUID REFERENCES public.agents(id);
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS transferred_at TIMESTAMPTZ;