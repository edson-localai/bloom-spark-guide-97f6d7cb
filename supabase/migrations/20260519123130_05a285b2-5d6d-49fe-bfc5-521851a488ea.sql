-- 1. Revogar execução de funções SECURITY DEFINER do public/anon
-- Ajustando os tipos de argumentos conforme descoberto pelo read_query
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.has_any_role(uuid) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_roles() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.get_agents_with_email() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.delete_whatsapp_instance(uuid, text) FROM public, anon;

-- 2. Garantir que apenas authenticated possa executar
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_agents_with_email() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_whatsapp_instance(uuid, text) TO authenticated;

-- 3. Políticas para app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read settings" ON public.app_settings;
CREATE POLICY "Anyone can read settings" ON public.app_settings
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage settings" ON public.app_settings;
CREATE POLICY "Admins can manage settings" ON public.app_settings
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. Políticas para user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 5. Política para agents
DROP POLICY IF EXISTS "Agents are viewable by authenticated" ON public.agents;
CREATE POLICY "Agents are viewable by authenticated" ON public.agents
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update their own agent profile" ON public.agents;
CREATE POLICY "Users can update their own agent profile" ON public.agents
FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
