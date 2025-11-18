#!/bin/bash

# Clean Test Data from Database
# Removes all test tenants and related data

echo "🗑️  Cleaning test data from database..."

# Read the SQL file
SQL=$(cat db/scripts/clean-test-data.sql)

# Execute via Node.js script
node -e "
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('Deleting test orders...');
  await supabase.from('orders').delete().like('tenant_id.tenants.slug', 'test-%');

  console.log('Deleting test products...');
  const { data: tenants } = await supabase.from('tenants').select('id').or('slug.like.test-%,slug.like.e2e-%,slug.like.store-%,slug.like.no-logo-%');
  const tenantIds = tenants?.map(t => t.id) || [];

  if (tenantIds.length > 0) {
    await supabase.from('products').delete().in('tenant_id', tenantIds);
    await supabase.from('customers').delete().in('tenant_id', tenantIds);
    await supabase.from('orders').delete().in('tenant_id', tenantIds);
  }

  console.log('Deleting test tenants...');
  const { error, count } = await supabase.from('tenants').delete().or('slug.like.test-%,slug.like.e2e-%,slug.like.store-%,slug.like.no-logo-%');

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Cleaned', count, 'test tenants');
  }
})();
"

echo "✅ Database cleaned!"
