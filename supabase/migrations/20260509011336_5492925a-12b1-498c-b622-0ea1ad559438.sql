DROP POLICY IF EXISTS "system_insert_audit" ON public.audit_logs;

CREATE POLICY "agents_insert_audit" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid()) AND user_id = auth.uid());