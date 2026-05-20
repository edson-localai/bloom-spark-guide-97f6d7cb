-- Fix agents: remove permissive "true" SELECT policy
DROP POLICY IF EXISTS "Agents are viewable by authenticated" ON public.agents;

-- Fix app_settings: remove duplicate/permissive policies
DROP POLICY IF EXISTS "Anyone can read settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.app_settings;

-- Fix user_roles: remove duplicate SELECT policy
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;