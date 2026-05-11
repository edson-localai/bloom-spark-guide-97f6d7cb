
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS birthdate date,
  ADD COLUMN IF NOT EXISTS cep text,
  ADD COLUMN IF NOT EXISTS street text,
  ADD COLUMN IF NOT EXISTS street_number text,
  ADD COLUMN IF NOT EXISTS complement text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS stage text DEFAULT 'novo';

CREATE TABLE IF NOT EXISTS public.contact_followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  attempt int NOT NULL DEFAULT 0,
  last_sent_at timestamptz,
  next_run_at timestamptz NOT NULL DEFAULT (now() + interval '6 hours'),
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id)
);

ALTER TABLE public.contact_followups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agents_all_followups ON public.contact_followups;
CREATE POLICY agents_all_followups ON public.contact_followups
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid()))
  WITH CHECK (public.has_any_role(auth.uid()));
