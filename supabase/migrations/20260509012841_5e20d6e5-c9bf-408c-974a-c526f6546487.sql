ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS nps_score INT CHECK (nps_score >= 0 AND nps_score <= 10);
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS nps_comment TEXT;

-- Inserir configuração de resposta automática
INSERT INTO public.app_settings (key, value, description, is_secret) VALUES
  ('auto_reply_active', 'false', 'Se a Clara deve responder automaticamente quando no status bot', false)
ON CONFLICT (key) DO NOTHING;