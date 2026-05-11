ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create storage bucket for lead avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for public access to avatars
CREATE POLICY "Avatars are public" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');
