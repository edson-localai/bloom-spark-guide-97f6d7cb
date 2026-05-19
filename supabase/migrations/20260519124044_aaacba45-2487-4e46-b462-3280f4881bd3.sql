-- Otimização de performance: índices verificados
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_conv_id ON public.scheduled_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_time ON public.scheduled_messages(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_agent_id ON public.scheduled_messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_quick_replies_agent_id ON public.quick_replies(agent_id);
CREATE INDEX IF NOT EXISTS idx_quick_replies_shortcut ON public.quick_replies(shortcut);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON public.contacts(name);
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_key ON public.whatsapp_instances(instance_key);
