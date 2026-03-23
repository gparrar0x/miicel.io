'use client'

import { useState } from 'react'
import { DiscountBadge } from '@/components/gastronomy/atoms/DiscountBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { DiscountScope, DiscountSnapshot, DiscountType } from '@/types/commerce'

interface OrderItemRef {
  id: number | string
  name: string
}

interface ActiveDiscount {
  snapshot: DiscountSnapshot
  amount: number
}

interface AdminDiscountPanelProps {
  orderId: number
  currentDiscount?: ActiveDiscount
  orderItems: OrderItemRef[]
  orderTotal: number
  tenantId: number
  onApply: (params: {
    orderId: number
    tenantId: number
    type: DiscountType
    value: number
    scope: DiscountScope
    targetItemId?: number | string
    label: string
  }) => Promise<void>
  onRemove: (orderId: number) => Promise<void>
  currency?: string
}

function calcPreviewDiscount(
  type: DiscountType,
  value: number,
  scope: DiscountScope,
  targetItemId: string,
  orderTotal: number,
  items: OrderItemRef[],
): number {
  if (!value || value <= 0) return 0
  // For simplicity preview uses orderTotal for order scope, single item price N/A (no unit price here)
  const base = scope === 'order' ? orderTotal : orderTotal / Math.max(items.length, 1)
  if (type === 'percentage') return Math.min(base, (base * value) / 100)
  return Math.min(base, value)
}

export function AdminDiscountPanel({
  orderId,
  currentDiscount,
  orderItems,
  orderTotal,
  tenantId,
  onApply,
  onRemove,
  currency = 'CLP',
}: AdminDiscountPanelProps) {
  const [type, setType] = useState<DiscountType>('percentage')
  const [value, setValue] = useState<string>('')
  const [scope, setScope] = useState<DiscountScope>('order')
  const [targetItemId, setTargetItemId] = useState<string>('')
  const [label, setLabel] = useState<string>('')
  const [isApplying, setIsApplying] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const numValue = parseFloat(value) || 0
  const previewAmount = calcPreviewDiscount(
    type,
    numValue,
    scope,
    targetItemId,
    orderTotal,
    orderItems,
  )
  const previewTotal = orderTotal - previewAmount

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency }).format(price)

  const handleApply = async () => {
    if (!numValue || numValue <= 0) return
    if (scope === 'item' && !targetItemId) return
    setIsApplying(true)
    try {
      await onApply({
        orderId,
        tenantId,
        type,
        value: numValue,
        scope,
        targetItemId: scope === 'item' ? targetItemId : undefined,
        label: label || (type === 'percentage' ? `${numValue}% desc.` : `$${numValue} desc.`),
      })
    } finally {
      setIsApplying(false)
    }
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      await onRemove(orderId)
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div
      data-testid="admin-discount-panel"
      className="rounded-xl border border-gray-200 bg-white p-4 space-y-4"
    >
      <h4 className="font-semibold text-gray-900 text-sm">Descuento</h4>

      {currentDiscount ? (
        <div className="space-y-3">
          <div data-testid="admin-discount-active-badge">
            <DiscountBadge
              discount={currentDiscount.snapshot}
              discountAmount={currentDiscount.amount}
              currency={currency}
            />
          </div>
          <Button
            data-testid="admin-discount-remove"
            variant="outline"
            size="sm"
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            onClick={handleRemove}
            disabled={isRemoving}
          >
            {isRemoving ? 'Quitando...' : 'Quitar descuento'}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Type toggle */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Tipo</Label>
            <div className="flex gap-2">
              <button
                data-testid="admin-discount-type-fixed"
                onClick={() => setType('fixed')}
                className={`flex-1 py-1.5 text-sm rounded-lg border font-medium transition-colors ${
                  type === 'fixed'
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_8%,white)]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Fijo ($)
              </button>
              <button
                data-testid="admin-discount-type-percent"
                onClick={() => setType('percentage')}
                className={`flex-1 py-1.5 text-sm rounded-lg border font-medium transition-colors ${
                  type === 'percentage'
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_8%,white)]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Porcentaje (%)
              </button>
            </div>
          </div>

          {/* Value */}
          <div className="space-y-1">
            <Label htmlFor={`discount-value-${orderId}`} className="text-xs text-gray-600">
              Valor {type === 'percentage' ? '(%)' : '($)'}
            </Label>
            <Input
              id={`discount-value-${orderId}`}
              data-testid="admin-discount-value"
              type="number"
              min="0"
              max={type === 'percentage' ? '100' : undefined}
              step={type === 'percentage' ? '1' : '100'}
              placeholder={type === 'percentage' ? 'Ej: 10' : 'Ej: 500'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Scope toggle */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Alcance</Label>
            <div className="flex gap-2">
              <button
                data-testid="admin-discount-scope-order"
                onClick={() => {
                  setScope('order')
                  setTargetItemId('')
                }}
                className={`flex-1 py-1.5 text-sm rounded-lg border font-medium transition-colors ${
                  scope === 'order'
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_8%,white)]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Orden
              </button>
              <button
                data-testid="admin-discount-scope-item"
                onClick={() => setScope('item')}
                className={`flex-1 py-1.5 text-sm rounded-lg border font-medium transition-colors ${
                  scope === 'item'
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_8%,white)]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Item
              </button>
            </div>
          </div>

          {/* Item selector (when scope=item) */}
          {scope === 'item' && (
            <div className="space-y-1">
              <Label htmlFor={`discount-target-${orderId}`} className="text-xs text-gray-600">
                Item
              </Label>
              <select
                id={`discount-target-${orderId}`}
                data-testid="admin-discount-target-item"
                value={targetItemId}
                onChange={(e) => setTargetItemId(e.target.value)}
                className="w-full h-9 text-sm border border-gray-200 rounded-lg px-2 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              >
                <option value="">Selecciona un item</option>
                {orderItems.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Label */}
          <div className="space-y-1">
            <Label htmlFor={`discount-label-${orderId}`} className="text-xs text-gray-600">
              Memo <span className="text-gray-400">(opcional)</span>
            </Label>
            <Input
              id={`discount-label-${orderId}`}
              data-testid="admin-discount-label"
              placeholder="Ej: Descuento empleado"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Preview */}
          {numValue > 0 && (
            <>
              <Separator />
              <div data-testid="admin-discount-preview" className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(orderTotal)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-accent)] font-medium">
                  <span>Descuento</span>
                  <span>-{formatPrice(previewAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total con descuento</span>
                  <span>{formatPrice(previewTotal)}</span>
                </div>
              </div>
            </>
          )}

          {/* Apply */}
          <Button
            data-testid="admin-discount-apply"
            className="w-full text-white font-semibold"
            size="sm"
            onClick={handleApply}
            disabled={
              isApplying || !numValue || numValue <= 0 || (scope === 'item' && !targetItemId)
            }
            style={{
              background: `linear-gradient(to right, var(--color-primary), color-mix(in srgb, var(--color-primary) 85%, black))`,
            }}
          >
            {isApplying ? 'Aplicando...' : 'Aplicar descuento'}
          </Button>
        </div>
      )}
    </div>
  )
}
