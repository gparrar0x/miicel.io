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

            toast.success('Order status updated')
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
            toast.error('Please allow popups to print invoices')
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
                <title>Invoice #${order.id}</title>
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
                <h1>Invoice #${order.id}</h1>
                <div class="info">
                    <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                    ${order.customer ? `
                        <p><strong>Customer:</strong> ${order.customer.name}</p>
                        ${order.customer.email ? `<p><strong>Email:</strong> ${order.customer.email}</p>` : ''}
                        ${order.customer.phone ? `<p><strong>Phone:</strong> ${order.customer.phone}</p>` : ''}
                    ` : ''}
                    <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
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
                ${order.notes ? `<p style="margin-top: 20px;"><strong>Notes:</strong> ${order.notes}</p>` : ''}
            </body>
            </html>
        `)
        printWindow.document.close()
        printWindow.print()
    }

    return (
        <>
            <AdminSidebar tenant={tenantSlug} tenantName={tenantName} />
            <div className="lg:pl-64 min-h-screen bg-gray-50">
                <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 mt-16 lg:mt-0">
                    {/* Header with View Toggle */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Orders</h1>
                            <p className="text-gray-500 mt-2">
                                {viewMode === 'kitchen' ? 'Kitchen Display System' : 'View and manage customer orders'}
                            </p>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border">
                            <button
                                onClick={() => setViewMode('kitchen')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === 'kitchen'
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                data-testid="btn-kitchen-view"
                            >
                                <Smartphone className="w-4 h-4" />
                                <span className="hidden sm:inline">Kitchen</span>
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === 'table'
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                data-testid="btn-table-view"
                            >
                                <Monitor className="w-4 h-4" />
                                <span className="hidden sm:inline">Table</span>
                            </button>
                        </div>
                    </div>

                    {/* Conditional View */}
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

                    {/* Order Detail Modal */}
                    {selectedOrder && (
                        <OrderDetailModal
                            order={selectedOrder}
                            onClose={() => setSelectedOrder(null)}
                            onStatusUpdate={handleStatusUpdate}
                            onPrint={handlePrint}
                        />
                    )}
                </main>
            </div>
        </>
    )
}
