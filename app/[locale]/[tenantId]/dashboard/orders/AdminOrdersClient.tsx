"use client"

import { useState } from "react"
import { OrderResponse } from "@/lib/schemas/order"
import { OrdersTable } from "@/components/OrdersTable"
import { KitchenDisplayOrders } from "@/components/KitchenDisplayOrders"
import { OrderDetailModal } from "@/components/OrderDetailModal"
import { AdminSidebar } from "@/components/AdminSidebar"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Monitor, Smartphone } from "lucide-react"
import { useTranslations } from "next-intl"
import { DashboardHeader } from "@/components/ui/dashboard-header"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"

interface AdminOrdersClientProps {
    initialOrders: OrderResponse[]
    tenantId: number
    tenantSlug: string
    tenantName: string
}

export function AdminOrdersClient({
    initialOrders,
    tenantId,
    tenantSlug,
    tenantName
}: AdminOrdersClientProps) {
    const [orders, setOrders] = useState<OrderResponse[]>(initialOrders)
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null)
    const [viewMode, setViewMode] = useState<'kitchen' | 'table'>('kitchen')
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
                body: JSON.stringify({ status: newStatus })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to update status')
            }

            const { order: updated } = await res.json()

            setOrders(prev =>
                prev.map(o => o.id === orderId ? updated : o)
            )

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

        const items = order.items.map(item => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.unit_price.toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.quantity * item.unit_price).toFixed(2)}</td>
            </tr>
        `).join('')

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
                    ${order.customer ? `
                        <p><strong>${t('customer')}:</strong> ${order.customer.name}</p>
                        ${order.customer.email ? `<p><strong>Email:</strong> ${order.customer.email}</p>` : ''}
                        ${order.customer.phone ? `<p><strong>Phone:</strong> ${order.customer.phone}</p>` : ''}
                    ` : ''}
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
        <>
            <AdminSidebar tenant={tenantSlug} tenantName={tenantName} />
            <div className="lg:pl-mii-sidebar min-h-screen bg-mii-gray-50">
                <DashboardHeader
                  title={t('title')}
                  subtitle={viewMode === 'kitchen' ? t('subtitleKitchen') : t('subtitleTable')}
                  actions={
                    <div className="flex gap-2 bg-white rounded-[8px] p-1 shadow-mii border border-mii-gray-200">
                      <Button
                        variant={viewMode === 'kitchen' ? 'primary' : 'secondary'}
                        size="sm"
                        data-testid="btn-kitchen-view"
                        className="gap-2"
                        onClick={() => setViewMode('kitchen')}
                      >
                        <Smartphone className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('kitchenView')}</span>
                      </Button>
                      <Button
                        variant={viewMode === 'table' ? 'primary' : 'secondary'}
                        size="sm"
                        data-testid="btn-table-view"
                        className="gap-2"
                        onClick={() => setViewMode('table')}
                      >
                        <Monitor className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('tableView')}</span>
                      </Button>
                    </div>
                  }
                />
                <Container className="py-8 space-y-6">
                    {viewMode === 'kitchen' ? (
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

                    {selectedOrder && (
                        <OrderDetailModal
                            order={selectedOrder}
                            onClose={() => setSelectedOrder(null)}
                            onStatusUpdate={handleStatusUpdate}
                            onPrint={handlePrint}
                        />
                    )}
                </Container>
            </div>
        </>
    )
}
