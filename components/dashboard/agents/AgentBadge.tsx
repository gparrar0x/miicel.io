import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const AGENT_STYLES: Record<string, { label: string; className: string }> = {
  oraculo: {
    label: 'Oráculo',
    className:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  },
  pregon: {
    label: 'Pregón',
    className:
      'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  },
  micelio: {
    label: 'Micelio',
    className: 'bg-secondary text-secondary-foreground border-border',
  },
}

interface AgentBadgeProps {
  agentName: string
  className?: string
}

export function AgentBadge({ agentName, className }: AgentBadgeProps) {
  const style = AGENT_STYLES[agentName.toLowerCase()] ?? {
    label: agentName,
    className: 'bg-secondary text-secondary-foreground border-border',
  }

  return (
    <Badge
      variant="outline"
      data-testid={`agent-badge-${agentName}`}
      className={cn('text-xs font-medium', style.className, className)}
    >
      {style.label}
    </Badge>
  )
}
