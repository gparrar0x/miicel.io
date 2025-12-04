-- Migration: 034_seed_platform_admin
-- Description: Create platform admin user in auth.users and users table
-- Created: 2024-12-04

-- Create auth user for platform admin
DO $$
DECLARE
  v_admin_user_id uuid;
BEGIN
  -- Check if admin already exists
  SELECT id INTO v_admin_user_id
  FROM auth.users
  WHERE email = 'admin@miicel.io';

  IF v_admin_user_id IS NULL THEN
    -- Create auth user (password: Admin123!)
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_token,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_sent_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@miicel.io',
      crypt('Admin123!', gen_salt('bf')),
      now(),
      '',
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{}',
      false,
      now()
    ) RETURNING id INTO v_admin_user_id;

    -- Create user record in users table
    INSERT INTO users (auth_user_id, email, name, role, tenant_id, is_active)
    VALUES (v_admin_user_id, 'admin@miicel.io', 'Platform Admin', 'platform_admin', NULL, true);

    RAISE NOTICE 'Platform admin created: admin@miicel.io';
  ELSE
    RAISE NOTICE 'Platform admin already exists';
  END IF;
END $$;
