/**
 * POST /api/products/upload-image - Upload Product Image
 *
 * Uploads image to Supabase Storage bucket 'product-images'.
 * Files are organized by tenant: {tenant_id}/{timestamp}-{uuid}.{ext}
 *
 * Request: multipart/form-data
 * - file: File (image file)
 * - tenant_id: string (tenant ID)
 *
 * Response:
 * {
 *   url: string (public URL of uploaded image),
 *   path: string (storage path)
 * }
 *
 * Security:
 * - Authentication required
 * - Tenant ownership verified
 * - RLS policy enforces folder-level access
 *
 * Performance:
 * - Direct upload to Supabase Storage (no local temp files)
 * - Unique filenames prevent collisions
 * - Public bucket for fast CDN delivery
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Maximum file size: 5MB
 * Supported formats: jpg, jpeg, png, webp, gif
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Step 1: Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Step 2: Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const tenantIdStr = formData.get('tenant_id') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Please upload an image.' },
        { status: 400 }
      )
    }

    if (!tenantIdStr) {
      return NextResponse.json(
        { error: 'No tenant_id provided.' },
        { status: 400 }
      )
    }

    const tenantId = parseInt(tenantIdStr)

    if (isNaN(tenantId)) {
      return NextResponse.json(
        { error: 'Invalid tenant_id.' },
        { status: 400 }
      )
    }

    // Step 3: Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed (jpg, png, webp, gif).' },
        { status: 400 }
      )
    }

    // Step 4: Verify user owns tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, owner_id')
      .eq('id', tenantId)
      .maybeSingle()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found.' },
        { status: 404 }
      )
    }

    const isSuperadmin = user.email?.toLowerCase().trim() === 'gparrar@skywalking.dev'

    if (!isSuperadmin && tenant.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden. You do not own this tenant.' },
        { status: 403 }
      )
    }

    // Step 5: Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg'
    const timestamp = Date.now()
    const randomId = crypto.randomUUID()
    const filename = `${tenantId}/${timestamp}-${randomId}.${ext}`

    // Step 6: Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filename, file, {
        contentType: file.type,
        upsert: false, // Don't overwrite existing files
        cacheControl: '3600', // Cache for 1 hour
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file. Please try again.' },
        { status: 500 }
      )
    }

    // Step 7: Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filename)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: filename,
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/products/upload-image:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
