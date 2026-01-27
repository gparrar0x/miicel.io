'use client'

/**
 * ConsignmentOverview Component
 *
 * Displays summary stats for the consignment system
 * Shows total works, locations, sales metrics
 */

import { ConsignmentOverview as OverviewType } from '@/lib/types/consignment'
import { Package, MapPin, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'

interface ConsignmentOverviewProps {
  overview: OverviewType
}

export function ConsignmentOverview({ overview }: ConsignmentOverviewProps) {
  const stats = [
    {
      label: 'Total Obras',
      value: overview.total_works,
      icon: Package,
      testId: 'consignment-stat-total_works',
    },
    {
      label: 'Ubicaciones Activas',
      value: overview.active_locations,
      icon: MapPin,
      testId: 'consignment-stat-active_locations',
    },
    {
      label: 'En Galería',
      value: overview.works_in_gallery,
      icon: Package,
      testId: 'consignment-stat-works_in_gallery',
    },
    {
      label: 'Vendidas Este Mes',
      value: overview.works_sold_this_month,
      icon: TrendingUp,
      testId: 'consignment-stat-works_sold_this_month',
    },
  ]

  const revenueGrowth =
    overview.revenue_last_month > 0
      ? ((overview.revenue_this_month - overview.revenue_last_month) /
          overview.revenue_last_month) *
        100
      : 0

  return (
    <div className="space-y-6" data-testid="consignment-overview">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.testId}
            className="bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg p-4"
            data-testid={stat.testId}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="h-5 w-5 text-[var(--color-text-secondary)]" />
              <span className="text-2xl font-bold text-[var(--color-text-primary)]">{stat.value}</span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Card */}
      <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[var(--color-text-secondary)]" />
            <h3 className="font-semibold text-[var(--color-text-primary)]">Ingresos Este Mes</h3>
          </div>
          {revenueGrowth !== 0 && (
            <span
              className={`text-sm ${
                revenueGrowth > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
              }`}
            >
              {revenueGrowth > 0 ? '+' : ''}
              {revenueGrowth.toFixed(1)}%
            </span>
          )}
        </div>
        <p className="text-3xl font-bold text-[var(--color-text-primary)]">${overview.revenue_this_month.toLocaleString()}</p>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Mes anterior: ${overview.revenue_last_month.toLocaleString()}
        </p>
      </div>

      {/* Top Location */}
      {overview.top_location_by_sales && (
        <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg p-6">
          <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">Mejor Ubicación del Mes</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[var(--color-text-primary)]">{overview.top_location_by_sales.location_name}</p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                ${overview.top_location_by_sales.revenue.toLocaleString()} en ventas
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-[var(--color-success)]" />
          </div>
        </div>
      )}

      {/* Alert: Longest in Gallery */}
      {overview.longest_in_gallery && overview.longest_in_gallery.days > 90 && (
        <div
          className="bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 rounded-lg p-6"
          data-testid={`alert-item-${overview.longest_in_gallery.work_id}`}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[var(--color-warning)] mt-0.5" />
            <div>
              <h4 className="font-semibold text-[var(--color-text-primary)]">Obra con Tiempo Prolongado</h4>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                <strong>{overview.longest_in_gallery.work_title}</strong> lleva{' '}
                {overview.longest_in_gallery.days} días en{' '}
                {overview.longest_in_gallery.location_name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
