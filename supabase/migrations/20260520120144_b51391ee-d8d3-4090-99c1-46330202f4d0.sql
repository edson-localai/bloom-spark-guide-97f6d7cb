-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create team members table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- member, lead
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(team_id, agent_id)
);

-- Create labels table
CREATE TABLE IF NOT EXISTS public.labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3b82f6',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(name)
);

-- Create conversation labels table
CREATE TABLE IF NOT EXISTS public.conversation_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    label_id UUID REFERENCES public.labels(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(conversation_id, label_id)
);

-- Add team_id to conversations
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'conversations' AND column_name = 'team_id') THEN
        ALTER TABLE public.conversations ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_labels ENABLE ROW LEVEL SECURITY;

-- Policies for teams
CREATE POLICY "Agents can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Admins can manage teams" ON public.teams FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Policies for team_members
CREATE POLICY "Agents can view team members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Admins can manage team members" ON public.team_members FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Policies for labels
CREATE POLICY "Agents can view labels" ON public.labels FOR SELECT USING (true);
CREATE POLICY "Agents can manage labels" ON public.labels FOR ALL USING (true);

-- Policies for conversation_labels
CREATE POLICY "Agents can view conversation labels" ON public.conversation_labels FOR SELECT USING (true);
CREATE POLICY "Agents can manage conversation labels" ON public.conversation_labels FOR ALL USING (true);

-- Insert some default labels
INSERT INTO public.labels (name, color) VALUES 
('Suporte', '#3b82f6'),
('Vendas', '#10b981'),
('Urgente', '#ef4444'),
('Financeiro', '#f59e0b')
ON CONFLICT (name) DO NOTHING;
