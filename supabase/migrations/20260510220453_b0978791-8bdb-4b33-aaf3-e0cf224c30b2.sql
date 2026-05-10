-- Add WhatsApp API settings
INSERT INTO public.app_settings (key, value, description, is_secret)
VALUES 
('whatsapp_api_url', '', 'URL base da Evolution API (ex: https://api.exemplo.com)', false),
('whatsapp_api_key', '', 'Global API Key da Evolution API', true)
ON CONFLICT (key) DO NOTHING;

-- Update whatsapp_instances table to support Evolution API specifics
ALTER TABLE public.whatsapp_instances 
ADD COLUMN IF NOT EXISTS instance_key TEXT,
ADD COLUMN IF NOT EXISTS instance_data JSONB DEFAULT '{}'::jsonb;

-- Ensure RLS is enabled and policies are correct for whatsapp_instances
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage whatsapp instances" 
ON public.whatsapp_instances 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.agents 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.agents 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Supervisors can view whatsapp instances" 
ON public.whatsapp_instances 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.agents 
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR role = 'supervisor')
  )
);
