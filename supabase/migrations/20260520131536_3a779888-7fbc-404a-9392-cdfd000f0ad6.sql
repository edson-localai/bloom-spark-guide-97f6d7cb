ALTER TABLE public.conversations 
ADD COLUMN bot_disabled_at TIMESTAMP WITH TIME ZONE;

-- Optionally, add an index if we plan to query this frequently
CREATE INDEX idx_conversations_bot_disabled_at ON public.conversations(bot_disabled_at);