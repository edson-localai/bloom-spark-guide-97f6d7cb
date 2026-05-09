-- Find the user ID for hcbautomotivo@gmail.com and insert/update their role to 'admin'
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user_id from auth.users
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'hcbautomotivo@gmail.com';

  IF target_user_id IS NOT NULL THEN
    -- Grant admin role in user_roles table
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Ensure the role is set correctly if they already had a different role
    -- (Note: 'admin' is one of the app_role enum values)
    UPDATE public.user_roles SET role = 'admin' WHERE user_id = target_user_id;

    -- Also update/ensure agent profile matches
    UPDATE public.agents SET role = 'admin' WHERE user_id = target_user_id;
  END IF;
END $$;
