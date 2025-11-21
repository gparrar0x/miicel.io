"use client"

import { useState } from "react"
import { OrderResponse } from "@/lib/schemas/order"
import { Eye, Printer, Search } from "lucide-react"

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

const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
]

export function OrdersTable({ orders, onViewOrder, onStatusUpdate, onPrint }: OrdersTableProps) {
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
                            placeholder="Search by ID, customer..."
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
                        <option value="ALL">All Status</option>
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
                        placeholder="From"
                    />
                    <input
                        data-testid="orders-date-to"
                        type="date"
                        className="h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF6B35] text-[#1A1A1A]"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        placeholder="To"
                    />
                </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600">
                Showing {filteredOrders.length} of {orders.length} orders
            </div>

            {/* Table */}
            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left" data-testid="orders-table">
                        <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                            <tr>
                                <th className="px-4 py-3">Order ID</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3 text-right">Total</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-gray-50 transition-colors"
                                        data-testid={`order-row-${order.id}`}
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            #{order.id}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {new Date(order.created_at).toLocaleDateString()}
                                            <p className="text-xs text-gray-500">
                                                {new Date(order.created_at).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            {order.customer ? (
                                                <>
                                                    <div className="font-medium text-gray-900">
                                                        {order.customer.name}
                                                    </div>
                                                    {order.customer.email && (
                                                        <div className="text-xs text-gray-500">
                                                            {order.customer.email}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-gray-400 text-sm">No customer</span>
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
                                                {order.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => onViewOrder(order)}
                                                    className="p-2 hover:bg-gray-100 rounded-md text-gray-600 hover:text-blue-600 transition-colors"
                                                    title="View Details"
                                                    data-testid={`view-order-${order.id}`}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => onPrint(order)}
                                                    className="p-2 hover:bg-gray-100 rounded-md text-gray-600 hover:text-green-600 transition-colors"
                                                    title="Print Invoice"
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
