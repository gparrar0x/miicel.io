'use client'

import { LayoutDashboard, Store } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { type CellState, FlagToggleCell, getCellStateFromFlag } from './FlagToggleCell'
import { MatrixControls, type ScopeFilter, type TemplateFilter } from './MatrixControls'
import { TenantDetailSheet } from './TenantDetailSheet'

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

interface TenantMatrixProps {
  tenants: Tenant[]
  flags: FeatureFlag[]
  onToggleFlag: (key: string, tenantId: number, enabled: boolean) => Promise<void>
}

export function TenantMatrix({ tenants, flags, onToggleFlag }: TenantMatrixProps) {
  // Controls
  const [templateFilter, setTemplateFilter] = useState<TemplateFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all')

  // Selection
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  // Sheet
  const [sheetTenant, setSheetTenant] = useState<Tenant | null>(null)

  // Loading states per cell: `${flagKey}-${tenantId}`
  const [loadingCells, setLoadingCells] = useState<Set<string>>(new Set())

  // Derive unique templates
  const templates = useMemo(() => [...new Set(tenants.map((t) => t.template))].sort(), [tenants])

  // Filtered tenants
  const filteredTenants = useMemo(
    () =>
      templateFilter === 'all' ? tenants : tenants.filter((t) => t.template === templateFilter),
    [tenants, templateFilter],
  )

  // Filtered flags
  const filteredFlags = useMemo(() => {
    let result = flags

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (f) =>
          f.key.toLowerCase().includes(q) || (f.description?.toLowerCase().includes(q) ?? false),
      )
    }

    if (scopeFilter !== 'all') {
      result = result.filter((flag) => {
        const isGlobal =
          flag.enabled &&
          !flag.rules?.tenants?.length &&
          !flag.rules?.templates?.length &&
          !flag.rules?.users?.length &&
          flag.rules?.percentage == null
        const hasTemplateSetting = (flag.rules?.templates?.length ?? 0) > 0
        const hasTenantSetting = (flag.rules?.tenants?.length ?? 0) > 0

        if (scopeFilter === 'global') return isGlobal
        if (scopeFilter === 'template') return hasTemplateSetting
        if (scopeFilter === 'tenant') return hasTenantSetting
        return true
      })
    }

    return result
  }, [flags, searchQuery, scopeFilter])

  // Handlers
  function toggleRowSelect(flagKey: string) {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(flagKey)) {
        next.delete(flagKey)
      } else {
        next.add(flagKey)
      }
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedRows.size === filteredFlags.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(filteredFlags.map((f) => f.key)))
    }
  }

  async function handleToggle(flagKey: string, tenantId: number, currentState: CellState) {
    if (currentState === 'inherited' || currentState === 'global' || currentState === 'loading')
      return
    const cellKey = `${flagKey}-${tenantId}`
    const newEnabled = currentState !== 'enabled'
    setLoadingCells((prev) => new Set(prev).add(cellKey))
    try {
      await onToggleFlag(flagKey, tenantId, newEnabled)
    } finally {
      setLoadingCells((prev) => {
        const next = new Set(prev)
        next.delete(cellKey)
        return next
      })
    }
  }

  async function bulkToggle(enabled: boolean) {
    const promises = Array.from(selectedRows).flatMap((flagKey) =>
      filteredTenants.map((tenant) => {
        const state = getCellStateFromFlag(flags.find((f) => f.key === flagKey)!, tenant)
        if (state === 'inherited' || state === 'global') return Promise.resolve()
        return handleToggle(flagKey, tenant.id, enabled ? 'disabled' : 'enabled')
      }),
    )
    await Promise.allSettled(promises)
    setSelectedRows(new Set())
  }

  const allRowsSelected = filteredFlags.length > 0 && selectedRows.size === filteredFlags.length

  return (
    <div className="flex flex-col gap-0">
      <MatrixControls
        templates={templates}
        templateFilter={templateFilter}
        onTemplateChange={setTemplateFilter}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        scopeFilter={scopeFilter}
        onScopeChange={setScopeFilter}
      />

      {/* Empty states */}
      {filteredTenants.length === 0 && (
        <div className="flex items-center justify-center rounded-md border border-border py-16">
          <p className="text-sm text-muted-foreground">No tenants for this template.</p>
        </div>
      )}

      {filteredTenants.length > 0 && filteredFlags.length === 0 && (
        <div className="flex items-center justify-center rounded-md border border-border py-16">
          <p className="text-sm text-muted-foreground">No flags match your filters.</p>
        </div>
      )}

      {/* Matrix */}
      {filteredTenants.length > 0 && filteredFlags.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-border">
          <table
            className="border-collapse text-sm"
            style={{ tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }}
          >
            {/* Sticky header */}
            <thead>
              <tr>
                {/* Corner: sticky top+left */}
                <th
                  className="sticky left-0 top-0 z-[11] border-b border-r border-border bg-secondary px-4 py-3 text-left align-middle"
                  style={{ minWidth: '220px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      data-testid="select-all-checkbox"
                      checked={allRowsSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all flags"
                      className="h-4 w-4 rounded border-border accent-foreground cursor-pointer"
                    />
                    <span className="font-medium text-foreground text-xs uppercase tracking-wider">
                      Feature Flag
                    </span>
                  </div>
                </th>

                {/* Tenant column headers */}
                {filteredTenants.map((tenant) => (
                  <th
                    key={tenant.id}
                    data-testid={`tenant-column-header--${tenant.slug}`}
                    onClick={() => setSheetTenant(tenant)}
                    className="sticky top-0 z-[10] border-b border-r border-border bg-secondary px-3 py-3 text-center align-middle cursor-pointer hover:bg-secondary/70 transition-colors"
                    style={{ minWidth: '120px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      {tenant.logo ? (
                        <img
                          src={tenant.logo}
                          alt={tenant.name}
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-border text-xs font-semibold text-foreground">
                          {tenant.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-semibold text-foreground leading-tight text-center line-clamp-2 max-w-[100px]">
                        {tenant.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/es/${tenant.slug}/dashboard`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={`${tenant.name} dashboard`}
                          data-testid={`tenant-dashboard-link-${tenant.slug}`}
                        >
                          <LayoutDashboard className="h-3 w-3" />
                        </Link>
                        <Link
                          href={`/es/${tenant.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={`${tenant.name} store`}
                          data-testid={`tenant-store-link-${tenant.slug}`}
                        >
                          <Store className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {filteredFlags.map((flag, rowIdx) => {
                const isSelected = selectedRows.has(flag.key)
                const isEven = rowIdx % 2 === 1

                return (
                  <tr
                    key={flag.key}
                    data-testid={`flag-row--${flag.key}`}
                    className={isEven ? 'bg-secondary/30' : 'bg-background'}
                  >
                    {/* Row header: sticky left */}
                    <td
                      data-testid={`flag-row-header--${flag.key}`}
                      className="sticky left-0 z-[2] border-b border-r border-border px-4 py-2 align-middle"
                      style={{
                        background: isEven ? 'hsl(var(--secondary) / 0.5)' : 'var(--background)',
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          data-testid={`flag-row-select--${flag.key}`}
                          checked={isSelected}
                          onChange={() => toggleRowSelect(flag.key)}
                          aria-label={`Select flag ${flag.key}`}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-foreground cursor-pointer"
                        />
                        <div className="min-w-0">
                          <p
                            className="font-medium text-foreground text-sm leading-tight truncate"
                            title={flag.key}
                          >
                            {flag.key}
                          </p>
                          {flag.description && (
                            <p
                              className="text-xs text-muted-foreground mt-0.5 line-clamp-1"
                              title={flag.description}
                            >
                              {flag.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Toggle cells */}
                    {filteredTenants.map((tenant) => {
                      const cellKey = `${flag.key}-${tenant.id}`
                      const isLoading = loadingCells.has(cellKey)
                      const baseState = getCellStateFromFlag(flag, tenant)
                      const state: CellState = isLoading ? 'loading' : baseState

                      return (
                        <FlagToggleCell
                          key={cellKey}
                          flag={flag}
                          tenant={tenant}
                          state={state}
                          onToggle={() => handleToggle(flag.key, tenant.id, baseState)}
                        />
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk actions bar */}
      {selectedRows.size > 0 && (
        <div
          data-testid="bulk-actions-bar"
          className="fixed bottom-4 right-4 z-40 flex items-center gap-3 rounded-lg border border-border bg-secondary px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300"
          style={{ animation: 'slideUp 200ms cubic-bezier(0.785,0.135,0.15,0.86)' }}
        >
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {selectedRows.size} row{selectedRows.size !== 1 ? 's' : ''} selected
          </span>
          <Button
            data-testid="bulk-enable-btn"
            size="sm"
            variant="default"
            onClick={() => bulkToggle(true)}
            className="h-8 text-xs"
          >
            Enable All
          </Button>
          <Button
            data-testid="bulk-disable-btn"
            size="sm"
            variant="outline"
            onClick={() => bulkToggle(false)}
            className="h-8 text-xs"
          >
            Disable All
          </Button>
          <button
            type="button"
            data-testid="bulk-clear-btn"
            onClick={() => setSelectedRows(new Set())}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Tenant detail sheet */}
      <TenantDetailSheet
        isOpen={sheetTenant !== null}
        tenant={sheetTenant}
        flags={flags}
        onClose={() => setSheetTenant(null)}
        onToggleFlag={onToggleFlag}
      />

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
