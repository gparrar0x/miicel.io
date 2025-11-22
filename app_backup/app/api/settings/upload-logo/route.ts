/**
 * POST /api/settings/upload-logo - Upload Tenant Logo
 *
 * Uploads logo to Supabase Storage assets bucket and returns public URL.
 * Automatically updates tenant.config.logo field with new URL.
 *
 * Security:
 * - Requires authentication
 * - Verifies tenant ownership
 * - File validation (size, type)
 * - RLS policies on storage bucket
 *
 * Flow:
 * 1. Verify auth and tenant ownership
 * 2. Validate file (max 10MB, image types only)
 * 3. Upload to assets bucket: {tenant_slug}/logo-{timestamp}.{ext}
 * 4. Update tenant.config.logo with public URL
 * 5. Return new URL
 */

import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']

/**
 * POST /api/settings/upload-logo?tenant_id=123
 *
 * Request: multipart/form-data
 * - file: File (logo image)
 *
 * Response:
 * {
 *   url: string,
 *   tenant_id: number
 * }
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenant_id')

    if (!tenantId || isNaN(parseInt(tenantId))) {
      return NextResponse.json(
        { error: 'Valid tenant_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Fetch tenant for ownership check
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, slug, owner_id, config')
      .eq('id', parseInt(tenantId))
      .maybeSingle()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found.' },
        { status: 404 }
      )
    }

    // Verify ownership (allow superadmin)
    const isSuperAdmin = user.email === 'gparrar@skywalking.dev'
    if (!isSuperAdmin && tenant.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden. You do not own this tenant.' },
        { status: 403 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Use multipart/form-data with "file" field.' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Allowed: PNG, JPEG, WEBP, SVG.',
          received: file.type
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'File too large. Max size: 10MB.',
          size: file.size,
          max: MAX_FILE_SIZE
        },
        { status: 400 }
      )
    }

    // Generate file path: {tenant_slug}/logo-{timestamp}.{ext}
    const fileExt = file.name.split('.').pop()
    const fileName = `${tenant.slug}/logo-${Date.now()}.${fileExt}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file to storage.' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('assets')
      .getPublicUrl(fileName)

    // Update tenant config with new logo URL
    const updatedConfig = {
      ...(tenant.config as any || {}),
      logo: publicUrl,
      logo_url: publicUrl // Support both formats
    }

    // Use service role for superadmin to bypass RLS
    const updateClient = isSuperAdmin ? createServiceRoleClient() : supabase
    const { error: updateError } = await updateClient
      .from('tenants')
      .update({
        config: updatedConfig,
        updated_at: new Date().toISOString()
      })
      .eq('id', tenant.id)

    if (updateError) {
      console.error('Error updating tenant config:', updateError)
      // File uploaded but config update failed - log warning but return URL
      console.warn('Logo uploaded but tenant.config.logo update failed. Manual update may be needed.')
    }

    return NextResponse.json({
      url: publicUrl,
      tenant_id: tenant.id,
      file_name: fileName
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/settings/upload-logo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
