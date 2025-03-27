/*
  # Create admin user
  
  1. Changes
    - Create admin user in auth.users
    - Create corresponding admin user in public.users
    - Link both users with the same UUID
  
  2. Security
    - Use secure password hashing
    - Maintain data consistency between tables
*/

-- Create admin user in auth.users if it doesn't exist
DO $$ 
DECLARE
  admin_uuid uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- Only proceed if admin doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'admin@example.com'
  ) THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role_id
    )
    VALUES (
      admin_uuid,
      '00000000-0000-0000-0000-000000000000',
      'admin@example.com',
      crypt('admin123456', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Administrador"}',
      false,
      1
    );

    -- Insert into public.users
    INSERT INTO public.users (
      id,
      email,
      name,
      role,
      active,
      created_at,
      updated_at
    )
    VALUES (
      admin_uuid,
      'admin@example.com',
      'Administrador',
      'admin',
      true,
      now(),
      now()
    );
  END IF;
END $$;