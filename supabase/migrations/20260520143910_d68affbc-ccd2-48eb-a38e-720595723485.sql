-- Set default values for role and status if they are missing
ALTER TABLE public.agents ALTER COLUMN role SET DEFAULT 'agent';
ALTER TABLE public.agents ALTER COLUMN status SET DEFAULT 'online';

-- Drop existing update policies to avoid conflicts
DROP POLICY IF EXISTS "agents_update_self" ON public.agents;
DROP POLICY IF EXISTS "Users can update their own agent profile" ON public.agents;

-- Create a comprehensive update policy
CREATE POLICY "Users can update their own profile"
ON public.agents
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure insert policy is robust
DROP POLICY IF EXISTS "Users can insert their own agent profile" ON public.agents;
CREATE POLICY "Users can insert their own profile"
ON public.agents
FOR INSERT
WITH CHECK (auth.uid() = user_id);
