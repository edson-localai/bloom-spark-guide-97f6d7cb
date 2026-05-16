
-- 1) Storage: avatars bucket — restrict uploads to authenticated agents
DROP POLICY IF EXISTS "Anyone can upload avatars" ON storage.objects;
CREATE POLICY "Agents can upload avatars"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND public.has_any_role(auth.uid()));

CREATE POLICY "Agents can update own avatars"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

CREATE POLICY "Agents can delete own avatars"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- 2) Audit logs: only admins can read
DROP POLICY IF EXISTS agents_read_audit ON public.audit_logs;
CREATE POLICY admins_read_audit ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3) whatsapp_instances: remove broad agent read, keep admin/supervisor only
DROP POLICY IF EXISTS agents_read_instances ON public.whatsapp_instances;

-- Remove from realtime publication to stop broadcasting instance_key/qr_code
ALTER PUBLICATION supabase_realtime DROP TABLE public.whatsapp_instances;

-- 4) Revoke EXECUTE from anon on SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_any_role(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_my_roles() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_agents_with_email() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.delete_whatsapp_instance(uuid, text) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_agents_with_email() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_whatsapp_instance(uuid, text) TO authenticated;
