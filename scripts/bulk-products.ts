/**
 * Bulk product loader — reads a JSON file and inserts into Supabase.
 *
 * Usage:
 *   npx tsx scripts/bulk-products.ts <tenant_id> <file.json>
 *
 * JSON format (array):
 * [
 *   { "name": "Product A", "price": 100, "category": "drinks", "description": "...", "stock": 10, "image_url": "https://..." },
 *   { "name": "Product B", "price": 200 }
 * ]
 *
 * Required fields: name, price
 * Optional: description, category, stock (default 0), image_url, active (default true), author_id
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const [tenantId, filePath] = process.argv.slice(2)

if (!tenantId || !filePath) {
  console.error('Usage: npx tsx scripts/bulk-products.ts <tenant_id> <file.json>')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

interface ProductInput {
  name: string
  price: number
  description?: string
  category?: string
  stock?: number
  image_url?: string
  active?: boolean
  author_id?: number | null
}

async function main() {
  const raw = readFileSync(filePath, 'utf-8')
  const items: ProductInput[] = JSON.parse(raw)

  if (!Array.isArray(items) || items.length === 0) {
    console.error('JSON must be a non-empty array')
    process.exit(1)
  }

  const rows = items.map((item) => ({
    tenant_id: Number(tenantId),
    name: item.name,
    price: item.price,
    description: item.description ?? null,
    category: item.category ?? null,
    stock: item.stock ?? 0,
    image_url: item.image_url ?? null,
    active: item.active ?? true,
    author_id: item.author_id ?? null,
  }))

  // Supabase insert supports batch — single round-trip
  const { data, error } = await supabase.from('products').insert(rows).select('id, name')

  if (error) {
    console.error('Insert failed:', error.message)
    process.exit(1)
  }

  console.log(`Inserted ${data.length} products:`)
  for (const p of data) {
    console.log(`  #${p.id} ${p.name}`)
  }
}

main()
