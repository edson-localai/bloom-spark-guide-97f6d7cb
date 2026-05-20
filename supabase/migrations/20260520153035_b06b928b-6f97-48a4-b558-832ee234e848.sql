-- Grant necessary permissions to the roles used by PostgREST
GRANT ALL ON TABLE public.agents TO postgres;
GRANT ALL ON TABLE public.agents TO service_role;
GRANT ALL ON TABLE public.agents TO anon;
GRANT ALL ON TABLE public.agents TO authenticated;

-- Ensure RLS is still on
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- The policies we created earlier will now actually be evaluated because the role has permission to access the table
