-- Ensure the CRM master account has the admin role and an agent record
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE lower(email) = 'hcbautomotivo@gmail.com'
  LIMIT 1;

  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO public.agents (user_id, name, email, role)
    VALUES (target_user_id, 'HCB Automotivo', 'hcbautomotivo@gmail.com', 'admin'::public.app_role)
    ON CONFLICT (email) DO UPDATE
      SET user_id = EXCLUDED.user_id,
          role = 'admin'::public.app_role,
          name = COALESCE(public.agents.name, EXCLUDED.name),
          updated_at = now();
  END IF;
END $$;

-- Secure helper: each authenticated user can read only their own CRM roles.
CREATE OR REPLACE FUNCTION public.get_my_roles()
RETURNS SETOF public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
$$;

GRANT EXECUTE ON FUNCTION public.get_my_roles() TO authenticated;