-- Índices para busca rápida de mensagens e conversas
CREATE INDEX IF NOT EXISTS idx_messages_wa_id ON public.messages(wa_message_id);
CREATE INDEX IF NOT EXISTS idx_conversations_wa_chat_id ON public.conversations(whatsapp_chat_id);
CREATE INDEX IF NOT EXISTS idx_conversations_instance_id ON public.conversations(instance_id);

-- Índice GIN para busca em dados JSONB (caso existam buscas por propriedades específicas)
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_data ON public.whatsapp_instances USING GIN (instance_data);

-- Garantir que a exclusão de uma instância não quebre conversas (já existe a lógica no código, mas o BD reforça)
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'conversations_instance_id_fkey'
    ) THEN
        ALTER TABLE public.conversations 
        DROP CONSTRAINT conversations_instance_id_fkey,
        ADD CONSTRAINT conversations_instance_id_fkey 
        FOREIGN KEY (instance_id) REFERENCES public.whatsapp_instances(id) 
        ON DELETE SET NULL;
    END IF;
END $$;
