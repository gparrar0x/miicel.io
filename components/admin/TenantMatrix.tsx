'use client'

import { LayoutDashboard, Store } from 'lucide-react'
import Link from 'next/link'
import { Fragment, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { FLAG_CATEGORY_ORDER, type FlagCategory, getFlagCategory } from '@/lib/flag-categories'
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
  const [templateFilter, setTemplateFilter] = useState<TemplateFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all')
  const [selectedTenants, setSelectedTenants] = useState<Set<number>>(new Set())
  const [sheetTenant, setSheetTenant] = useState<Tenant | null>(null)
  const [loadingCells, setLoadingCells] = useState<Set<string>>(new Set())

  const templates = useMemo(() => [...new Set(tenants.map((t) => t.template))].sort(), [tenants])

  const filteredTenants = useMemo(
    () =>
      templateFilter === 'all' ? tenants : tenants.filter((t) => t.template === templateFilter),
    [tenants, templateFilter],
  )

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

  // Group filtered flags by category, preserving FLAG_CATEGORY_ORDER.
  const groupedFlags = useMemo(() => {
    const groups: { category: FlagCategory; flags: FeatureFlag[] }[] = []
    const unassigned = new Set(filteredFlags)
    for (const category of FLAG_CATEGORY_ORDER) {
      const flagsInCategory = filteredFlags.filter((f) => getFlagCategory(f.key) === category)
      if (flagsInCategory.length > 0) {
        groups.push({ category, flags: flagsInCategory })
        for (const f of flagsInCategory) unassigned.delete(f)
      }
    }
    // Defensive: any flag not matched by the order (shouldn't happen since 'Other' is in the order)
    if (unassigned.size > 0) {
      groups.push({ category: 'Other', flags: Array.from(unassigned) })
    }
    return groups
  }, [filteredFlags])

  // Flat ordered list of flags — used to render cells in the same order as the header.
  const orderedFlags = useMemo(() => groupedFlags.flatMap((g) => g.flags), [groupedFlags])

  // Set of flag keys that are the FIRST of their category (used to draw a left divider).
  const categoryStartKeys = useMemo(() => {
    const s = new Set<string>()
    for (const g of groupedFlags) {
      if (g.flags[0]) s.add(g.flags[0].key)
    }
    return s
  }, [groupedFlags])

  function toggleTenantSelect(tenantId: number) {
    setSelectedTenants((prev) => {
      const next = new Set(prev)
      if (next.has(tenantId)) next.delete(tenantId)
      else next.add(tenantId)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedTenants.size === filteredTenants.length) {
      setSelectedTenants(new Set())
    } else {
      setSelectedTenants(new Set(filteredTenants.map((t) => t.id)))
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
    const promises = Array.from(selectedTenants).flatMap((tenantId) => {
      const tenant = tenants.find((t) => t.id === tenantId)
      if (!tenant) return []
      return orderedFlags.map((flag) => {
        const state = getCellStateFromFlag(flag, tenant)
        if (state === 'inherited' || state === 'global') return Promise.resolve()
        return handleToggle(flag.key, tenantId, enabled ? 'disabled' : 'enabled')
      })
    })
    await Promise.allSettled(promises)
    setSelectedTenants(new Set())
  }

  const allSelected = filteredTenants.length > 0 && selectedTenants.size === filteredTenants.length

  // Group tenants by template for section headers
  const tenantsByTemplate = useMemo(() => {
    const groups: { template: string; tenants: Tenant[] }[] = []
    const seen = new Set<string>()
    for (const t of filteredTenants) {
      if (!seen.has(t.template)) {
        seen.add(t.template)
        groups.push({ template: t.template, tenants: [] })
      }
      groups.find((g) => g.template === t.template)!.tenants.push(t)
    }
    return groups
  }, [filteredTenants])

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

      {filteredTenants.length > 0 && filteredFlags.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full border-collapse text-sm">
            {/* Header: 2 rows — category groups + flag names */}
            <thead>
              {/* Row 1: Category group headers (colSpan across flags in each category) */}
              <tr>
                <th
                  rowSpan={2}
                  className="sticky left-0 top-0 z-[11] border-b border-r border-border bg-secondary px-3 py-3 text-left align-middle"
                  style={{ minWidth: '260px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      data-testid="select-all-checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all tenants"
                      className="h-4 w-4 rounded border-border accent-foreground cursor-pointer"
                    />
                    <span className="font-medium text-foreground text-xs uppercase tracking-wider">
                      Tenant
                    </span>
                  </div>
                </th>
                {groupedFlags.map((group) => (
                  <th
                    key={`cat-${group.category}`}
                    colSpan={group.flags.length}
                    data-testid={`flag-category-header--${group.category}`}
                    className="sticky top-0 z-[10] border-b border-r-2 border-b-border border-r-border bg-secondary/80 px-3 py-2 text-center align-middle"
                    style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                  >
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {group.category}
                    </span>
                  </th>
                ))}
              </tr>
              {/* Row 2: Individual flag name headers */}
              <tr>
                {orderedFlags.map((flag) => {
                  const startsCategory = categoryStartKeys.has(flag.key)
                  return (
                    <th
                      key={flag.key}
                      data-testid={`flag-column-header--${flag.key}`}
                      className={`sticky z-[10] border-b border-r border-border bg-secondary px-3 py-3 text-center align-middle ${startsCategory ? 'border-l-2 border-l-border' : ''}`}
                      style={{
                        minWidth: '100px',
                        maxWidth: '130px',
                        top: '41px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      }}
                      title={flag.description || flag.key}
                    >
                      <span className="text-xs font-semibold text-foreground leading-tight">
                        {flag.key.replace(/_/g, ' ')}
                      </span>
                    </th>
                  )
                })}
              </tr>
            </thead>

            <tbody>
              {tenantsByTemplate.map((group) => (
                <Fragment key={`tpl-group-${group.template}`}>
                  {/* Template section header */}
                  {templateFilter === 'all' && tenantsByTemplate.length > 1 && (
                    <tr>
                      <td
                        colSpan={orderedFlags.length + 1}
                        className="bg-secondary/50 px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border"
                      >
                        {group.template}
                        <span className="ml-2 font-normal">{group.tenants.length}</span>
                      </td>
                    </tr>
                  )}

                  {group.tenants.map((tenant, rowIdx) => {
                    const isSelected = selectedTenants.has(tenant.id)
                    const isEven = rowIdx % 2 === 1

                    return (
                      <tr
                        key={tenant.id}
                        data-testid={`tenant-row--${tenant.slug}`}
                        className={isEven ? 'bg-secondary/30' : 'bg-background'}
                      >
                        {/* Tenant info: sticky left */}
                        <td
                          data-testid={`tenant-row-header--${tenant.slug}`}
                          className="sticky left-0 z-[2] border-b border-r border-border px-3 py-2 align-middle"
                          style={{
                            background: isEven
                              ? 'hsl(var(--secondary) / 0.5)'
                              : 'var(--background)',
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              data-testid={`tenant-row-select--${tenant.slug}`}
                              checked={isSelected}
                              onChange={() => toggleTenantSelect(tenant.id)}
                              aria-label={`Select ${tenant.name}`}
                              className="h-4 w-4 shrink-0 rounded border-border accent-foreground cursor-pointer"
                            />
                            {tenant.logo ? (
                              <img
                                src={tenant.logo}
                                alt={tenant.name}
                                className="h-8 w-8 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-border text-xs font-semibold text-foreground">
                                {tenant.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => setSheetTenant(tenant)}
                                className="font-medium text-foreground text-sm leading-tight truncate hover:underline text-left"
                                title={tenant.name}
                              >
                                {tenant.name}
                              </button>
                              <p className="text-xs text-muted-foreground">/{tenant.slug}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Link
                                href={`/es/${tenant.slug}/dashboard`}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                aria-label={`${tenant.name} dashboard`}
                                data-testid={`tenant-dashboard-link-${tenant.slug}`}
                              >
                                <LayoutDashboard className="h-3.5 w-3.5" />
                              </Link>
                              <Link
                                href={`/es/${tenant.slug}`}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                aria-label={`${tenant.name} store`}
                                data-testid={`tenant-store-link-${tenant.slug}`}
                              >
                                <Store className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </div>
                        </td>

                        {/* Flag toggle cells — iterated in category order */}
                        {orderedFlags.map((flag) => {
                          const cellKey = `${flag.key}-${tenant.id}`
                          const isLoading = loadingCells.has(cellKey)
                          const baseState = getCellStateFromFlag(flag, tenant)
                          const state: CellState = isLoading ? 'loading' : baseState
                          const startsCategory = categoryStartKeys.has(flag.key)

                          return (
                            <FlagToggleCell
                              key={cellKey}
                              flag={flag}
                              tenant={tenant}
                              state={state}
                              onToggle={() => handleToggle(flag.key, tenant.id, baseState)}
                              startsCategory={startsCategory}
                            />
                          )
                        })}
                      </tr>
                    )
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk actions bar */}
      {selectedTenants.size > 0 && (
        <div
          data-testid="bulk-actions-bar"
          className="fixed bottom-4 right-4 z-40 flex items-center gap-3 rounded-lg border border-border bg-secondary px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300"
          style={{ animation: 'slideUp 200ms cubic-bezier(0.785,0.135,0.15,0.86)' }}
        >
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {selectedTenants.size} tenant{selectedTenants.size !== 1 ? 's' : ''} selected
          </span>
          <Button
            data-testid="bulk-enable-btn"
            size="sm"
            variant="default"
            onClick={() => bulkToggle(true)}
            className="h-8 text-xs"
          >
            Enable All Flags
          </Button>
          <Button
            data-testid="bulk-disable-btn"
            size="sm"
            variant="outline"
            onClick={() => bulkToggle(false)}
            className="h-8 text-xs"
          >
            Disable All Flags
          </Button>
          <button
            type="button"
            data-testid="bulk-clear-btn"
            onClick={() => setSelectedTenants(new Set())}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        </div>
      )}

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
