-- Add department column to agents table
ALTER TABLE public.agents 
ADD COLUMN department TEXT DEFAULT 'atendimento';

-- Create an index for faster filtering by department
CREATE INDEX idx_agents_department ON public.agents(department);

-- Add a check constraint to ensure only valid departments are used (optional but good for data integrity)
-- Note: Using a simple check constraint instead of an ENUM for flexibility
ALTER TABLE public.agents
ADD CONSTRAINT check_valid_department 
CHECK (department IN ('vendas', 'financeiro', 'atendimento'));