-- Remove a função existente se houver (necessário se o tipo de retorno mudou)
DROP FUNCTION IF EXISTS public.delete_whatsapp_instance(uuid, text);

-- Recria a função para excluir instância do WhatsApp com segurança
CREATE OR REPLACE FUNCTION public.delete_whatsapp_instance(_instance_id uuid DEFAULT NULL, _instance_name text DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _target_id uuid;
    _current_user_id uuid;
    _is_authorized boolean;
BEGIN
    _current_user_id := auth.uid();
    
    -- Verifica se o usuário está autenticado
    IF _current_user_id IS NULL THEN
        RAISE EXCEPTION 'Não autenticado';
    END IF;

    -- Verifica se o usuário é admin ou supervisor
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = _current_user_id 
        AND role::text IN ('admin', 'supervisor')
    ) INTO _is_authorized;
    
    IF NOT _is_authorized THEN
        RAISE EXCEPTION 'Acesso negado. Apenas administradores ou supervisores podem excluir instâncias.';
    END IF;

    -- Localiza o ID se apenas o nome for fornecido
    IF _instance_id IS NOT NULL THEN
        _target_id := _instance_id;
    ELSIF _instance_name IS NOT NULL THEN
        SELECT id INTO _target_id FROM public.whatsapp_instances WHERE name = _instance_name LIMIT 1;
    END IF;

    IF _target_id IS NULL THEN
        RETURN json_build_object('ok', false, 'error', 'Instância não encontrada');
    END IF;

    -- Remove referências em conversas (set null)
    UPDATE public.conversations SET instance_id = NULL WHERE instance_id = _target_id;

    -- Exclui a instância
    DELETE FROM public.whatsapp_instances WHERE id = _target_id;

    RETURN json_build_object('ok', true);
END;
$$;

-- Permissões
GRANT EXECUTE ON FUNCTION public.delete_whatsapp_instance(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_whatsapp_instance(uuid, text) TO service_role;
