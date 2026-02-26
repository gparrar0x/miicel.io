'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Image as ImageIcon, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { type ProductFormData, productSchema } from '@/lib/schemas/onboarding'

interface Product extends Omit<ProductFormData, 'image'> {
  imagePreview?: string
}

interface ProductFormProps {
  products: Product[]
  onProductsChange: (products: Product[]) => void
}

export function ProductForm({ products, onProductsChange }: ProductFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  })

  const imageFile = watch('image')

  // Get actual File from FileList if needed
  const getImageFile = (): File | null => {
    if (!imageFile) return null
    if (imageFile instanceof FileList) {
      return imageFile.length > 0 ? imageFile[0] : null
    }
    if (imageFile instanceof File) {
      return imageFile
    }
    return null
  }

  const onAddProduct = (data: ProductFormData) => {
    const file = getImageFile()
    const newProduct: Product = {
      name: data.name,
      price: Number(data.price),
      category: data.category,
      stock: Number(data.stock),
      imagePreview: file ? URL.createObjectURL(file) : undefined,
    }

    if (editingIndex !== null) {
      const updated = [...products]
      updated[editingIndex] = newProduct
      onProductsChange(updated)
      setEditingIndex(null)
    } else {
      onProductsChange([...products, newProduct])
    }

    reset()
  }

  const removeProduct = (index: number) => {
    onProductsChange(products.filter((_, i) => i !== index))
  }

  const editProduct = (index: number) => {
    const product = products[index]
    reset({
      name: product.name,
      price: Number(product.price),
      category: product.category,
      stock: Number(product.stock),
    })
    setEditingIndex(index)
  }

  return (
    <div className="space-y-6">
      {/* Product list */}
      {products.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Productos agregados ({products.length})</h3>
          <div className="space-y-2" data-testid="onboarding-product-list">
            {products.map((product, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                data-testid={`onboarding-product-item-${index}`}
              >
                {product.imagePreview && (
                  <img
                    src={product.imagePreview}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h4
                    className="font-medium text-gray-900"
                    data-testid={`onboarding-product-name-${index}`}
                  >
                    {product.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    ${product.price} · {product.category} · Stock: {product.stock}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => editProduct(index)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                    data-testid={`onboarding-product-edit-button-${index}`}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => removeProduct(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    data-testid={`onboarding-product-delete-button-${index}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add product form */}
      <form
        onSubmit={handleSubmit(onAddProduct)}
        className="space-y-4 p-6 border-2 border-dashed border-gray-300 rounded-lg"
      >
        <h3 className="font-medium text-gray-900">
          {editingIndex !== null ? 'Editar producto' : 'Agregar nuevo producto'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del producto
            </label>
            <input
              {...register('name')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Remera negra"
              data-testid="onboarding-product-name-input"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
            <input
              {...register('price', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              data-testid="onboarding-product-price-input"
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <input
              {...register('category')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Ropa"
              data-testid="onboarding-product-category-input"
            />
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock inicial</label>
            <input
              {...register('stock', { valueAsNumber: true })}
              type="number"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              data-testid="onboarding-product-stock-input"
            />
            {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
          </div>
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imagen del producto (opcional)
          </label>
          <div className="flex items-center gap-4">
            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <ImageIcon size={24} className="text-gray-400" />
              <span className="text-sm text-gray-600">
                {getImageFile() ? getImageFile()?.name : 'Click para subir imagen'}
              </span>
              <input
                {...register('image')}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
              />
            </label>
            {getImageFile() && (
              <img
                src={URL.createObjectURL(getImageFile()!)}
                alt="Preview"
                className="w-20 h-20 object-cover rounded"
              />
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          data-testid="onboarding-product-add-button"
        >
          <Plus size={20} />
          {editingIndex !== null ? 'Actualizar producto' : 'Agregar producto'}
        </button>
      </form>
    </div>
  )
}
