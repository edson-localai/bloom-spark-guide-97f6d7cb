-- Tighten quiz_results to authenticated only
DROP POLICY IF EXISTS "Users can insert their own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Users can view their own quiz results" ON public.quiz_results;

CREATE POLICY "Users can insert their own quiz results"
ON public.quiz_results
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own quiz results"
ON public.quiz_results
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Tighten notifications SELECT to authenticated only
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR (
    department IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.user_id = auth.uid()
        AND agents.department = notifications.department
    )
  )
);

-- Allow authenticated agents to view basic info of other agents (for assignment UIs).
-- Email remains protected: only the existing get_agents_with_email() returns it (admin-only).
CREATE POLICY "Agents can view basic agent info"
ON public.agents
FOR SELECT
TO authenticated
USING (has_any_role(auth.uid()));