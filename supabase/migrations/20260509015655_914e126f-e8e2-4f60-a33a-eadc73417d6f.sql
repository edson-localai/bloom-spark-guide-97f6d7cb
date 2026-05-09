-- Create the user in auth.users
-- Password "Mudar#123" hashed using standard Supabase/PostgreSQL methods is complex via SQL, 
-- but we can use the trigger or insert directly into the profiles/roles table if the user exists.
-- However, creating a user with a specific password via SQL in Supabase is usually done through the auth.users table.
-- Note: It's safer to create the profile/role for the user. 
-- Since I cannot hash the password perfectly here to match Supabase's internal auth, 
-- I will set up a migration that ensures if this user is created (or exists), they get the admin role.

-- First, let's check if we have a roles table or similar mechanism for "administrador do crm"
-- I will assume there is a 'profiles' table with a 'role' column or a dedicated 'user_roles' table.

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
  -- Insert into auth.users (this is a simplified version, usually handled via Auth API)
  -- But for a migration, we ensure the profile exists with admin privileges.
  
  -- If you want to create the user via SQL, we need to handle the encrypted password.
  -- Supabase uses bcrypt.
  
  -- For now, let's ensure that once the user signs up or is created, 
  -- they are automatically granted admin status based on their email.
  
  -- Example: Update existing profile if it exists, or create a rule.
  
  -- Let's check if the profiles table exists and has a role column.
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    -- This will be handled when the user signs in/up, but we can pre-set it if we have the ID.
    NULL;
  END IF;
END $$;

-- Better approach: Create a policy or trigger that grants admin role to this specific email.
CREATE OR REPLACE FUNCTION public.handle_admin_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'hcbautomotivo@gmail.com' THEN
    -- Assuming a profiles table exists
    UPDATE public.profiles SET role = 'admin' WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- If a roles/profiles system exists, I'll need to know the schema.
-- Let's try to find the schema first.
