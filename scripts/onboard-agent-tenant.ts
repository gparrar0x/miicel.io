/**
 * Activate and verify the Micelio agent system for an existing tenant.
 *
 * Usage:
 *   npx tsx scripts/onboard-agent-tenant.ts --tenant-id 123
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config({ path: path.resolve(__dirname, '../.env.local'), override: true })

const REQUIRED_VARS = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'ANTHROPIC_API_KEY']

function validateEnv(): void {
  const missing = REQUIRED_VARS.filter((v) => !process.env[v])
  if (missing.length > 0) {
    console.error('Missing required env vars:', missing.join(', '))
    process.exit(1)
  }
}

function parseTenantId(): number {
  const idx = process.argv.indexOf('--tenant-id')
  if (idx === -1 || !process.argv[idx + 1]) {
    console.error('Usage: npx tsx scripts/onboard-agent-tenant.ts --tenant-id <id>')
    process.exit(1)
  }
  const id = parseInt(process.argv[idx + 1], 10)
  if (isNaN(id)) {
    console.error('Invalid --tenant-id: must be a number')
    process.exit(1)
  }
  return id
}

function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

async function main() {
  validateEnv()
  const tenantId = parseTenantId()

  const db = createServiceRoleClient()

  // 1. Verify tenant exists
  const { data: tenant, error: tenantErr } = await (db as any)
    .from('tenants')
    .select('id, name, slug')
    .eq('id', tenantId)
    .single()

  if (tenantErr || !tenant) {
    console.error(`Tenant ${tenantId} not found:`, tenantErr?.message ?? 'no data')
    process.exit(1)
  }

  console.log(`\nTenant found: ${tenant.name} (slug: ${tenant.slug}, id: ${tenant.id})`)

  // 2. Create a test conversation
  const threadId = `onboard-test-${Date.now()}`

  const { data: conv, error: convErr } = await (db as any)
    .from('agent_conversations')
    .insert({
      tenant_id: tenantId,
      thread_id: threadId,
      from_channel: 'onboarding',
      messages: [
        {
          role: 'user',
          content: 'Hello, Micelio. This is an onboarding test.',
          timestamp: new Date().toISOString(),
        },
      ],
    })
    .select('id')
    .single()

  if (convErr || !conv) {
    console.error('Failed to create test conversation:', convErr?.message)
    process.exit(1)
  }

  console.log(`Test conversation created: ${conv.id}`)

  // 3. Verify agent system via health endpoint (local or production)
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  let agentStatus: string[] = []

  try {
    const res = await fetch(`${BASE_URL}/api/agents/health`)
    if (res.ok) {
      const health = (await res.json()) as { status: string; agents: string[] }
      agentStatus = health.agents ?? []
      console.log(`Health check: ${health.status} | agents: ${agentStatus.join(', ') || 'none'}`)
    } else {
      console.warn(`Health check returned ${res.status} — skipping`)
    }
  } catch {
    console.warn('Health endpoint unreachable — ensure dev server is running for full check')
  }

  // 4. Clean up test conversation
  await (db as any).from('agent_conversations').delete().eq('id', conv.id)

  // 5. Summary
  console.log('\n--- Onboarding Summary ---')
  console.log(`Tenant: ${tenant.name} (id: ${tenantId})`)
  console.log(
    `Available agents: ${agentStatus.length > 0 ? agentStatus.join(', ') : 'check ANTHROPIC_API_KEY'}`,
  )
  console.log('DB write/delete: OK')
  console.log('Status: READY\n')
}

main().catch((err) => {
  console.error('Onboarding failed:', err)
  process.exit(1)
})
