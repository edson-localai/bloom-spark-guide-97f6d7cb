-- 1. Restringir leitura do bucket crm_media a usuários com role
DROP POLICY IF EXISTS "Anyone can view CRM media" ON storage.objects;
CREATE POLICY "CRM users can view CRM media"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'crm_media' AND public.has_any_role(auth.uid()));

-- 2. Remover políticas duplicadas em whatsapp_instances que checam agents.role
DROP POLICY IF EXISTS "Admins can manage whatsapp instances" ON public.whatsapp_instances;
DROP POLICY IF EXISTS "Supervisors can view whatsapp instances" ON public.whatsapp_instances;
