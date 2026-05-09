-- Criar bucket para mídias se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('crm_media', 'crm_media', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso ao bucket
CREATE POLICY "Agents can upload media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'crm_media' AND (public.has_any_role(auth.uid())));

CREATE POLICY "Anyone can view CRM media"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'crm_media');

CREATE POLICY "Agents can delete own media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'crm_media' AND (auth.uid() = owner));