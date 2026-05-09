-- 1. Tighten user_roles policies
DROP POLICY IF EXISTS "admins_manage_roles" ON public.user_roles;
CREATE POLICY "admins_manage_roles" 
ON public.user_roles 
FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Tighten agents policies
DROP POLICY IF EXISTS "admins_manage_agents" ON public.agents;
CREATE POLICY "admins_manage_agents" 
ON public.agents 
FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Refine quiz_results policies
DROP POLICY IF EXISTS "Admins can view all quiz results" ON public.quiz_results;
CREATE POLICY "Admins can view all quiz results"
ON public.quiz_results
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Secure app_settings (only admins can modify)
DROP POLICY IF EXISTS "admins_write_settings" ON public.app_settings;
CREATE POLICY "admins_write_settings" 
ON public.app_settings 
FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Secure whatsapp_instances (only supervisors and admins can manage)
DROP POLICY IF EXISTS "supervisors_manage_instances" ON public.whatsapp_instances;
CREATE POLICY "supervisors_manage_instances" 
ON public.whatsapp_instances 
FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor'));
