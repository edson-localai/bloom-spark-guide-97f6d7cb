-- Remove existing select policies that might be causing issues
DROP POLICY IF EXISTS "agents_read_agents" ON public.agents;
DROP POLICY IF EXISTS "admins_manage_agents" ON public.agents;

-- Create simple and direct policies
CREATE POLICY "Users can view their own profile"
ON public.agents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.agents
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Ensure agents table is indeed readable by authenticated users
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
