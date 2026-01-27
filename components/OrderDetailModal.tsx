"use client"

import { OrderResponse } from "@/lib/schemas/order"
import { X, Printer, Package } from "lucide-react"
import { useState } from "react"
import { useTranslations } from "next-intl"

interface OrderDetailModalProps {
    order: OrderResponse
    onClose: () => void
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

const statusTransitions: Record<string, string[]> = {
    pending: ['paid', 'cancelled'],
    paid: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['delivered', 'cancelled'],
    delivered: ['cancelled'],
    cancelled: []
}

export function OrderDetailModal({ order, onClose, onStatusUpdate, onPrint }: OrderDetailModalProps) {
    const t = useTranslations('Orders')
    const tCommon = useTranslations('Common')
    const [isUpdating, setIsUpdating] = useState(false)

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true)
        await onStatusUpdate(order.id, newStatus)
        setIsUpdating(false)
    }

    const availableTransitions = statusTransitions[order.status] || []

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
                className="bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                data-testid="order-detail-modal"
            >
                {/* Header */}
                <div className="sticky top-0 bg-[var(--color-bg-primary)] border-b border-[var(--color-border-subtle)] px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{t('details.title', { id: order.id })}</h2>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                            {new Date(order.created_at).toLocaleString()}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                        data-testid="close-modal"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            {t('details.status')}
                        </label>
                        <div className="flex items-center gap-3">
                            <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${
                                    statusColors[order.status as keyof typeof statusColors] || statusColors.pending
                                }`}
                                data-testid="order-status"
                            >
                                {t(`statuses.${order.status}`)}
                            </span>
                            {availableTransitions.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-[var(--color-text-secondary)]">→</span>
                                    {availableTransitions.map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(status)}
                                            disabled={isUpdating}
                                            className="px-3 py-1 text-sm rounded-lg border-2 border-[var(--btn-secondary-border)] text-[var(--btn-secondary-text)] hover:bg-[var(--btn-secondary-hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            data-testid={`status-transition-${status}`}
                                        >
                                            {t(`statuses.${status}`)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer Info */}
                    {order.customer && (
                        <div>
                            <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('details.customer')}</h3>
                            <div className="bg-[var(--color-bg-secondary)] rounded-md p-4 space-y-1">
                                <p className="font-medium text-[var(--color-text-primary)]">{order.customer.name}</p>
                                {order.customer.email && (
                                    <p className="text-sm text-[var(--color-text-secondary)]">{order.customer.email}</p>
                                )}
                                {order.customer.phone && (
                                    <p className="text-sm text-[var(--color-text-secondary)]">{order.customer.phone}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Payment Info */}
                    <div>
                        <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('details.payment')}</h3>
                        <div className="bg-[var(--color-bg-secondary)] rounded-md p-4 space-y-1">
                            <p className="text-sm text-[var(--color-text-primary)]">
                                <span className="font-medium">{t('details.method')}</span>{' '}
                                {order.payment_method || t('details.notSpecified')}
                            </p>
                            {order.payment_id && (
                                <p className="text-sm text-[var(--color-text-primary)]">
                                    <span className="font-medium">{t('details.paymentId')}</span> {order.payment_id}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            {t('details.items', { count: order.items.length })}
                        </h3>
                        <div className="border border-[var(--color-border-subtle)] rounded-md overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-subtle)]">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-[var(--color-text-primary)]">{t('details.product')}</th>
                                        <th className="px-4 py-2 text-center font-medium text-[var(--color-text-primary)]">{t('details.qty')}</th>
                                        <th className="px-4 py-2 text-right font-medium text-[var(--color-text-primary)]">{t('details.price')}</th>
                                        <th className="px-4 py-2 text-right font-medium text-[var(--color-text-primary)]">{t('total')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                                    {order.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-[var(--color-bg-secondary)]">
                                            <td className="px-4 py-3 text-[var(--color-text-primary)]">{item.name}</td>
                                            <td className="px-4 py-3 text-center text-[var(--color-text-secondary)]">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right text-[var(--color-text-secondary)]">
                                                ${item.unit_price.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-[var(--color-text-primary)]">
                                                ${(item.quantity * item.unit_price).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-[var(--color-border-subtle)] pt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-[var(--color-text-primary)]">{t('total')}</span>
                            <span className="text-2xl font-bold text-[var(--color-text-primary)]" data-testid="order-total">
                                ${order.total.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div>
                            <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">{t('notes')}</h3>
                            <div className="bg-[var(--color-bg-secondary)] rounded-md p-4">
                                <p className="text-sm text-[var(--color-text-primary)]">{order.notes}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-subtle)] px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] border-2 border-[var(--btn-secondary-border)] rounded-lg hover:bg-[var(--btn-secondary-hover-bg)] transition-colors shadow-[var(--btn-secondary-shadow)]"
                    >
                        {tCommon('close')}
                    </button>
                    <button
                        onClick={() => onPrint(order)}
                        className="px-4 py-2 text-sm font-medium bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-2 border-[var(--btn-primary-border)] rounded-lg hover:bg-[var(--btn-primary-hover-bg)] transition-colors flex items-center gap-2 shadow-[var(--btn-primary-shadow)]"
                        data-testid="print-invoice-button"
                    >
                        <Printer className="h-4 w-4" />
                        {t('printInvoice')}
                    </button>
                </div>
            </div>
        </div>
    )
}
