'use client'

import { Monitor, Smartphone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { KitchenDisplayOrders } from '@/components/KitchenDisplayOrders'
import { OrderDetailModal } from '@/components/OrderDetailModal'
import { OrdersTable } from '@/components/OrdersTable'
import { Button } from '@/components/ui/button'
import type { OrderResponse } from '@/lib/schemas/order'

interface AdminOrdersClientProps {
  initialOrders: OrderResponse[]
  tenantId: number
  tenantSlug: string
  showKitchenView?: boolean // Feature flag: only gastronomy tenants
}

export function AdminOrdersClient({
  initialOrders,
  tenantId,
  tenantSlug,
  showKitchenView = false,
}: AdminOrdersClientProps) {
  const [orders, setOrders] = useState<OrderResponse[]>(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null)
  // Default to kitchen view only if enabled, otherwise table view
  const [viewMode, setViewMode] = useState<'kitchen' | 'table'>(
    showKitchenView ? 'kitchen' : 'table',
  )
  const router = useRouter()
  const t = useTranslations('Orders')

  const refreshData = () => {
    router.refresh()
  }

  const handleViewOrder = (order: OrderResponse) => {
    setSelectedOrder(order)
  }

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update status')
      }

      const { order: updated } = await res.json()

      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)))

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated)
      }

      toast.success(t('statusUpdated'))
      refreshData()
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update order status')
    }
  }

  const handlePrint = (order: OrderResponse) => {
    // Simple print implementation
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error(t('printError'))
      return
    }

    const items = order.items
      .map(
        (item) => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.unit_price.toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.quantity * item.unit_price).toFixed(2)}</td>
            </tr>
        `,
      )
      .join('')

    printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${t('invoice')} #${order.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; }
                    h1 { margin-bottom: 10px; }
                    .info { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background-color: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; }
                    .total { margin-top: 20px; text-align: right; font-size: 18px; font-weight: bold; }
                    @media print {
                        body { padding: 20px; }
                    }
                </style>
            </head>
            <body>
                <h1>${t('invoice')} #${order.id}</h1>
                <div class="info">
                    <p><strong>${t('date')}:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                    ${
                      order.customer
                        ? `
                        <p><strong>${t('customer')}:</strong> ${order.customer.name}</p>
                        ${order.customer.email ? `<p><strong>Email:</strong> ${order.customer.email}</p>` : ''}
                        ${order.customer.phone ? `<p><strong>Phone:</strong> ${order.customer.phone}</p>` : ''}
                    `
                        : ''
                    }
                    <p><strong>${t('status')}:</strong> ${order.status.toUpperCase()}</p>
                    ${order.payment_method ? `<p><strong>Payment:</strong> ${order.payment_method}</p>` : ''}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th style="text-align: center;">Quantity</th>
                            <th style="text-align: right;">Unit Price</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items}
                    </tbody>
                </table>
                <div class="total">
                    TOTAL: $${order.total.toFixed(2)}
                </div>
                ${order.notes ? `<p style="margin-top: 20px;"><strong>${t('notes')}:</strong> ${order.notes}</p>` : ''}
            </body>
            </html>
        `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('title')}</h1>
          <p className="text-muted-foreground">
            {viewMode === 'kitchen' ? t('subtitleKitchen') : t('subtitleTable')}
          </p>
        </div>

        {/* View Mode Toggle - only show if kitchen view is enabled */}
        {showKitchenView && (
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            <Button
              variant={viewMode === 'kitchen' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kitchen')}
              data-testid="btn-kitchen-view"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('kitchenView')}</span>
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              data-testid="btn-table-view"
            >
              <Monitor className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('tableView')}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Conditional View - kitchen only if enabled */}
      {showKitchenView && viewMode === 'kitchen' ? (
        <KitchenDisplayOrders
          orders={orders}
          onViewOrder={handleViewOrder}
          onStatusUpdate={handleStatusUpdate}
          onPrint={handlePrint}
          onRefresh={refreshData}
        />
      ) : (
        <OrdersTable
          orders={orders}
          onViewOrder={handleViewOrder}
          onStatusUpdate={handleStatusUpdate}
          onPrint={handlePrint}
        />
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
          onPrint={handlePrint}
        />
      )}
    </div>
  )
}
