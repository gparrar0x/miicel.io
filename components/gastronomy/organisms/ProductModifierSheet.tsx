'use client'

import { Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { useState } from 'react'
import { ModifierGroupList } from '@/components/gastronomy/molecules/ModifierGroupList'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { ModifierGroup, ModifierOption, SelectedModifier } from '@/types/commerce'

interface ProductForSheet {
  id: string
  name: string
  price: number
  images: string[]
  description?: string | null
}

interface ProductModifierSheetProps {
  product: ProductForSheet
  modifierGroups: ModifierGroup[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (modifiers: SelectedModifier[], qty: number, modifiersTotalDelta: number) => void
  currency?: string
}

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency }).format(price)
}

function calcModifiersDelta(
  selectedMap: Record<string, string[]>,
  groups: ModifierGroup[],
): number {
  return groups.reduce((total, group) => {
    const selectedIds = selectedMap[group.id] ?? []
    const optionsDelta = (group.options ?? [])
      .filter((o) => selectedIds.includes(o.id))
      .reduce((sum: number, o: ModifierOption) => sum + o.price_delta, 0)
    return total + optionsDelta
  }, 0)
}

function buildSelectedModifiers(selectedMap: Record<string, string[]>): SelectedModifier[] {
  return Object.entries(selectedMap).flatMap(([groupId, optionIds]) =>
    optionIds.map((optionId) => ({
      modifier_group_id: groupId,
      modifier_option_id: optionId,
    })),
  )
}

export function ProductModifierSheet({
  product,
  modifierGroups,
  open,
  onOpenChange,
  onConfirm,
  currency = 'CLP',
}: ProductModifierSheetProps) {
  const [selectedMap, setSelectedMap] = useState<Record<string, string[]>>({})
  const [errorMap, setErrorMap] = useState<Record<string, boolean>>({})
  const [qty, setQty] = useState(1)

  const modifiersDelta = calcModifiersDelta(selectedMap, modifierGroups)
  const unitTotal = product.price + modifiersDelta
  const subtotal = unitTotal * qty

  const handleChange = (groupId: string, optionId: string, checked: boolean) => {
    setSelectedMap((prev) => {
      const group = modifierGroups.find((g) => g.id === groupId)
      const isRadio = group?.max_selections === 1

      if (isRadio) {
        return { ...prev, [groupId]: checked ? [optionId] : [] }
      }

      const current = prev[groupId] ?? []
      return {
        ...prev,
        [groupId]: checked ? [...current, optionId] : current.filter((id) => id !== optionId),
      }
    })
    // Clear error on interaction
    if (errorMap[groupId]) {
      setErrorMap((prev) => ({ ...prev, [groupId]: false }))
    }
  }

  const handleConfirm = () => {
    const newErrorMap: Record<string, boolean> = {}
    let hasErrors = false

    for (const group of modifierGroups) {
      if (!group.active) continue
      const selected = selectedMap[group.id] ?? []
      if (selected.length < group.min_selections) {
        newErrorMap[group.id] = true
        hasErrors = true
      }
    }

    if (hasErrors) {
      setErrorMap(newErrorMap)
      return
    }

    onConfirm(buildSelectedModifiers(selectedMap), qty, modifiersDelta)
    // Reset
    setSelectedMap({})
    setErrorMap({})
    setQty(1)
  }

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setSelectedMap({})
      setErrorMap({})
      setQty(1)
    }
    onOpenChange(val)
  }

  const imageUrl = product.images[0] || '/placeholder.svg'

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg bg-white flex flex-col p-0"
        data-testid="product-modifier-sheet"
      >
        <SheetHeader className="p-6 pb-4 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl font-bold text-gray-900 text-balance leading-tight">
                {product.name}
              </SheetTitle>
              {product.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
              )}
              <p className="text-lg font-bold mt-2" style={{ color: 'var(--color-primary)' }}>
                {formatPrice(product.price, currency)}
              </p>
            </div>
            <button
              data-testid="product-modifier-sheet-close"
              onClick={() => handleOpenChange(false)}
              className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </SheetHeader>

        {/* Scrollable modifiers */}
        <div className="flex-1 overflow-y-auto p-6">
          {modifierGroups.length > 0 ? (
            <ModifierGroupList
              groups={modifierGroups}
              selectedMap={selectedMap}
              errorMap={errorMap}
              onChange={handleChange}
            />
          ) : (
            <p className="text-sm text-gray-500">Sin modificadores disponibles.</p>
          )}
        </div>

        {/* Footer: qty + subtotal + CTA */}
        <div className="border-t border-gray-200 p-6 space-y-4 bg-white">
          {/* Quantity selector */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">Cantidad</span>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
              <button
                data-testid="product-modifier-sheet-qty-dec"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-700 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Disminuir cantidad"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span
                data-testid="product-modifier-sheet-qty-value"
                className="w-8 text-center font-bold text-gray-900"
              >
                {qty}
              </span>
              <button
                data-testid="product-modifier-sheet-qty-inc"
                onClick={() => setQty((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-700 hover:bg-white transition-colors"
                aria-label="Aumentar cantidad"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subtotal */}
          <div
            data-testid="product-modifier-sheet-subtotal"
            className="flex items-center justify-between text-sm text-gray-600"
          >
            <span>Subtotal</span>
            <span className="font-bold text-gray-900 text-base">
              {formatPrice(subtotal, currency)}
            </span>
          </div>

          {/* CTA */}
          <Button
            data-testid="product-modifier-sheet-confirm"
            className="w-full text-white font-bold py-6 rounded-xl"
            size="lg"
            onClick={handleConfirm}
            style={{
              background: `linear-gradient(to right, var(--color-primary), color-mix(in srgb, var(--color-primary) 85%, black))`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `linear-gradient(to right, color-mix(in srgb, var(--color-primary) 85%, black), color-mix(in srgb, var(--color-primary) 70%, black))`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `linear-gradient(to right, var(--color-primary), color-mix(in srgb, var(--color-primary) 85%, black))`
            }}
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Agregar al pedido — {formatPrice(subtotal, currency)}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
