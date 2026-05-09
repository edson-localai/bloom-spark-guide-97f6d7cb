
-- 1. app_settings: hide secret rows from non-admins
DROP POLICY IF EXISTS agents_read_settings ON public.app_settings;

CREATE POLICY admins_read_all_settings
ON public.app_settings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY agents_read_nonsecret_settings
ON public.app_settings
FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid()) AND COALESCE(is_secret, false) = false);

-- 2. crm_media: explicit UPDATE policy
DROP POLICY IF EXISTS "crm_media_update_authenticated" ON storage.objects;
CREATE POLICY "crm_media_update_authenticated"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'crm_media' AND public.has_any_role(auth.uid()))
WITH CHECK (bucket_id = 'crm_media' AND public.has_any_role(auth.uid()));

-- 3. Realtime: restrict channel subscriptions to authenticated users with a role
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS authenticated_with_role_can_subscribe ON realtime.messages;
CREATE POLICY authenticated_with_role_can_subscribe
ON realtime.messages
FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid()));
