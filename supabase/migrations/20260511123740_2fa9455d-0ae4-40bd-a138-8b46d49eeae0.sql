CREATE OR REPLACE FUNCTION public.delete_whatsapp_instance(_instance_id uuid DEFAULT NULL, _instance_name text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _target record;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado' USING ERRCODE = '28000';
  END IF;

  IF NOT (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'supervisor'::app_role)) THEN
    RAISE EXCEPTION 'Você precisa ser administrador ou supervisor para excluir conexões de WhatsApp' USING ERRCODE = '42501';
  END IF;

  SELECT id, name
    INTO _target
  FROM public.whatsapp_instances
  WHERE (_instance_id IS NOT NULL AND id = _instance_id)
     OR (_instance_name IS NOT NULL AND name = _instance_name)
  LIMIT 1;

  IF _target.id IS NULL THEN
    RETURN jsonb_build_object('ok', true, 'alreadyDeleted', true);
  END IF;

  UPDATE public.conversations
     SET instance_id = NULL,
         updated_at = now()
   WHERE instance_id = _target.id;

  DELETE FROM public.whatsapp_instances
   WHERE id = _target.id;

  RETURN jsonb_build_object('ok', true, 'id', _target.id, 'name', _target.name);
END;
$$;

REVOKE ALL ON FUNCTION public.delete_whatsapp_instance(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_whatsapp_instance(uuid, text) TO authenticated;