-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.agents;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.agents;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.agents;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.agents;

-- Enable RLS just in case it was disabled
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- 1. Policy for users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.agents
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Policy for users to insert their own profile (needed for first-time profile creation)
CREATE POLICY "Users can insert their own profile"
ON public.agents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Policy for users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.agents
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Policy for admins to view all profiles
-- Using a subquery on user_roles instead of auth.users to avoid permission issues
CREATE POLICY "Admins can view all profiles"
ON public.agents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);
