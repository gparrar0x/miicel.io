/**
 * Quick script to check if products exist in DB
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function main() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, stock')
    .limit(5)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('Products:', data)
}

main()
