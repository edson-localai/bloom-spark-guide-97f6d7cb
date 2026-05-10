-- Adicionar restrição de unicidade para o nome da instância se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'whatsapp_instances_name_unique') THEN
        ALTER TABLE public.whatsapp_instances ADD CONSTRAINT whatsapp_instances_name_unique UNIQUE (name);
    END IF;
END $$;

-- Garantir que a coluna instance_id em conversations tenha uma chave estrangeira correta
-- Primeiro removemos qualquer uma existente para evitar conflitos
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_conversations_instance_id') THEN
        ALTER TABLE public.conversations DROP CONSTRAINT fk_conversations_instance_id;
    END IF;
END $$;

ALTER TABLE public.conversations 
ADD CONSTRAINT fk_conversations_instance_id 
FOREIGN KEY (instance_id) 
REFERENCES public.whatsapp_instances(id) 
ON DELETE SET NULL;

-- Habilitar RLS e permissões extras
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;
