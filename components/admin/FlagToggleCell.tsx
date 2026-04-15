'use client'

import { Loader2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

interface Tenant {
  id: number
  slug: string
  name: string
  template: string
}

interface FeatureFlag {
  id: number
  key: string
  description: string | null
  enabled: boolean
  rules: {
    tenants?: number[]
    templates?: string[]
    users?: string[]
    percentage?: number
    environments?: string[]
  }
}

export type CellState = 'enabled' | 'disabled' | 'inherited' | 'global' | 'loading'

interface FlagToggleCellProps {
  flag: FeatureFlag
  tenant: Tenant
  state: CellState
  onToggle: () => void
  startsCategory?: boolean
}

function getCellStateFromFlag(flag: FeatureFlag, tenant: Tenant): CellState {
  const isEnabledForTenant = flag.rules?.tenants?.includes(tenant.id) ?? false
  const isEnabledByTemplate = flag.rules?.templates?.includes(tenant.template) ?? false
  // Global = no targeting keys at all. Presence of `tenants: []` means allowlist mode,
  // currently empty, NOT global.
  const isGlobal =
    flag.enabled &&
    flag.rules?.tenants === undefined &&
    flag.rules?.templates === undefined &&
    flag.rules?.users === undefined &&
    flag.rules?.percentage == null

  if (isGlobal) return 'global'
  if (isEnabledByTemplate) return 'inherited'
  if (isEnabledForTenant) return 'enabled'
  return 'disabled'
}

export { getCellStateFromFlag }

export function FlagToggleCell({
  flag,
  tenant,
  state,
  onToggle,
  startsCategory = false,
}: FlagToggleCellProps) {
  const isInteractive = state !== 'inherited' && state !== 'global' && state !== 'loading'
  // ON if the flag is active for this tenant via ANY mechanism:
  //   'enabled'   — tenant explicitly in allowlist
  //   'inherited' — match by template rule
  //   'global'    — flag has no targeting rules
  const isChecked = state === 'enabled' || state === 'inherited' || state === 'global'

  const tooltipMap: Partial<Record<CellState, string>> = {
    inherited: `Flag enabled at template level. Disable the template flag to toggle here.`,
    global: `Flag enabled globally. Cannot be toggled per tenant.`,
  }

  const cellBg = state === 'inherited' || state === 'global' ? 'bg-secondary' : 'bg-background'

  const cursor =
    state === 'loading' ? 'cursor-wait' : !isInteractive ? 'cursor-not-allowed' : 'cursor-pointer'

  const leftBorder = startsCategory ? 'border-l-2 border-l-border' : ''

  return (
    <td
      data-testid={`flag-toggle-cell--${flag.key}-${tenant.slug}--${state}`}
      title={tooltipMap[state]}
      className={`border-b border-r border-border px-3 py-2 text-center align-middle transition-colors duration-100 ${cellBg} ${cursor} ${leftBorder} ${isInteractive ? 'hover:bg-secondary/50' : ''}`}
      style={{ minWidth: '120px' }}
    >
      {state === 'loading' ? (
        <div className="flex items-center justify-center">
          <Loader2
            data-testid={`flag-toggle-loading--${flag.key}-${tenant.slug}`}
            className="h-4 w-4 animate-spin text-foreground"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <Switch
            data-testid={`flag-toggle-switch--${flag.key}-${tenant.slug}`}
            checked={isChecked}
            onCheckedChange={isInteractive ? onToggle : undefined}
            disabled={!isInteractive}
            aria-label={`Toggle ${flag.key} for ${tenant.name}`}
            className={state === 'enabled' ? '[&[data-state=checked]]:bg-[#10b981]' : ''}
          />
          {state === 'inherited' && (
            <span className="rounded-sm bg-[#f59e0b]/20 px-1 py-0.5 text-[10px] font-medium text-[#b45309]">
              template
            </span>
          )}
          {state === 'global' && (
            <span className="rounded-sm bg-secondary px-1 py-0.5 text-[10px] font-medium text-muted-foreground">
              global
            </span>
          )}
        </div>
      )}
    </td>
  )
}
