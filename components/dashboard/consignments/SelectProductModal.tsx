'use client'

/**
 * SelectProductModal Component
 *
 * Modal for selecting a product to assign to a consignment location
 * Fetches available products from tenant and allows selection
 */

import { useState, useEffect } from 'react'
import { X, Loader2, Search, Package, Check } from 'lucide-react'

interface Product {
  id: number
  name: string
  price: number
  image_url?: string
  status: string
}

interface SelectProductModalProps {
  isOpen: boolean
  tenantId: number
  locationId: string
  locationName: string
  onSelect: (productId: number, status: string, notes?: string) => Promise<void>
  onClose: () => void
}

const STATUS_OPTIONS = [
  { value: 'in_gallery', label: 'En Galería' },
  { value: 'in_transit', label: 'En Tránsito' },
  { value: 'pending', label: 'Pendiente' },
]

export function SelectProductModal({
  isOpen,
  tenantId,
  locationId,
  locationName,
  onSelect,
  onClose,
}: SelectProductModalProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [status, setStatus] = useState('in_gallery')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchProducts()
    }
  }, [isOpen, tenantId])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Fetch products from tenant via correct API route
      const res = await fetch(`/api/products?tenant_id=${tenantId}`)
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async () => {
    if (!selectedProduct) {
      setError('Selecciona un producto')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSelect(selectedProduct.id, status, notes || undefined)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
      data-testid="assign-artwork-modal"
    >
      <div className="bg-[var(--color-bg-primary)] w-full md:max-w-lg rounded-t-lg md:rounded-lg shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-subtle)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Asignar Obra</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">a {locationName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--color-bg-secondary)] rounded text-[var(--color-text-secondary)]"
            data-testid="close-modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[var(--color-border-subtle)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[var(--color-border-subtle)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] text-sm"
              data-testid="product-search"
            />
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-4 max-h-64">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-muted)]" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-text-secondary)]">
              <Package className="h-8 w-8 mx-auto mb-2 text-[var(--color-text-muted)]" />
              <p>No hay productos disponibles</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                    selectedProduct?.id === product.id
                      ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10'
                      : 'border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-secondary)]'
                  }`}
                  data-testid={`product-option-${product.id}`}
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-[var(--color-bg-secondary)] rounded flex items-center justify-center">
                      <Package className="h-5 w-5 text-[var(--color-text-muted)]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--color-text-primary)] truncate">{product.name}</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">${product.price?.toLocaleString() || 0}</p>
                  </div>
                  {selectedProduct?.id === product.id && (
                    <div className="w-5 h-5 bg-[var(--color-accent-primary)] rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-[var(--color-bg-primary)]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Product Details */}
        {selectedProduct && (
          <div className="p-4 border-t border-[var(--color-border-subtle)] space-y-3">
            <div className="p-3 bg-[var(--color-bg-secondary)] rounded-lg">
              <p className="text-xs text-[var(--color-text-secondary)]">Obra seleccionada</p>
              <p className="font-medium text-[var(--color-text-primary)]">{selectedProduct.name}</p>
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] text-sm"
                data-testid="status-select"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Notas (opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                className="w-full px-3 py-2 border border-[var(--color-border-subtle)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] resize-none h-16 text-sm"
                placeholder="Agregar notas..."
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 pb-2">
            <div className="p-2 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded text-[var(--color-error)] text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 p-4 border-t border-[var(--color-border-subtle)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] border-2 border-[var(--btn-secondary-border)] rounded-lg hover:bg-[var(--btn-secondary-hover-bg)] disabled:opacity-50 text-sm shadow-[var(--btn-secondary-shadow)]"
            data-testid="cancel-button"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedProduct}
            className="flex-1 px-4 py-2 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-2 border-[var(--btn-primary-border)] rounded-lg hover:bg-[var(--btn-primary-hover-bg)] disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-[var(--btn-primary-shadow)]"
            data-testid="confirm-assign-btn"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Asignar
          </button>
        </div>
      </div>
    </div>
  )
}
