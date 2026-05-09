-- ============================================================
-- HCB CRM — SCHEMA COMPLETO (Fase 1)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────
-- ROLES (segurança: tabela separada + função)
-- ────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'supervisor', 'agent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role    public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;

CREATE POLICY "users_can_view_own_roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "admins_manage_roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ────────────────────────────────────────────
-- TABELAS PRINCIPAIS
-- ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.app_settings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT UNIQUE NOT NULL,
  value       TEXT,
  value_enc   TEXT,
  description TEXT,
  is_secret   BOOLEAN DEFAULT FALSE,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_by  UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.agents (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  role         TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('admin','supervisor','agent')),
  status       TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online','busy','away','offline')),
  avatar_url   TEXT,
  max_chats    INT DEFAULT 5,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.whatsapp_instances (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  phone_number  TEXT,
  status        TEXT DEFAULT 'disconnected' CHECK (status IN ('connected','disconnected','connecting','error')),
  qr_code       TEXT,
  webhook_url   TEXT,
  last_seen     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contacts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone           TEXT UNIQUE NOT NULL,
  name            TEXT,
  vehicle_brand   TEXT,
  vehicle_model   TEXT,
  vehicle_year    INT,
  notes           TEXT,
  tags            TEXT[] DEFAULT '{}',
  total_conversations INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id        UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  agent_id          UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  instance_id       UUID REFERENCES public.whatsapp_instances(id),
  whatsapp_chat_id  TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'bot' CHECK (status IN ('bot','queue','active','resolved','archived')),
  priority          TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  channel           TEXT DEFAULT 'whatsapp',
  subject           TEXT,
  ai_summary        TEXT,
  ai_intent         TEXT,
  bot_active        BOOLEAN DEFAULT TRUE,
  unread_count      INT DEFAULT 0,
  last_message      TEXT,
  last_message_at   TIMESTAMPTZ DEFAULT NOW(),
  resolved_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  wa_message_id   TEXT,
  sender_type     TEXT NOT NULL CHECK (sender_type IN ('contact','agent','bot','system')),
  sender_id       UUID,
  content         TEXT,
  content_type    TEXT DEFAULT 'text' CHECK (content_type IN ('text','image','audio','video','document','sticker','location','system')),
  media_url       TEXT,
  media_mime      TEXT,
  is_internal     BOOLEAN DEFAULT FALSE,
  status          TEXT DEFAULT 'sent' CHECK (status IN ('pending','sent','delivered','read','failed')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quick_replies (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  shortcut   TEXT,
  agent_id   UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  use_count  INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  agent_id        UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  event_type      TEXT NOT NULL,
  meta            JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────
-- ÍNDICES
-- ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_conversations_status   ON public.conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_agent    ON public.conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_contact  ON public.conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation  ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created       ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_phone         ON public.contacts(phone);
CREATE INDEX IF NOT EXISTS idx_user_roles_user        ON public.user_roles(user_id);

-- ────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────
ALTER TABLE public.app_settings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_instances  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_replies       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_events ENABLE ROW LEVEL SECURITY;

-- app_settings: leitura para qualquer agente, escrita só admin. Secrets nunca expostos via leitura geral (filtrar no app).
CREATE POLICY "agents_read_settings" ON public.app_settings
  FOR SELECT TO authenticated USING (public.has_any_role(auth.uid()));
CREATE POLICY "admins_write_settings" ON public.app_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- agents: todos autenticados leem, admins gerenciam
CREATE POLICY "agents_read_agents" ON public.agents
  FOR SELECT TO authenticated USING (public.has_any_role(auth.uid()));
CREATE POLICY "admins_manage_agents" ON public.agents
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "agents_update_self" ON public.agents
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- whatsapp_instances: leitura todos, escrita admin/supervisor
CREATE POLICY "agents_read_instances" ON public.whatsapp_instances
  FOR SELECT TO authenticated USING (public.has_any_role(auth.uid()));
CREATE POLICY "supervisors_manage_instances" ON public.whatsapp_instances
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor'));

-- contacts/conversations/messages/quick_replies/events: todos autenticados com qualquer role
CREATE POLICY "agents_all_contacts" ON public.contacts
  FOR ALL TO authenticated USING (public.has_any_role(auth.uid())) WITH CHECK (public.has_any_role(auth.uid()));
CREATE POLICY "agents_all_conversations" ON public.conversations
  FOR ALL TO authenticated USING (public.has_any_role(auth.uid())) WITH CHECK (public.has_any_role(auth.uid()));
CREATE POLICY "agents_all_messages" ON public.messages
  FOR ALL TO authenticated USING (public.has_any_role(auth.uid())) WITH CHECK (public.has_any_role(auth.uid()));
CREATE POLICY "agents_all_quick_replies" ON public.quick_replies
  FOR ALL TO authenticated USING (public.has_any_role(auth.uid())) WITH CHECK (public.has_any_role(auth.uid()));
CREATE POLICY "agents_all_events" ON public.conversation_events
  FOR ALL TO authenticated USING (public.has_any_role(auth.uid())) WITH CHECK (public.has_any_role(auth.uid()));

-- ────────────────────────────────────────────
-- TRIGGERS de updated_at
-- ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DO $$ BEGIN
  CREATE TRIGGER trg_agents_updated  BEFORE UPDATE ON public.agents              FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_inst_updated    BEFORE UPDATE ON public.whatsapp_instances  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_contacts_updated BEFORE UPDATE ON public.contacts           FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_conv_updated    BEFORE UPDATE ON public.conversations       FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Auto-promove o PRIMEIRO usuário cadastrado a admin + cria registro em agents
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE first_user BOOLEAN;
BEGIN
  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles) INTO first_user;
  IF first_user THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin');
    INSERT INTO public.agents(user_id, name, email, role)
      VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), NEW.email, 'admin')
      ON CONFLICT (email) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ────────────────────────────────────────────
-- SEED
-- ────────────────────────────────────────────
INSERT INTO public.app_settings (key, value, description, is_secret) VALUES
  ('active_ai_provider',    'lovable',      'Provedor de IA ativo: lovable, openai ou anthropic', false),
  ('ai_model',              'google/gemini-3-flash-preview', 'Modelo de IA em uso', false),
  ('ai_temperature',        '0.7',          'Temperatura da IA (0.0 a 1.0)', false),
  ('bot_active',            'true',         'Bot de pré-atendimento ligado/desligado', false),
  ('bot_delay_seconds',     '2',            'Delay em segundos entre mensagens do bot', false),
  ('bot_typing_simulation', 'true',         'Simular digitando antes de responder', false),
  ('bot_timeout_minutes',   '10',           'Minutos sem resposta para arquivar conversa', false),
  ('business_hours',        '{"mon":{"open":"08:00","close":"18:00"},"tue":{"open":"08:00","close":"18:00"},"wed":{"open":"08:00","close":"18:00"},"thu":{"open":"08:00","close":"18:00"},"fri":{"open":"08:00","close":"18:00"},"sat":{"open":"08:00","close":"13:00"},"sun":null}', 'Horário de funcionamento por dia', false),
  ('escalation_max_turns',  '4',            'Máx. de trocas no bot antes de escalar', false),
  ('escalation_keywords',   '["atendente","humano","pessoa","falar com","quero falar"]', 'Palavras que disparam escalonamento', false),
  ('agent_distribution',    'round_robin',  'Como distribuir conversas: round_robin, specialty, manual', false),
  ('system_prompt',         'Você é a Clara, assistente virtual da HCB Ar Condicionado Automotivo, especializada em peças de ar-condicionado automotivo em Castanhal, Pará. Somos revendedor oficial Denso. Atendemos linha leve, pesada e fora de estrada. Endereço: Tv. Primeiro de Maio, 1.719, Centro. Horário: Seg-Sex 8h-18h, Sáb 8h-13h. Garantia de até 8 meses em produtos selecionados. Seu papel: entender o que o cliente precisa de forma natural e humanizada, coletar nome, veículo (marca/modelo/ano) e necessidade. Nunca invente preços ou disponibilidade de estoque. Quando o cliente quiser comprar, negociar preço ou reclamar, escale para atendente humano. Tom: simpático, direto, profissional. Use emojis com moderação.', 'System prompt do agente de IA', false),
  ('offline_message',       'Olá! 👋 No momento estamos fora do horário de atendimento. Nossa equipe retorna em breve.', 'Mensagem fora do horário comercial', false)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.whatsapp_instances (name, display_name, phone_number, status) VALUES
  ('hcb-principal', 'WhatsApp Principal', '5591985161991', 'disconnected'),
  ('hcb-fixo',      'WhatsApp Fixo',      '5591212224810', 'disconnected')
ON CONFLICT DO NOTHING;
