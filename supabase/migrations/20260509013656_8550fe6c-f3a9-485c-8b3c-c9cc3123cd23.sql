UPDATE storage.buckets SET public = false WHERE id = 'crm_media';

-- A política SELECT já está restrita a 'authenticated', o que é correto para um bucket privado.
-- O aviso do linter deve desaparecer pois o bucket não é mais 'public'.