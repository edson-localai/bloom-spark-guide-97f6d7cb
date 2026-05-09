-- Re-verify and ensure the user is an admin
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user_id from auth.users
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'hcbautomotivo@gmail.com';

  IF target_user_id IS NOT NULL THEN
    -- Ensure entry in user_roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Force role update just in case
    UPDATE public.user_roles SET role = 'admin' WHERE user_id = target_user_id;

    -- Ensure entry in agents
    UPDATE public.agents SET role = 'admin', user_id = target_user_id WHERE email = 'hcbautomotivo@gmail.com';
  END IF;
END $$;

-- Fix the search path warning for the previously created function
ALTER FUNCTION public.has_role(_user_id uuid, _role app_role) SET search_path = public;
ALTER FUNCTION public.handle_admin_assignment() SET search_path = public;
