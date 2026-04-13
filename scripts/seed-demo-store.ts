/**
 * Seed demo stores for Micelio showcases.
 *
 * Usage:
 *   npx tsx scripts/seed-demo-store.ts <store-key>
 *   npx tsx scripts/seed-demo-store.ts colombia
 *   npx tsx scripts/seed-demo-store.ts --list
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

// ─── ENV ────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ─── TYPES ──────────────────────────────────────────────────────────────

interface DemoTenant {
  slug: string
  name: string
  template: string
  plan: string
  config: Record<string, unknown>
}

interface DemoProduct {
  name: string
  description: string
  price: number
  category: string
  image_url: string
  display_order: number
  metadata: Record<string, unknown>
}

interface DemoStore {
  tenant: DemoTenant
  products: DemoProduct[]
}

// ─── DEMO STORES ────────────────────────────────────────────────────────

const STORES: Record<string, DemoStore> = {
  colombia: {
    tenant: {
      slug: 'sazon-criollo',
      name: 'Sazon Criollo',
      template: 'gastronomy',
      plan: 'pro',
      config: {
        logo: null,
        banner: null,
        colors: {
          primary: '#C41E3A',
          secondary: '#003087',
          accent: '#FCD116',
          background: '#FFFDF7',
          surface: '#FFF8ED',
          textPrimary: '#1A1A1A',
          textSecondary: '#6B6B6B',
        },
        business: {
          name: 'Sazon Criollo',
          subtitle: 'Sabor colombiano de verdad',
          location: 'Cra 7 #45-12, Chapinero — Bogota, Colombia',
        },
        hours: {
          monday: { open: '07:00', close: '22:00' },
          tuesday: { open: '07:00', close: '22:00' },
          wednesday: { open: '07:00', close: '22:00' },
          thursday: { open: '07:00', close: '22:00' },
          friday: { open: '07:00', close: '23:00' },
          saturday: { open: '08:00', close: '23:00' },
          sunday: { open: '08:00', close: '21:00' },
        },
        currency: 'COP',
      },
    },
    products: [
      // Platos Fuertes
      {
        name: 'Bandeja Paisa',
        description:
          'Frijoles, arroz, chicharron, carne molida, chorizo, huevo frito, tajada de platano, arepa y aguacate',
        price: 28000,
        category: 'Platos Fuertes',
        image_url: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800',
        display_order: 1,
        metadata: { badges: ['popular'] },
      },
      {
        name: 'Ajiaco Bogotano',
        description:
          'Sopa espesa de papa criolla, papa pastusa, papa sabanera, pollo desmechado, mazorca, guasca, alcaparras y crema',
        price: 22000,
        category: 'Platos Fuertes',
        image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
        display_order: 2,
        metadata: { badges: ['popular'] },
      },
      {
        name: 'Sancocho de Gallina',
        description:
          'Gallina criolla, yuca, papa, platano, mazorca y cilantro. Servido con arroz y aguacate',
        price: 25000,
        category: 'Platos Fuertes',
        image_url: 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=800',
        display_order: 3,
        metadata: { badges: [] },
      },
      {
        name: 'Mojarra Frita',
        description: 'Mojarra entera frita, patacones, arroz con coco, ensalada y limon',
        price: 26000,
        category: 'Platos Fuertes',
        image_url: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800',
        display_order: 4,
        metadata: { badges: [] },
      },
      {
        name: 'Lechona Tolimense',
        description: 'Cerdo relleno de arroz y arvejas, servido con arepa',
        price: 24000,
        category: 'Platos Fuertes',
        image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
        display_order: 5,
        metadata: { badges: ['nuevo'] },
      },
      {
        name: 'Cazuela de Mariscos',
        description: 'Camarones, calamar, pulpo y pescado en salsa de coco con arroz de coco',
        price: 32000,
        category: 'Platos Fuertes',
        image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800',
        display_order: 6,
        metadata: { badges: [] },
      },
      // Entradas
      {
        name: 'Empanadas (3 uds)',
        description: 'Empanadas de carne con papa, masa de maiz crujiente. Servidas con aji',
        price: 8000,
        category: 'Entradas',
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800',
        display_order: 10,
        metadata: { badges: ['popular'] },
      },
      {
        name: 'Arepa de Chocolo con Queso',
        description: 'Arepa dulce de maiz tierno rellena de queso campesino derretido',
        price: 9000,
        category: 'Entradas',
        image_url: 'https://images.unsplash.com/photo-1599491143603-59da5d3e6a50?w=800',
        display_order: 11,
        metadata: { badges: [] },
      },
      {
        name: 'Patacones con Hogao',
        description: 'Platano verde frito con hogao de tomate y cebolla',
        price: 7000,
        category: 'Entradas',
        image_url: 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb6?w=800',
        display_order: 12,
        metadata: { badges: ['veggie'] },
      },
      {
        name: 'Chicharron con Arepa',
        description: 'Chicharron crujiente servido con arepa blanca y limon',
        price: 10000,
        category: 'Entradas',
        image_url: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800',
        display_order: 13,
        metadata: { badges: [] },
      },
      {
        name: 'Carimanolas (3 uds)',
        description: 'Croquetas de yuca rellenas de carne. Crujientes por fuera, suaves por dentro',
        price: 9000,
        category: 'Entradas',
        image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
        display_order: 14,
        metadata: { badges: ['nuevo'] },
      },
      // Bebidas
      {
        name: 'Limonada de Coco',
        description: 'Limonada natural con leche de coco',
        price: 6000,
        category: 'Bebidas',
        image_url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800',
        display_order: 20,
        metadata: { badges: ['popular'] },
      },
      {
        name: 'Jugo de Lulo',
        description: 'Jugo natural de lulo, fruta colombiana por excelencia',
        price: 5000,
        category: 'Bebidas',
        image_url: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800',
        display_order: 21,
        metadata: { badges: [] },
      },
      {
        name: 'Jugo de Maracuya',
        description: 'Jugo natural de maracuya endulzado con panela',
        price: 5000,
        category: 'Bebidas',
        image_url: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800',
        display_order: 22,
        metadata: { badges: [] },
      },
      {
        name: 'Aguapanela con Limon',
        description: 'Agua de panela caliente o fria con limon',
        price: 4000,
        category: 'Bebidas',
        image_url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800',
        display_order: 23,
        metadata: { badges: [] },
      },
      {
        name: 'Cafe Colombiano',
        description: 'Tinto de origen, cultivado en el Eje Cafetero',
        price: 3500,
        category: 'Bebidas',
        image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=800',
        display_order: 24,
        metadata: { badges: [] },
      },
      {
        name: 'Cerveza Club Colombia Dorada',
        description: 'Cerveza premium colombiana 330ml',
        price: 7000,
        category: 'Bebidas',
        image_url: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800',
        display_order: 25,
        metadata: { badges: [] },
      },
      // Postres
      {
        name: 'Tres Leches',
        description: 'Bizcocho esponjoso banado en tres leches con merengue italiano',
        price: 10000,
        category: 'Postres',
        image_url: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800',
        display_order: 30,
        metadata: { badges: ['popular'] },
      },
      {
        name: 'Arroz con Leche',
        description: 'Arroz cremoso con leche, canela y uvas pasas',
        price: 7000,
        category: 'Postres',
        image_url: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800',
        display_order: 31,
        metadata: { badges: [] },
      },
      {
        name: 'Obleas con Arequipe',
        description: 'Obleas crujientes con arequipe, coco rallado y breva',
        price: 6000,
        category: 'Postres',
        image_url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800',
        display_order: 32,
        metadata: { badges: [] },
      },
      // Combos
      {
        name: 'Combo Paisa Completo',
        description: 'Bandeja paisa + jugo natural + postre del dia',
        price: 35000,
        category: 'Combos',
        image_url: 'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=800',
        display_order: 40,
        metadata: { badges: ['promo'] },
      },
      {
        name: 'Combo Ejecutivo',
        description: 'Plato fuerte del dia + sopa + jugo + postre',
        price: 20000,
        category: 'Combos',
        image_url: 'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=800',
        display_order: 41,
        metadata: { badges: ['promo', 'popular'] },
      },
      {
        name: 'Combo Familiar (4 personas)',
        description: 'Sancocho grande + arroz + 4 jugos + patacones',
        price: 85000,
        category: 'Combos',
        image_url: 'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=800',
        display_order: 42,
        metadata: { badges: ['promo'] },
      },
    ],
  },
}

// ─── MAIN ───────────────────────────────────────────────────────────────

const DEMO_OWNER_ID = '4cf1d146-1bb7-4997-9618-639c6b0a7b6e' // shared demo owner (same as demo_galeria/demo_restaurant)
const DEMO_EMAIL = 'demo@micelio.skyw.app'

async function seedStore(key: string) {
  const store = STORES[key]
  if (!store) {
    console.error(`Unknown store: "${key}". Available: ${Object.keys(STORES).join(', ')}`)
    process.exit(1)
  }

  const { tenant, products } = store
  console.log(`\nSeeding "${tenant.name}" (${tenant.slug})...`)

  // 1. Upsert tenant
  const { data: existing } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenant.slug)
    .single()

  let tenantId: number

  if (existing) {
    const { error } = await supabase
      .from('tenants')
      .update({
        name: tenant.name,
        template: tenant.template,
        plan: tenant.plan,
        config: tenant.config,
        active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    if (error) {
      console.error('Failed to update tenant:', error.message)
      process.exit(1)
    }
    tenantId = existing.id
    console.log(`  Updated tenant #${tenantId}`)
  } else {
    const { data, error } = await supabase
      .from('tenants')
      .insert({
        slug: tenant.slug,
        name: tenant.name,
        template: tenant.template,
        plan: tenant.plan,
        config: tenant.config,
        owner_id: DEMO_OWNER_ID,
        owner_email: DEMO_EMAIL,
        active: true,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to create tenant:', error.message)
      process.exit(1)
    }
    tenantId = data.id
    console.log(`  Created tenant #${tenantId}`)
  }

  // 2. Clear existing products
  const { error: delError } = await supabase.from('products').delete().eq('tenant_id', tenantId)

  if (delError) {
    console.error('Failed to clear products:', delError.message)
    process.exit(1)
  }

  // 3. Insert products (batch)
  const rows = products.map((p) => ({
    tenant_id: tenantId,
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.category,
    image_url: p.image_url,
    display_order: p.display_order,
    metadata: p.metadata,
    active: true,
  }))

  const { data: inserted, error: insError } = await supabase
    .from('products')
    .insert(rows)
    .select('id, name, category, price')

  if (insError) {
    console.error('Failed to insert products:', insError.message)
    process.exit(1)
  }

  // 4. Summary
  const categories = new Map<string, number>()
  for (const p of inserted) {
    categories.set(p.category, (categories.get(p.category) ?? 0) + 1)
  }

  console.log(`  Inserted ${inserted.length} products:`)
  for (const [cat, count] of categories) {
    console.log(`    ${cat}: ${count}`)
  }
  console.log(`\n  Store URL: https://micelio.skyw.app/es/${tenant.slug}`)
}

// ─── CLI ────────────────────────────────────────────────────────────────

const arg = process.argv[2]

if (!arg || arg === '--help') {
  console.log('Usage: npx tsx scripts/seed-demo-store.ts <store-key>')
  console.log('       npx tsx scripts/seed-demo-store.ts --list')
  console.log(`\nAvailable stores: ${Object.keys(STORES).join(', ')}`)
  process.exit(0)
}

if (arg === '--list') {
  for (const [key, store] of Object.entries(STORES)) {
    const currency = (store.tenant.config as Record<string, unknown>).currency ?? '?'
    console.log(`  ${key.padEnd(15)} ${store.tenant.name} (${store.tenant.slug}) — ${currency}`)
  }
  process.exit(0)
}

seedStore(arg)
