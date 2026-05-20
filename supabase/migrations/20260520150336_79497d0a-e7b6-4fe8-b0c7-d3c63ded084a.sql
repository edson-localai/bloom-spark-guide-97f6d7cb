-- Fix missing function issue in RLS
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.agents;

-- Re-create the policy with a safe check for the function existence or use a direct check
-- assuming 'app_role' is an enum used in the system, let's try to see if we can use a simpler check
-- or just fix the previous implementation.

CREATE POLICY "Admins can view all profiles"
ON public.agents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
);
