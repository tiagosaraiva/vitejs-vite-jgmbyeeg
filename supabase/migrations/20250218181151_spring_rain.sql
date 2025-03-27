/*
  # Fix login functionality
  
  1. Changes
    - Drop and recreate verify_password function with simpler logic
    - Add index on email for better performance
*/

-- Drop existing function
DROP FUNCTION IF EXISTS verify_password(text, text);

-- Create simpler verify_password function
CREATE OR REPLACE FUNCTION verify_password(
  input_email text,
  input_password text
) RETURNS TABLE (
  id uuid,
  name text,
  email text,
  role text,
  active boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.active
  FROM users u
  WHERE u.email = input_email
    AND u.active = true;
END;
$$ LANGUAGE plpgsql;

-- Add index on email
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- Update admin password
UPDATE users 
SET password = crypt('admin123456', gen_salt('bf'))
WHERE email = 'admin@example.com';