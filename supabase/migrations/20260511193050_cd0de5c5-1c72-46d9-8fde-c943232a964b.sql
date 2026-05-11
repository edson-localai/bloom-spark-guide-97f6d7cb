UPDATE public.app_settings
SET value = 'true', updated_at = now()
WHERE key = 'auto_reply_active';

INSERT INTO public.app_settings (key, value, description, is_secret)
VALUES ('auto_reply_active', 'true', 'Se a Clara deve responder automaticamente quando mensagens chegarem pelo WhatsApp', false)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = now();