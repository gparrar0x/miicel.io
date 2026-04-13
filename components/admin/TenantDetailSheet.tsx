'use client'

import { LayoutDashboard, Store, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { getCellStateFromFlag } from './FlagToggleCell'

interface Tenant {
  id: number
  slug: string
  name: string
  logo: string | null
  status: string
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

interface TenantDetailSheetProps {
  isOpen: boolean
  tenant: Tenant | null
  flags: FeatureFlag[]
  onClose: () => void
  onToggleFlag: (key: string, tenantId: number, enabled: boolean) => void
}

export function TenantDetailSheet({
  isOpen,
  tenant,
  flags,
  onClose,
  onToggleFlag,
}: TenantDetailSheetProps) {
  if (!tenant) return null

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        data-testid="tenant-detail-sheet"
        side="right"
        className="w-[384px] p-0 flex flex-col overflow-y-auto"
      >
        {/* Header */}
        <SheetHeader
          data-testid="tenant-sheet-header"
          className="flex flex-row items-center gap-3 bg-secondary border-b border-border px-4 py-4"
        >
          {tenant.logo ? (
            <img
              src={tenant.logo}
              alt={tenant.name}
              className="h-8 w-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-border text-sm font-semibold text-foreground">
              {tenant.name.charAt(0).toUpperCase()}
            </div>
          )}
          <SheetTitle className="text-base font-semibold flex-1 text-left">
            {tenant.name}
          </SheetTitle>
          <button
            type="button"
            data-testid="tenant-sheet-close-btn"
            onClick={onClose}
            aria-label="Close sheet"
            className="rounded-sm p-1 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" />
          </button>
        </SheetHeader>

        {/* Metadata */}
        <div
          data-testid="tenant-sheet-metadata"
          className="border-b border-border px-4 py-3 space-y-1"
        >
          <p className="text-[13px] text-muted-foreground">
            <span className="font-medium text-foreground">Slug:</span> /{tenant.slug}
          </p>
          <p className="text-[13px] text-muted-foreground">
            <span className="font-medium text-foreground">Template:</span>{' '}
            {tenant.template.charAt(0).toUpperCase() + tenant.template.slice(1)}
          </p>
          <p className="text-[13px] text-muted-foreground">
            <span className="font-medium text-foreground">Status:</span> {tenant.status}
          </p>
        </div>

        {/* Quick links */}
        <div
          data-testid="tenant-sheet-quick-links"
          className="border-b border-border px-4 py-3 flex flex-col gap-2"
        >
          <Button variant="outline" className="w-full justify-start gap-2" asChild>
            <Link href={`/es/${tenant.slug}/dashboard`} target="_blank">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button variant="default" className="w-full justify-start gap-2" asChild>
            <Link href={`/es/${tenant.slug}`} target="_blank">
              <Store className="h-4 w-4" />
              Tienda
            </Link>
          </Button>
        </div>

        {/* Flags list */}
        <div className="flex-1 px-4 py-3">
          <p className="mb-3 text-sm font-semibold text-foreground">Feature Flags</p>
          <div data-testid="tenant-sheet-flags" className="space-y-0 divide-y divide-border">
            {flags.map((flag) => {
              const cellState = getCellStateFromFlag(flag, tenant)
              const isInteractive = cellState !== 'inherited' && cellState !== 'global'
              const isChecked = cellState === 'enabled'

              return (
                <div
                  key={flag.key}
                  data-testid={`flag-list-item--${flag.key}`}
                  className="flex items-start justify-between py-3 gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{flag.key}</p>
                    {flag.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {flag.description}
                      </p>
                    )}
                    <div className="mt-1">
                      {cellState === 'inherited' && (
                        <span className="rounded-sm bg-[#f59e0b]/20 px-1.5 py-0.5 text-[10px] font-medium text-[#b45309]">
                          template
                        </span>
                      )}
                      {cellState === 'global' && (
                        <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          global
                        </span>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={isChecked}
                    onCheckedChange={
                      isInteractive
                        ? (checked) => onToggleFlag(flag.key, tenant.id, checked)
                        : undefined
                    }
                    disabled={!isInteractive}
                    aria-label={`Toggle ${flag.key}`}
                    className={isChecked ? '[&[data-state=checked]]:bg-[#10b981]' : ''}
                  />
                </div>
              )
            })}
            {flags.length === 0 && (
              <p className="py-4 text-sm text-muted-foreground text-center">No flags available.</p>
            )}
          </div>
        </div>

        {/* Audit log placeholder */}
        <div data-testid="tenant-sheet-audit-log" className="border-t border-border px-4 py-3">
          <p className="mb-2 text-sm font-semibold text-foreground">Recent Changes</p>
          <p className="text-xs text-muted-foreground">No recent changes recorded.</p>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
            data-testid="tenant-sheet-done-btn"
          >
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
