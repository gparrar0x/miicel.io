/**
 * GET  /api/content/jobs/[id] — job status + assets
 * DELETE /api/content/jobs/[id] — cancel pending/processing job
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { assertTenantAccess } from '@/lib/auth/tenant-access'
import { createClientFromRequest, createServiceRoleClient } from '@/lib/supabase/server'
import { ContentGenerationService } from '@/services/content-generation.service'
import { ContentGenerationRepo } from '@/services/repositories/content-generation.repo'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  try {
    const supabase = createClientFromRequest(request)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const readClient = createServiceRoleClient()
    const service = new ContentGenerationService(new ContentGenerationRepo(readClient))
    const job = await service.getJobStatus(id)

    if (!job) {
      return NextResponse.json({ error: 'Job not found.' }, { status: 404 })
    }

    const access = await assertTenantAccess(supabase, user, job.tenant_id, { minRole: 'staff' })
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    return NextResponse.json({ job })
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error(`GET /api/content/jobs/${id} error:`, err)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  try {
    const supabase = createClientFromRequest(request)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const writeClient = createServiceRoleClient()
    const service = new ContentGenerationService(new ContentGenerationRepo(writeClient))
    const job = await service.getJobStatus(id)

    if (!job) {
      return NextResponse.json({ error: 'Job not found.' }, { status: 404 })
    }

    const accessDel = await assertTenantAccess(supabase, user, job.tenant_id, {
      minRole: 'tenant_admin',
    })
    if (!accessDel.ok) {
      return NextResponse.json({ error: accessDel.error }, { status: accessDel.status })
    }

    if (!['pending', 'processing'].includes(job.status)) {
      return NextResponse.json(
        { error: 'Only pending or processing jobs can be cancelled.' },
        { status: 409 },
      )
    }

    const cancelled = await service.cancelJob(id)
    return NextResponse.json({ job: cancelled })
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error(`DELETE /api/content/jobs/${id} error:`, err)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 },
    )
  }
}
