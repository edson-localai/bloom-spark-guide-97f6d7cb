DROP POLICY IF EXISTS crm_media_update_authenticated ON storage.objects;
DROP POLICY IF EXISTS crm_media_delete_authenticated ON storage.objects;

CREATE POLICY crm_media_update_owner ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'crm_media' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'crm_media' AND owner = auth.uid());

CREATE POLICY crm_media_delete_owner ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'crm_media' AND owner = auth.uid());