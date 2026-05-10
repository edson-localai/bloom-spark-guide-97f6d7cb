
-- 1) Restrict agents.email column to admins only (column-level privileges)
REVOKE SELECT ON public.agents FROM authenticated, anon;
GRANT SELECT (id, user_id, name, status, avatar_url, role, max_chats, created_at, updated_at)
  ON public.agents TO authenticated;

-- Allow admins to read full row (including email) via a security-definer function
CREATE OR REPLACE FUNCTION public.get_agents_with_email()
RETURNS SETOF public.agents
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.agents
  WHERE public.has_role(auth.uid(), 'admin');
$$;

REVOKE EXECUTE ON FUNCTION public.get_agents_with_email() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_agents_with_email() TO authenticated;

-- 2) Lock down SECURITY DEFINER functions: revoke from anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_any_role(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_my_roles() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_roles() TO authenticated;
