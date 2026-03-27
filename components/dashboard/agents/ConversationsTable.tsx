'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AgentBadge } from '@/components/dashboard/agents/AgentBadge'
import { StatusBadge } from '@/components/dashboard/data-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ConversationRow } from '@/services/agents/dashboard'

interface ConversationsTableProps {
  conversations: ConversationRow[]
}

function truncate(str: string, len = 60) {
  return str.length > len ? `${str.slice(0, len)}…` : str
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusVariant(status: string): 'default' | 'secondary' | 'outline' {
  if (status === 'active') return 'default'
  if (status === 'closed') return 'secondary'
  return 'outline'
}

export function ConversationsTable({ conversations }: ConversationsTableProps) {
  const params = useParams<{ locale: string; tenantId: string }>()
  const basePath = `/${params.locale}/${params.tenantId}/dashboard/agents/conversations`

  if (conversations.length === 0) {
    return (
      <div
        data-testid="conversations-table-empty"
        className="flex items-center justify-center rounded-lg border border-border bg-secondary/30 py-12 text-sm text-muted-foreground"
      >
        No conversations yet.
      </div>
    )
  }

  return (
    <div
      data-testid="conversations-table"
      className="overflow-hidden rounded-lg border border-border"
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary hover:bg-secondary">
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Thread ID
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Last Message
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Agent
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Updated
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {conversations.map((conv) => (
            <TableRow
              key={conv.id}
              className="cursor-pointer hover:bg-accent/50"
              data-testid={`conversation-row-${conv.thread_id}`}
            >
              <TableCell className="text-sm font-mono">
                <Link
                  href={`${basePath}/${conv.thread_id}`}
                  data-testid={`conversation-link-${conv.thread_id}`}
                  className="block underline-offset-2 hover:underline"
                >
                  {conv.thread_id.slice(0, 8)}…
                </Link>
              </TableCell>
              <TableCell className="max-w-[280px] text-sm text-muted-foreground">
                <Link href={`${basePath}/${conv.thread_id}`} className="block">
                  {truncate(conv.last_message ?? '')}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`${basePath}/${conv.thread_id}`} className="block">
                  <AgentBadge agentName={conv.agent_name} />
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`${basePath}/${conv.thread_id}`} className="block">
                  <StatusBadge status={conv.status} variant={statusVariant(conv.status)} />
                </Link>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                <Link href={`${basePath}/${conv.thread_id}`} className="block">
                  {formatDate(conv.updated_at)}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
