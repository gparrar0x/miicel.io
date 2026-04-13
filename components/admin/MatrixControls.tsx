'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type ScopeFilter = 'all' | 'tenant' | 'template' | 'global'
export type TemplateFilter = 'all' | string

interface MatrixControlsProps {
  templates: string[]
  templateFilter: TemplateFilter
  onTemplateChange: (t: TemplateFilter) => void
  searchQuery: string
  onSearch: (q: string) => void
  scopeFilter: ScopeFilter
  onScopeChange: (s: ScopeFilter) => void
}

export function MatrixControls({
  templates,
  templateFilter,
  onTemplateChange,
  searchQuery,
  onSearch,
  scopeFilter,
  onScopeChange,
}: MatrixControlsProps) {
  const segments: { key: TemplateFilter; label: string }[] = [
    ...templates.map((t) => ({
      key: t as TemplateFilter,
      label: t.charAt(0).toUpperCase() + t.slice(1),
    })),
    { key: 'all', label: 'All' },
  ]

  return (
    <div className="mb-6 flex flex-col gap-3">
      {/* Template filter segments */}
      <div className="flex items-center gap-0 rounded-md border border-border overflow-hidden w-fit">
        {segments.map((seg, i) => (
          <button
            key={seg.key}
            type="button"
            data-testid={`template-filter--${seg.key}`}
            onClick={() => onTemplateChange(seg.key)}
            className={`h-9 min-w-[100px] px-4 text-sm font-medium transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              templateFilter === seg.key
                ? 'bg-foreground text-background'
                : 'bg-secondary text-foreground hover:bg-secondary/70'
            } ${i !== 0 ? 'border-l border-border' : ''}`}
          >
            {seg.label}
          </button>
        ))}
      </div>

      {/* Search + scope filter row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            data-testid="flag-search-input"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by flag name..."
            className="pl-9 pr-9 h-10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={scopeFilter} onValueChange={(v) => onScopeChange(v as ScopeFilter)}>
          <SelectTrigger data-testid="scope-filter-select" className="w-40 h-10">
            <SelectValue placeholder="All Scopes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Scopes</SelectItem>
            <SelectItem value="tenant">Tenant-Specific</SelectItem>
            <SelectItem value="template">Template-Level</SelectItem>
            <SelectItem value="global">Global</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
