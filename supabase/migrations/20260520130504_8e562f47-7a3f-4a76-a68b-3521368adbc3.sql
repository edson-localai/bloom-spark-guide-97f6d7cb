-- Teams
DROP POLICY IF EXISTS "Agents can view teams" ON public.teams;
DROP POLICY IF EXISTS "Admins can manage teams" ON public.teams;
CREATE POLICY "agents_view_teams" ON public.teams
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid()));
CREATE POLICY "admins_manage_teams" ON public.teams
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Team members
DROP POLICY IF EXISTS "Agents can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;
CREATE POLICY "agents_view_team_members" ON public.team_members
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid()));
CREATE POLICY "admins_manage_team_members" ON public.team_members
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Labels
DROP POLICY IF EXISTS "Authenticated users can view labels" ON public.labels;
DROP POLICY IF EXISTS "Agents can manage labels" ON public.labels;
CREATE POLICY "agents_view_labels" ON public.labels
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid()));
CREATE POLICY "agents_manage_labels" ON public.labels
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid()))
  WITH CHECK (public.has_any_role(auth.uid()));

-- Conversation labels
DROP POLICY IF EXISTS "Authenticated users can view conversation labels" ON public.conversation_labels;
DROP POLICY IF EXISTS "Agents can manage conversation labels" ON public.conversation_labels;
CREATE POLICY "agents_view_conversation_labels" ON public.conversation_labels
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid()));
CREATE POLICY "agents_manage_conversation_labels" ON public.conversation_labels
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid()))
  WITH CHECK (public.has_any_role(auth.uid()));

-- Audit logs: remove client-side inserts; only service_role/SECURITY DEFINER can write
DROP POLICY IF EXISTS "agents_insert_audit" ON public.audit_logs;
