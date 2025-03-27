/*
  # Create admin user

  1. Changes
    - Insert admin user into public.users table with required fields
  
  2. Security
    - Password is hashed using pgcrypto
*/

-- Create extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert admin user
INSERT INTO public.users (
  id,
  name,
  role,
  active,
  password
)
VALUES (
  gen_random_uuid(),
  'Administrador',
  'admin',
  true,
  crypt('admin123456', gen_salt('bf'))
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  password = EXCLUDED.password;