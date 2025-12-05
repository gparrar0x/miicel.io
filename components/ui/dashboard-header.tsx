import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
  'data-testid'?: string
}

export function DashboardHeader({
  title,
  subtitle,
  actions,
  className,
  'data-testid': testId,
}: DashboardHeaderProps) {
  return (
    <header
      data-testid={testId || 'dashboard-header'}
      className={cn(
        'flex flex-col gap-4 border-b border-mii-gray-200 bg-white px-mii-page py-6 md:py-6 md:px-mii-page',
        className,
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-[32px] font-bold leading-tight text-mii-gray-900">{title}</h1>
          {subtitle ? (
            <p className="text-[16px] font-medium leading-6 text-mii-gray-700">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </header>
  )}
