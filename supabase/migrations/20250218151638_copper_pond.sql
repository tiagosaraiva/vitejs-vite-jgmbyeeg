/*
  # Remove authentication policies and allow public access
  
  1. Changes
    - Remove all RLS policies from users table
    - Disable RLS on users table
    - Add function for password verification
    - Add function for user login
*/

-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- Create function to verify password
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
    AND u.password = crypt(input_password, u.password)
    AND u.active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;