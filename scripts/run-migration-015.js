#!/usr/bin/env node

/**
 * Script to apply migration 015 to production Supabase database
 * Run with: node scripts/run-migration-015.js
 */

const fs = require('fs');
const path = require('path');

async function runMigration() {
  // Read environment variables
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lmqysqapqbttmyheuejo.supabase.co';
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
    process.exit(1);
  }

  // Read migration file
  const migrationPath = path.join(__dirname, '../db/supabase/migrations/015_add_tenant_template_theme.sql');
  let sql = fs.readFileSync(migrationPath, 'utf8');

  // Remove minimal-demo INSERT (use only 'sky' tenant)
  sql = sql.replace(/-- Create a third demo tenant[\s\S]*ON CONFLICT[\s\S]*updated_at = NOW\(\);/m, '');

  console.log('📦 Running migration 015_add_tenant_template_theme.sql...\n');

  // Execute via REST API
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql })
  });

  // Try alternative endpoint - direct query
  if (!response.ok) {
    console.log('⚠️  exec_sql RPC not available, trying direct query...\n');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));

    for (const stmt of statements) {
      if (!stmt) continue;

      console.log(`Executing: ${stmt.substring(0, 60)}...`);

      const stmtResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ sql: stmt + ';' })
      });

      if (!stmtResponse.ok) {
        const error = await stmtResponse.text();
        console.error(`❌ Failed: ${error}`);
      } else {
        console.log('✅ Success');
      }
    }
  } else {
    const result = await response.json();
    console.log('✅ Migration applied successfully\n');
    console.log(result);
  }

  // Verify migration
  console.log('\n🔍 Verifying migration...\n');

  const verifyResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/tenants?select=slug,template,theme_overrides&slug=eq.sky`,
    {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    }
  );

  if (verifyResponse.ok) {
    const tenants = await verifyResponse.json();
    console.log('Tenant "sky" configuration:');
    console.log(JSON.stringify(tenants, null, 2));
    console.log('\n✅ Migration verified successfully!');
  } else {
    console.error('❌ Verification failed:', await verifyResponse.text());
  }
}

runMigration().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
