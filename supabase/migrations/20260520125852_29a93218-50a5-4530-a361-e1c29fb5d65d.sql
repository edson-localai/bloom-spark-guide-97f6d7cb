-- Revoke public/anon execute on SECURITY DEFINER functions and grant only to authenticated + service_role
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_any_role(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_roles() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_agents_with_email() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.delete_whatsapp_instance(uuid, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_my_roles() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_agents_with_email() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.delete_whatsapp_instance(uuid, text) TO authenticated, service_role;
