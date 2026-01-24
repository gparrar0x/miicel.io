'use client'

import { useEffect, useState } from 'react'
import { DateRangePicker } from './DateRangePicker'
import { SummaryCards } from './SummaryCards'
import { TopProducts } from './TopProducts'
import { TopCategories } from './TopCategories'
import { PaymentMethods } from './PaymentMethods'
import { DiscountsBreakdown } from './DiscountsBreakdown'

interface DashboardMetrics {
  summary: {
    total_sales: number
    total_transactions: number
    average_ticket: number
    items_sold: number
  }
  top_products: Array<{
    rank: number
    product_name: string
    category: string
    quantity_sold: number
    revenue: number
    percentage: number
  }>
  top_categories: Array<{
    name: string
    items_sold: number
    revenue: number
    percentage: number
  }>
  payment_methods: Array<{
    method: string
    transaction_count: number
    total_amount: number
    percentage: number
  }>
  discounts: Array<{
    source: string
    usage_count: number
    total_discount_amount: number
    affected_orders: number
  }>
}

interface AnalyticsDashboardProps {
  tenantId: string
  locale: string
}

export function AnalyticsDashboard({ tenantId, locale }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  })
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/analytics/dashboard?tenant_id=${tenantId}&date_from=${dateRange.from}&date_to=${dateRange.to}`
        )

        if (!response.ok) {
          throw new Error('Failed to load metrics')
        }

        const data = await response.json()
        setMetrics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading data')
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()
  }, [tenantId, dateRange])

  const handleDateChange = (newRange: { from: string; to: string }) => {
    setDateRange(newRange)
  }

  const handleExport = (type: string) => {
    const url = `/api/analytics/export?type=${type}&tenant_id=${tenantId}&date_from=${dateRange.from}&date_to=${dateRange.to}`
    window.open(url, '_blank')
  }

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96" data-testid="analytics-dashboard">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-border border-t-foreground" />
          <p className="text-sm text-muted-foreground">Cargando métricas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96" data-testid="analytics-dashboard">
        <div className="space-y-3 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return null
  }

  return (
    <div className="space-y-6" data-testid="analytics-dashboard">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard de Ventas</h1>
          <p className="text-muted-foreground">Análisis de ventas y métricas del negocio</p>
        </div>
        <DateRangePicker value={dateRange} onChange={handleDateChange} />
      </div>

      <SummaryCards data={metrics.summary} loading={loading} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TopProducts data={metrics.top_products} onExport={() => handleExport('products')} />
        <TopCategories data={metrics.top_categories} onExport={() => handleExport('categories')} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PaymentMethods data={metrics.payment_methods} onExport={() => handleExport('payments')} />
        <DiscountsBreakdown data={metrics.discounts} onExport={() => handleExport('discounts')} />
      </div>
    </div>
  )
}
