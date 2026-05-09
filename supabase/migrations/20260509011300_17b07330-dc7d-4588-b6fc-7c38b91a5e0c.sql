-- Tabela de Logs de Auditoria
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id),
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agents_read_audit" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.has_any_role(auth.uid()));

CREATE POLICY "system_insert_audit" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Controle de automação em conversas
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS last_automated_msg_at TIMESTAMPTZ;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);