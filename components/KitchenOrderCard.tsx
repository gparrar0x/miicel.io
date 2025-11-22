"use client"

import { OrderResponse } from "@/lib/schemas/order"
import { Printer, Eye, Clock, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface KitchenOrderCardProps {
    order: OrderResponse
    onViewOrder: (order: OrderResponse) => void
    onNextStatus: (orderId: number, nextStatus: string) => void
    onPrint: (order: OrderResponse) => void
}

const statusConfig = {
    pending: {
        label: 'Pending',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-900',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-500',
        next: 'paid',
        emoji: '🟡'
    },
    paid: {
        label: 'Paid',
        color: 'bg-blue-500',
        textColor: 'text-blue-900',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-500',
        next: 'preparing',
        emoji: '🔵'
    },
    preparing: {
        label: 'Preparing',
        color: 'bg-purple-500',
        textColor: 'text-purple-900',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-500',
        next: 'ready',
        emoji: '🟣'
    },
    ready: {
        label: 'Ready',
        color: 'bg-green-500',
        textColor: 'text-green-900',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-500',
        next: 'delivered',
        emoji: '🟢'
    },
    delivered: {
        label: 'Delivered',
        color: 'bg-gray-500',
        textColor: 'text-gray-900',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-500',
        next: null,
        emoji: '⚪'
    },
    cancelled: {
        label: 'Cancelled',
        color: 'bg-red-500',
        textColor: 'text-red-900',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-500',
        next: null,
        emoji: '🔴'
    }
}

export function KitchenOrderCard({ order, onViewOrder, onNextStatus, onPrint }: KitchenOrderCardProps) {
    const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
    const nextStatus = status.next ? statusConfig[status.next as keyof typeof statusConfig] : null

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getElapsedTime = (date: string) => {
        const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        return `${hours}h ${minutes % 60}m ago`
    }

    return (
        <div
            className={cn(
                "bg-white rounded-2xl shadow-lg border-l-8 overflow-hidden transition-all hover:shadow-xl",
                status.borderColor
            )}
            data-testid={`order-card-${order.id}`}
        >
            {/* Header */}
            <div className={cn("p-4", status.bgColor)}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-gray-900">
                            #{order.id}
                        </span>
                        <span className={cn(
                            "px-3 py-1 rounded-full text-sm font-bold",
                            status.color,
                            "text-white"
                        )}>
                            {status.emoji} {status.label.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{formatTime(order.created_at)}</span>
                    <span className="text-gray-400">•</span>
                    <span className="font-semibold">{getElapsedTime(order.created_at)}</span>
                </div>

                {order.customer && (
                    <div className="mt-2 text-sm font-medium text-gray-700">
                        👤 {order.customer.name}
                        {order.customer.phone && (
                            <span className="ml-2 text-gray-500">📱 {order.customer.phone}</span>
                        )}
                    </div>
                )}
            </div>

            {/* Items */}
            <div className="p-4 space-y-2">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                        <div className="flex-1">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-sm font-bold mr-2">
                                {item.quantity}
                            </span>
                            <span className="text-base font-semibold text-gray-900">
                                {item.name}
                            </span>
                            {(item as any).options && (
                                <p className="ml-8 text-sm text-gray-600">
                                    {JSON.stringify((item as any).options)}
                                </p>
                            )}
                        </div>
                        <span className="text-base font-bold text-gray-900 ml-2">
                            ${(item.quantity * item.unit_price).toFixed(0)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-700">TOTAL</span>
                    <span className="text-2xl font-black text-gray-900">
                        ${order.total.toFixed(0)}
                    </span>
                </div>
                {order.payment_method && (
                    <div className="mt-1 text-sm text-gray-600">
                        💳 {order.payment_method.toUpperCase()}
                    </div>
                )}
            </div>

            {/* Notes */}
            {order.notes && (
                <div className="px-4 py-3 bg-orange-50 border-t border-orange-200">
                    <p className="text-sm font-medium text-orange-900">
                        📝 {order.notes}
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="p-4 bg-white border-t border-gray-200 flex gap-3">
                {/* Next Status Button - Main CTA */}
                {nextStatus && (
                    <button
                        onClick={() => onNextStatus(order.id, status.next!)}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white text-lg transition-all hover:scale-105 active:scale-95 shadow-lg",
                            nextStatus.color
                        )}
                        data-testid={`btn-next-status-${order.id}`}
                    >
                        <span>{nextStatus.emoji}</span>
                        <span>{nextStatus.label.toUpperCase()}</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                )}

                {/* Secondary Actions */}
                <button
                    onClick={() => onViewOrder(order)}
                    className="flex items-center justify-center w-14 h-14 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    data-testid={`btn-view-${order.id}`}
                >
                    <Eye className="w-6 h-6" />
                </button>

                <button
                    onClick={() => onPrint(order)}
                    className="flex items-center justify-center w-14 h-14 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                    data-testid={`btn-print-${order.id}`}
                >
                    <Printer className="w-6 h-6" />
                </button>
            </div>
        </div>
    )
}
