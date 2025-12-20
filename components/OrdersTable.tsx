"use client"

import { useState } from "react"
import { OrderResponse } from "@/lib/schemas/order"
import { Eye, Printer, Search } from "lucide-react"
import { useTranslations } from "next-intl"

interface OrdersTableProps {
    orders: OrderResponse[]
    onViewOrder: (order: OrderResponse) => void
    onStatusUpdate: (orderId: number, status: string) => void
    onPrint: (order: OrderResponse) => void
}

const statusColors = {
    pending: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
    paid: "bg-blue-50 text-blue-700 ring-blue-600/20",
    preparing: "bg-purple-50 text-purple-700 ring-purple-600/20",
    ready: "bg-green-50 text-green-700 ring-green-600/20",
    delivered: "bg-gray-50 text-gray-700 ring-gray-600/20",
    cancelled: "bg-red-50 text-red-700 ring-red-600/20"
}

export function OrdersTable({ orders, onViewOrder, onStatusUpdate, onPrint }: OrdersTableProps) {
    const t = useTranslations('Orders')
    const tCommon = useTranslations('Common')

    const statusOptions = [
        { value: 'pending', label: t('statuses.pending') },
        { value: 'paid', label: t('statuses.paid') },
        { value: 'preparing', label: t('statuses.preparing') },
        { value: 'ready', label: t('statuses.ready') },
        { value: 'delivered', label: t('statuses.delivered') },
        { value: 'cancelled', label: t('statuses.cancelled') }
    ]

    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [dateFrom, setDateFrom] = useState("")
    const [dateTo, setDateTo] = useState("")

    const filteredOrders = orders.filter((order) => {
        const matchesSearch = !searchTerm ||
            order.id.toString().includes(searchTerm) ||
            order.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === "ALL" || order.status === statusFilter

        const orderDate = new Date(order.created_at).toISOString().split('T')[0]
        const matchesDateFrom = !dateFrom || orderDate >= dateFrom
        const matchesDateTo = !dateTo || orderDate <= dateTo

        return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo
    })

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex flex-wrap items-center gap-2 w-full">
                    <div className="relative flex-1 sm:w-64 min-w-[200px]">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <input
                            data-testid="orders-search-input"
                            placeholder={t('searchPlaceholder')}
                            className="pl-8 h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF6B35] text-[#1A1A1A]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        data-testid="orders-status-filter"
                        className="h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF6B35] text-[#1A1A1A]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">{t('allStatus')}</option>
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <input
                        data-testid="orders-date-from"
                        type="date"
                        className="h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF6B35] text-[#1A1A1A]"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        placeholder={tCommon('from')}
                    />
                    <input
                        data-testid="orders-date-to"
                        type="date"
                        className="h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF6B35] text-[#1A1A1A]"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        placeholder={tCommon('to')}
                    />
                </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600">
                {t('showing', { count: filteredOrders.length, total: orders.length })}
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border bg-background overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left" data-testid="orders-table">
                        <thead className="bg-secondary">
                            <tr>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('orderId')}</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('date')}</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('customer')}</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">{t('total')}</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">{t('status')}</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">{tCommon('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        {t('noOrders')}
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-accent/50 transition-colors"
                                        data-testid={`order-row-${order.id}`}
                                    >
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            #{order.id}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {new Date(order.created_at).toLocaleDateString()}
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(order.created_at).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            {order.customer ? (
                                                <>
                                                    <div className="font-medium text-foreground">
                                                        {order.customer.name}
                                                    </div>
                                                    {order.customer.email && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {order.customer.email}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-gray-400 text-sm">{t('noCustomer')}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            ${order.total.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                                    statusColors[order.status as keyof typeof statusColors] || statusColors.pending
                                                }`}
                                                data-testid={`order-status-badge-${order.id}`}
                                            >
                                                {t(`statuses.${order.status}`)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => onViewOrder(order)}
                                                    className="p-2 hover:bg-gray-100 rounded-md text-gray-600 hover:text-blue-600 transition-colors"
                                                    title={t('viewDetails')}
                                                    data-testid={`view-order-${order.id}`}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => onPrint(order)}
                                                    className="p-2 hover:bg-gray-100 rounded-md text-gray-600 hover:text-green-600 transition-colors"
                                                    title={t('printInvoice')}
                                                    data-testid={`print-order-${order.id}`}
                                                >
                                                    <Printer className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
