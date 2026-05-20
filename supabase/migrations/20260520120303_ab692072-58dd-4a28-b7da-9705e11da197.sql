-- Drop permissive policies
DROP POLICY IF EXISTS "Agents can view labels" ON public.labels;
DROP POLICY IF EXISTS "Agents can manage labels" ON public.labels;
DROP POLICY IF EXISTS "Agents can view conversation labels" ON public.conversation_labels;
DROP POLICY IF EXISTS "Agents can manage conversation labels" ON public.conversation_labels;

-- Create more specific policies
CREATE POLICY "Authenticated users can view labels" ON public.labels FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Agents can manage labels" ON public.labels FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor', 'agent'))
);

CREATE POLICY "Authenticated users can view conversation labels" ON public.conversation_labels FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Agents can manage conversation labels" ON public.conversation_labels FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor', 'agent'))
);
