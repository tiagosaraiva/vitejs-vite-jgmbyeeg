/*
  # Add password field to users table

  1. Changes
    - Add password field to users table for storing hashed passwords
    - Update existing admin user password
*/

-- Add password column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password text;

-- Update admin user password
UPDATE users
SET password = crypt('admin123456', gen_salt('bf'))
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Update handle_new_user function to include password
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, role, active, password)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    'user',
    true,
    new.encrypted_password
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;