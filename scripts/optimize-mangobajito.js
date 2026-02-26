const fs = require('node:fs')
const path = require('node:path')
const sharp = require('sharp')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const TARGET_DIR = path.join(__dirname, '../public/tenants/mangobajito')
const WEB_PATH_PREFIX = '/tenants/mangobajito'

// Config
const MAX_SIZE_KB = 500
const MAX_WIDTH = 1024
const MAX_HEIGHT = 1024

async function main() {
  // 1. Init Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      'Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local',
    )
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // 2. Read directory
  if (!fs.existsSync(TARGET_DIR)) {
    console.error(`Error: Directory not found: ${TARGET_DIR}`)
    process.exit(1)
  }

  const files = fs.readdirSync(TARGET_DIR)
  const imageFiles = files.filter((f) => /\.(png|jpg|jpeg)$/i.test(f) && f.startsWith('product_'))

  console.log(`Found ${imageFiles.length} images to process in ${TARGET_DIR}`)

  for (const file of imageFiles) {
    const filePath = path.join(TARGET_DIR, file)

    // Extract ID
    const match = file.match(/product_(\d+)\./)
    if (!match) {
      console.log(`Skipping ${file}: could not extract ID`)
      continue
    }
    const productId = parseInt(match[1], 10)

    // Output filename
    const outputFilename = `product_${productId}.webp`
    const outputPath = path.join(TARGET_DIR, outputFilename)

    console.log(`Processing ${file} (Product ID: ${productId})...`)

    try {
      // 3. Process image
      // Resize to 1024x1024 (inside) and convert to WebP
      // Start with quality 80
      let quality = 80
      let processedBuffer = await sharp(filePath)
        .resize(MAX_WIDTH, MAX_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true, // Don't upscale if smaller
        })
        .webp({ quality })
        .toBuffer()

      // Check size
      while (processedBuffer.length > MAX_SIZE_KB * 1024 && quality > 10) {
        console.log(
          `  Size ${Math.round(processedBuffer.length / 1024)}KB > ${MAX_SIZE_KB}KB. Reducing quality to ${quality - 10}...`,
        )
        quality -= 10
        processedBuffer = await sharp(filePath)
          .resize(MAX_WIDTH, MAX_HEIGHT, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality })
          .toBuffer()
      }

      if (processedBuffer.length > MAX_SIZE_KB * 1024) {
        console.warn(
          `  Warning: Could not get under ${MAX_SIZE_KB}KB even with quality ${quality}. Size: ${Math.round(processedBuffer.length / 1024)}KB`,
        )
      }

      // Write to disk
      fs.writeFileSync(outputPath, processedBuffer)
      console.log(`  Saved to ${outputFilename} (${Math.round(processedBuffer.length / 1024)}KB)`)

      // 4. Update Database
      const publicUrl = `${WEB_PATH_PREFIX}/${outputFilename}`

      const { error } = await supabase
        .from('products')
        .update({ image_url: publicUrl })
        .eq('id', productId)

      if (error) {
        console.error(`  Error updating DB for product ${productId}:`, error.message)
      } else {
        console.log(`  Updated DB for product ${productId}`)
      }
    } catch (err) {
      console.error(`  Error processing ${file}:`, err)
    }
  }

  console.log('Done!')
}

main()
