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
      testId: 'stats-card-total-works',
    },
    {
      label: 'Ubicaciones Activas',
      value: overview.active_locations,
      icon: MapPin,
      testId: 'stats-card-active-locations',
    },
    {
      label: 'En Galería',
      value: overview.works_in_gallery,
      icon: Package,
      testId: 'stats-card-in-gallery',
    },
    {
      label: 'Vendidas Este Mes',
      value: overview.works_sold_this_month,
      icon: TrendingUp,
      testId: 'stats-card-sold-month',
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
            className="bg-white border border-gray-200 rounded-lg p-4"
            data-testid={stat.testId}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="h-5 w-5 text-gray-600" />
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold">Ingresos Este Mes</h3>
          </div>
          {revenueGrowth !== 0 && (
            <span
              className={`text-sm ${
                revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {revenueGrowth > 0 ? '+' : ''}
              {revenueGrowth.toFixed(1)}%
            </span>
          )}
        </div>
        <p className="text-3xl font-bold">${overview.revenue_this_month.toLocaleString()}</p>
        <p className="text-sm text-gray-600 mt-1">
          Mes anterior: ${overview.revenue_last_month.toLocaleString()}
        </p>
      </div>

      {/* Top Location */}
      {overview.top_location_by_sales && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Mejor Ubicación del Mes</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{overview.top_location_by_sales.location_name}</p>
              <p className="text-sm text-gray-600">
                ${overview.top_location_by_sales.revenue.toLocaleString()} en ventas
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
      )}

      {/* Alert: Longest in Gallery */}
      {overview.longest_in_gallery && overview.longest_in_gallery.days > 90 && (
        <div
          className="bg-amber-50 border border-amber-200 rounded-lg p-6"
          data-testid={`alert-item-${overview.longest_in_gallery.work_id}`}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900">Obra con Tiempo Prolongado</h4>
              <p className="text-sm text-amber-800 mt-1">
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
