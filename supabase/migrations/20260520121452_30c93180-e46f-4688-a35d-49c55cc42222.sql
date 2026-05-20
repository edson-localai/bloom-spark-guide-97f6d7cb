-- Remove acesso público à função
REVOKE EXECUTE ON FUNCTION public.delete_whatsapp_instance(uuid, text) FROM public;

-- Garante que apenas usuários autenticados e o service_role possam executar
GRANT EXECUTE ON FUNCTION public.delete_whatsapp_instance(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_whatsapp_instance(uuid, text) TO service_role;
