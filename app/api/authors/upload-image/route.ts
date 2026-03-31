/**
 * POST /api/authors/upload-image
 * Uploads author image to Supabase Storage bucket 'author-images'.
 * Path pattern: {tenant_id}/{author_id}/{timestamp}-{uuid}.{ext}
 *
 * Request: multipart/form-data
 * - file: File
 * - tenant_id: string
 * - author_id: string (optional — used for folder organisation)
 *
 * Response: { url: string, path: string }
 */

import { NextResponse } from 'next/server'
import { isSuperadmin } from '@/lib/auth/constants'
import { createClient } from '@/lib/supabase/server'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const BUCKET = 'author-images'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const tenantIdStr = formData.get('tenant_id') as string
    const authorIdStr = formData.get('author_id') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    if (!tenantIdStr) {
      return NextResponse.json({ error: 'tenant_id is required.' }, { status: 400 })
    }

    const tenantId = parseInt(tenantIdStr, 10)
    if (Number.isNaN(tenantId)) {
      return NextResponse.json({ error: 'Invalid tenant_id.' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: jpg, png, webp, gif.' },
        { status: 400 },
      )
    }

    // Verify tenant ownership
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, owner_id')
      .eq('id', tenantId)
      .maybeSingle()

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 })
    }

    const isSuperadminUser = isSuperadmin(user.email)
    if (!isSuperadminUser && tenant.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this tenant.' }, { status: 403 })
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    const timestamp = Date.now()
    const randomId = crypto.randomUUID()
    const folder = authorIdStr ? `${tenantId}/${authorIdStr}` : `${tenantId}`
    const filename = `${folder}/${timestamp}-${randomId}.${ext}`

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filename, file, {
      contentType: file.type,
      upsert: false,
      cacheControl: '3600',
    })

    if (uploadError) {
      console.error('Error uploading author image:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file.' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename)

    return NextResponse.json({ url: urlData.publicUrl, path: filename })
  } catch (err: any) {
    console.error('POST /api/authors/upload-image error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
