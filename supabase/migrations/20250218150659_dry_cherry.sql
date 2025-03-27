/*
  # Update users table schema
  
  1. Changes
    - Remove auth.users dependency
    - Add email column
    - Add unique constraint on email
    - Update RLS policies
  
  2. Security
    - Maintain RLS policies for data protection
    - Ensure email uniqueness
*/

-- Drop existing trigger and function that depends on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Add email column and make it unique
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email text UNIQUE;

-- Update RLS policies to use email instead of auth.uid()
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (email = current_user);

DROP POLICY IF EXISTS "Admins can read all users" ON users;
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = current_user 
      AND role = 'admin'
      AND active = true
    )
  );

DROP POLICY IF EXISTS "Admins can insert users" ON users;
CREATE POLICY "Admins can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = current_user 
      AND role = 'admin'
      AND active = true
    )
  );

DROP POLICY IF EXISTS "Admins can update users" ON users;
CREATE POLICY "Admins can update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = current_user 
      AND role = 'admin'
      AND active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = current_user 
      AND role = 'admin'
      AND active = true
    )
  );

DROP POLICY IF EXISTS "Admins can delete users" ON users;
CREATE POLICY "Admins can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = current_user 
      AND role = 'admin'
      AND active = true
    )
  );

-- Update admin user with email
UPDATE users
SET email = 'admin@example.com'
WHERE role = 'admin'
AND name = 'Administrador';