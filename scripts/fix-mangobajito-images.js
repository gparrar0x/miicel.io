#!/usr/bin/env node
/**
 * Fix MangoBajito Product Image URLs
 *
 * This script updates the image_url for all MangoBajito products
 * to point to the correct public folder images.
 *
 * Usage:
 *   node scripts/fix-mangobajito-images.js
 *
 * Requires:
 *   - NEXT_PUBLIC_SUPABASE_URL env var
 *   - SUPABASE_SERVICE_ROLE_KEY env var
 */

const { createClient } = require('@supabase/supabase-js')

// Load env vars
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  console.error('\nMake sure you have a .env.local file with these variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixMangoBajitoImages() {
  console.log('🔧 Fixing MangoBajito product images...\n')

  try {
    // 1. Get MangoBajito tenant ID
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name, slug')
      .eq('slug', 'mangobajito')
      .single()

    if (tenantError) {
      throw new Error(`Failed to find mangobajito tenant: ${tenantError.message}`)
    }

    if (!tenant) {
      throw new Error('MangoBajito tenant not found')
    }

    console.log(`✓ Found tenant: ${tenant.name} (ID: ${tenant.id})`)

    // 2. Get all products for this tenant
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, image_url')
      .eq('tenant_id', tenant.id)
      .order('id')

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`)
    }

    console.log(`✓ Found ${products.length} products\n`)

    // 3. Update each product's image_url
    let updatedCount = 0
    for (const product of products) {
      const productId = product.id
      const newImageUrl = `/tenants/mangobajito/product_${productId}.webp`

      console.log(`  Updating product #${productId}: ${product.name}`)
      console.log(`    Old URL: ${product.image_url || '(null)'}`)
      console.log(`    New URL: ${newImageUrl}`)

      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: newImageUrl })
        .eq('id', productId)

      if (updateError) {
        console.error(`    ❌ Failed: ${updateError.message}`)
      } else {
        console.log(`    ✓ Updated`)
        updatedCount++
      }
    }

    console.log(`\n✅ Successfully updated ${updatedCount}/${products.length} products`)

    // 4. Verify the images exist in public folder
    console.log('\n📁 Checking if image files exist:')
    const fs = require('node:fs')
    const path = require('node:path')
    const publicDir = path.join(__dirname, '..', 'public', 'tenants', 'mangobajito')

    const missingFiles = []
    for (const product of products) {
      const filename = `product_${product.id}.webp`
      const filepath = path.join(publicDir, filename)

      if (!fs.existsSync(filepath)) {
        missingFiles.push(filename)
        console.log(`  ⚠️  Missing: ${filename}`)
      }
    }

    if (missingFiles.length === 0) {
      console.log('  ✓ All image files exist')
    } else {
      console.log(`\n⚠️  ${missingFiles.length} image files are missing`)
      console.log('  These products will still show broken images until files are added.')
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

// Run the fix
fixMangoBajitoImages()
