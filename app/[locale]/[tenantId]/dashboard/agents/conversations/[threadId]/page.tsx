import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AgentBadge } from '@/components/dashboard/agents/AgentBadge'
import { ConversationThread } from '@/components/dashboard/agents/ConversationThread'
import { StatusBadge } from '@/components/dashboard/data-table'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getConversation } from '@/services/agents/dashboard'

interface PageProps {
  params: Promise<{ tenantId: string; locale: string; threadId: string }>
}

function statusVariant(status: string): 'default' | 'secondary' | 'outline' {
  if (status === 'active') return 'default'
  if (status === 'closed') return 'secondary'
  return 'outline'
}

export default async function ConversationDetailPage({ params }: PageProps) {
  const { tenantId, locale, threadId } = await params

  // Resolve tenant numeric ID
  const db = createServiceRoleClient()
  const numericId = Number(tenantId)
  const isNumeric = !Number.isNaN(numericId)

  const { data: tenant } = await (db as any)
    .from('tenants')
    .select('id')
    .eq(isNumeric ? 'id' : 'slug', isNumeric ? numericId : tenantId)
    .single()

  if (!tenant) notFound()

  const conversation = await getConversation(tenant.id, threadId)
  if (!conversation) notFound()

  const agentName = conversation.messages?.findLast((m) => m.role === 'assistant')?.agent ?? ''

  return (
    <div data-testid="conversation-detail-page" className="space-y-4">
      {/* Back link + meta */}
      <div className="flex items-center justify-between">
        <Link
          href={`/${locale}/${tenantId}/dashboard/agents`}
          data-testid="btn-back-to-agents"
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Agents
        </Link>
        <div className="flex items-center gap-2">
          {agentName && <AgentBadge agentName={agentName} />}
          <StatusBadge status={conversation.status} variant={statusVariant(conversation.status)} />
        </div>
      </div>

      {/* Thread ID */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Thread{' '}
          <span className="font-mono text-base text-muted-foreground">
            {conversation.thread_id}
          </span>
        </h1>
      </div>

      {/* Chat UI */}
      <ConversationThread conversation={conversation} tenantId={tenant.id} />
    </div>
  )
}
