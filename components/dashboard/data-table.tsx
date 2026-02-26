'use client'

import type React from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
}

export function DataTable<T extends Record<string, unknown>>({ data, columns }: DataTableProps<T>) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary hover:bg-secondary">
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index} className="hover:bg-accent/50">
              {columns.map((column) => (
                <TableCell key={String(column.key)} className="text-sm">
                  {column.render ? column.render(item) : String(item[column.key as keyof T] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// Status badge component for consistency
export function StatusBadge({
  status,
  variant,
}: {
  status: string
  variant: 'default' | 'secondary' | 'outline'
}) {
  return (
    <Badge
      variant={variant}
      className={cn(
        'font-medium',
        variant === 'default' && 'bg-foreground text-background',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground',
        variant === 'outline' && 'border-border text-foreground',
      )}
    >
      {status}
    </Badge>
  )
}
