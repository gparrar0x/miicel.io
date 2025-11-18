-- =============================================================================
-- RESET DATABASE SCRIPT
-- WARNING: This will DELETE ALL DATA from your database
-- USE ONLY IN DEVELOPMENT
-- =============================================================================

-- Disable triggers temporarily to avoid FK constraints issues
SET session_replication_role = 'replica';

-- =============================================================================
-- PUBLIC SCHEMA (Business Data)
-- =============================================================================

-- Orders must be deleted first (references customers)
TRUNCATE TABLE public.orders RESTART IDENTITY CASCADE;

-- Then customers
TRUNCATE TABLE public.customers RESTART IDENTITY CASCADE;

-- Then products
TRUNCATE TABLE public.products RESTART IDENTITY CASCADE;

-- Finally tenants (referenced by all above)
TRUNCATE TABLE public.tenants RESTART IDENTITY CASCADE;

-- =============================================================================
-- AUTH SCHEMA (User Data)
-- =============================================================================
-- WARNING: This deletes all users and sessions
-- Comment out this section if you want to keep users

-- Delete sessions first (references users)
TRUNCATE TABLE auth.sessions RESTART IDENTITY CASCADE;

-- Delete refresh tokens
TRUNCATE TABLE auth.refresh_tokens RESTART IDENTITY CASCADE;

-- Delete identities (references users)
TRUNCATE TABLE auth.identities RESTART IDENTITY CASCADE;

-- Delete MFA-related data
TRUNCATE TABLE auth.mfa_amr_claims RESTART IDENTITY CASCADE;
TRUNCATE TABLE auth.mfa_challenges RESTART IDENTITY CASCADE;
TRUNCATE TABLE auth.mfa_factors RESTART IDENTITY CASCADE;

-- Delete one-time tokens
TRUNCATE TABLE auth.one_time_tokens RESTART IDENTITY CASCADE;

-- Delete OAuth data
TRUNCATE TABLE auth.oauth_authorizations RESTART IDENTITY CASCADE;
TRUNCATE TABLE auth.oauth_consents RESTART IDENTITY CASCADE;

-- Finally, delete users
TRUNCATE TABLE auth.users RESTART IDENTITY CASCADE;

-- =============================================================================
-- Re-enable triggers
-- =============================================================================
SET session_replication_role = 'origin';

-- =============================================================================
-- VERIFICATION
-- =============================================================================
SELECT
  'tenants' as table_name,
  COUNT(*) as row_count
FROM public.tenants
UNION ALL
SELECT 'products', COUNT(*) FROM public.products
UNION ALL
SELECT 'customers', COUNT(*) FROM public.customers
UNION ALL
SELECT 'orders', COUNT(*) FROM public.orders
UNION ALL
SELECT 'users', COUNT(*) FROM auth.users
UNION ALL
SELECT 'sessions', COUNT(*) FROM auth.sessions;
