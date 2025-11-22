"use client"

import { useState, useEffect } from "react"
import { OrderResponse } from "@/lib/schemas/order"
import { KitchenOrderCard } from "./KitchenOrderCard"
import { RefreshCw, Bell, BellOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

interface KitchenDisplayOrdersProps {
    orders: OrderResponse[]
    onViewOrder: (order: OrderResponse) => void
    onStatusUpdate: (orderId: number, status: string) => void
    onPrint: (order: OrderResponse) => void
    onRefresh?: () => void
}

export function KitchenDisplayOrders({
    orders,
    onViewOrder,
    onStatusUpdate,
    onPrint,
    onRefresh
}: KitchenDisplayOrdersProps) {
    const t = useTranslations('Orders')

    const [activeFilter, setActiveFilter] = useState('new')
    const [soundEnabled, setSoundEnabled] = useState(false)
    const [lastOrderCount, setLastOrderCount] = useState(orders.length)

    const quickFilters = [
        { id: 'new', label: t('filters.new'), statuses: ['pending', 'paid'], emoji: '🔴', color: 'bg-red-500' },
        { id: 'preparing', label: t('filters.cooking'), statuses: ['preparing'], emoji: '🟣', color: 'bg-purple-500' },
        { id: 'ready', label: t('filters.ready'), statuses: ['ready'], emoji: '🟢', color: 'bg-green-500' },
        { id: 'all', label: t('filters.all'), statuses: [], emoji: '⚪', color: 'bg-gray-500' }
    ]

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!onRefresh) return
        const interval = setInterval(() => {
            onRefresh()
        }, 30000)
        return () => clearInterval(interval)
    }, [onRefresh])

    // Sound notification for new orders
    useEffect(() => {
        if (orders.length > lastOrderCount && soundEnabled) {
            // Play notification sound
            const audio = new Audio('/notification.mp3')
            audio.play().catch(() => {
                // Fallback to system beep if audio file not found
                const ctx = new AudioContext()
                const oscillator = ctx.createOscillator()
                const gain = ctx.createGain()
                oscillator.connect(gain)
                gain.connect(ctx.destination)
                oscillator.frequency.value = 800
                gain.gain.value = 0.3
                oscillator.start()
                oscillator.stop(ctx.currentTime + 0.2)
            })
        }
        setLastOrderCount(orders.length)
    }, [orders.length, lastOrderCount, soundEnabled])

    // Filter orders
    const activeFilterConfig = quickFilters.find(f => f.id === activeFilter)
    const filteredOrders = activeFilterConfig?.statuses.length
        ? orders.filter(o => activeFilterConfig.statuses.includes(o.status))
        : orders

    // Sort by created_at (newest first)
    const sortedOrders = [...filteredOrders].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // Count orders by filter
    const getCount = (statuses: string[]) => {
        if (!statuses.length) return orders.length
        return orders.filter(o => statuses.includes(o.status)).length
    }

    return (
        <div className="space-y-4">
            {/* Sticky Filter Tabs */}
            <div className="sticky top-0 z-10 bg-gray-50 pt-4 pb-2 -mx-4 px-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-gray-900">{t('kitchenDisplay')}</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={cn(
                                "p-2 rounded-lg transition-colors",
                                soundEnabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                            )}
                            data-testid="btn-toggle-sound"
                        >
                            {soundEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                        </button>
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                data-testid="btn-refresh"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {quickFilters.map(filter => {
                        const count = getCount(filter.statuses)
                        const isActive = activeFilter === filter.id

                        return (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all",
                                    isActive
                                        ? `${filter.color} text-white shadow-lg scale-105`
                                        : "bg-white text-gray-700 hover:bg-gray-100"
                                )}
                                data-testid={`filter-${filter.id}`}
                            >
                                <span className="text-lg">{filter.emoji}</span>
                                <span>{filter.label}</span>
                                {count > 0 && (
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-xs font-black",
                                        isActive ? "bg-white/30" : "bg-gray-200"
                                    )}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Empty State */}
            {sortedOrders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <span className="text-5xl">✨</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('noOrdersTitle')}</h3>
                    <p className="text-gray-600">
                        {activeFilter === 'all'
                            ? t('noOrdersDesc')
                            : t('noOrdersFilter', { filter: activeFilterConfig?.label.toLowerCase() })}
                    </p>
                </div>
            )}

            {/* Order Cards */}
            <div className="space-y-4 pb-20">
                {sortedOrders.map(order => (
                    <KitchenOrderCard
                        key={order.id}
                        order={order}
                        onViewOrder={onViewOrder}
                        onNextStatus={onStatusUpdate}
                        onPrint={onPrint}
                    />
                ))}
            </div>

            {/* Hidden style for scrollbar-hide */}
            <style jsx global>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    )
}
