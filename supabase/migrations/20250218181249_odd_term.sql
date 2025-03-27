/*
  # Fix user creation
  
  1. Changes
    - Modify users table to use gen_random_uuid() as default for id
    - Remove foreign key constraint with auth.users
*/

-- Remove foreign key constraint if it exists
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Modify id column to use gen_random_uuid() as default
ALTER TABLE users 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Create or replace the function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    name,
    email,
    role,
    active,
    password,
    created_at,
    updated_at
  )
  VALUES (
    NEW.name,
    NEW.email,
    NEW.role,
    NEW.active,
    crypt(NEW.password, gen_salt('bf')),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;