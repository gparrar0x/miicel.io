"use client"

import * as React from "react"
import { ImageIcon, Package, DollarSign, Layers, GripVertical, Upload, Loader2, Plus, Trash2, Pencil } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Product } from "@/lib/schemas/product"
import { useTranslations } from "next-intl"
import Image from "next/image"

const AVAILABLE_BADGES = ['popular', 'new', 'sale'] as const

interface ProductSize {
  id: string
  label: string
  price: number
  stock: number
  dimensions: string
}

interface ProductEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onSave: (product: Product, imageFile?: File) => Promise<void>
  categories?: string[]
  isLoading?: boolean
  template?: string
}

export function ProductEditModal({
  open,
  onOpenChange,
  product,
  onSave,
  categories = [],
  isLoading = false,
  template,
}: ProductEditModalProps) {
  const t = useTranslations('Products.form')
  const tProducts = useTranslations('Products')
  const tCommon = useTranslations('Common')

  const [formData, setFormData] = React.useState<Omit<Product, "id">>({
    name: "",
    description: "",
    price: 0,
    category: "",
    stock: 0,
    image_url: "",
    active: true,
    display_order: 0,
    metadata: { badges: [] },
  })

  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [imageFile, setImageFile] = React.useState<File | undefined>(undefined)
  const [selectedBadges, setSelectedBadges] = React.useState<string[]>([])
  const [sizes, setSizes] = React.useState<ProductSize[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        category: product.category,
        stock: product.stock ?? 0,
        image_url: product.image_url || "",
        active: product.active,
        display_order: product.display_order,
        metadata: product.metadata || { badges: [] },
      })
      setImagePreview(product.image_url || null)
      setSelectedBadges((product.metadata as any)?.badges || [])
      setSizes((product.metadata as any)?.sizes || [])
      setImageFile(undefined)
    } else {
      // Reset form for new product
      setFormData({
        name: "",
        description: "",
        price: 0,
        category: "",
        stock: 0,
        image_url: "",
        active: true,
        display_order: 0,
        metadata: { badges: [] },
      })
      setImagePreview(null)
      setSelectedBadges([])
      setSizes([])
      setImageFile(undefined)
    }
  }, [product])

  const handleChange = (field: keyof Omit<Product, "id">, value: string | number | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "image_url" && typeof value === "string") {
      setImagePreview(value || null)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleBadge = (badge: string) => {
    const newBadges = selectedBadges.includes(badge)
      ? selectedBadges.filter(b => b !== badge)
      : [...selectedBadges, badge]
    setSelectedBadges(newBadges)
    setFormData(prev => ({
      ...prev,
      metadata: { ...(prev.metadata || {}), badges: newBadges }
    }))
  }

  const addSize = () => {
    const newSize: ProductSize = {
      id: crypto.randomUUID(),
      label: '',
      price: formData.price || 0,
      stock: 0,
      dimensions: '',
    }
    const newSizes = [...sizes, newSize]
    setSizes(newSizes)
    setFormData(prev => ({
      ...prev,
      metadata: { ...(prev.metadata || {}), sizes: newSizes }
    }))
  }

  const removeSize = (index: number) => {
    const newSizes = sizes.filter((_, i) => i !== index)
    setSizes(newSizes)
    setFormData(prev => ({
      ...prev,
      metadata: { ...(prev.metadata || {}), sizes: newSizes }
    }))
  }

  const updateSize = (index: number, field: keyof ProductSize, value: string | number) => {
    const newSizes = sizes.map((size, i) => {
      if (i === index) {
        return { ...size, [field]: value }
      }
      return size
    })
    setSizes(newSizes)
    setFormData(prev => ({
      ...prev,
      metadata: { ...(prev.metadata || {}), sizes: newSizes }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave({
      ...formData,
      id: product?.id,
    }, imageFile)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="size-5" />
            {product ? t('edit') : t('new')}
          </DialogTitle>
          <DialogDescription>{t('descPlaceholder')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <Label className="text-sm font-medium mb-2 block">{t('image')}</Label>
                {imagePreview ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted/30">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                      title={t('upload')}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                      data-testid="product-image-input"
                    />
                  </div>
                ) : (
                  <div className="relative flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 overflow-hidden cursor-pointer hover:bg-muted/70 transition-colors">
                    <Upload className="size-8 mb-2 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">{t('upload')}</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={handleImageChange}
                      data-testid="product-image-input"
                    />
                  </div>
                )}
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  {tCommon('name')}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder={t('namePlaceholder')}
                  required
                  data-testid="product-form-name"
                />
              </div>

              {/* Category Field */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  {tProducts('category')}
                </Label>
                {categories.length > 0 ? (
                  <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                    <SelectTrigger className="w-full" data-testid="product-form-category">
                      <SelectValue placeholder={t('categoryPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    placeholder={t('categoryPlaceholder')}
                    required
                    data-testid="product-form-category"
                  />
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  {t('description')}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder={t('descPlaceholder')}
                  className="min-h-[80px] resize-none"
                  data-testid="product-form-description"
                />
              </div>

              {/* Price and Stock Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium flex items-center gap-1.5">
                    <DollarSign className="size-3.5" />
                    {tCommon('price')}
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleChange("price", Number.parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    required
                    data-testid="product-form-price"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-sm font-medium flex items-center gap-1.5">
                    <Layers className="size-3.5" />
                    {t('stock')}
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock ?? 0}
                    onChange={(e) => handleChange("stock", Number.parseInt(e.target.value) || 0)}
                    placeholder="0"
                    data-testid="product-form-stock"
                  />
                </div>
              </div>

              {/* Display Order */}
              <div className="space-y-2">
                <Label htmlFor="display_order" className="text-sm font-medium flex items-center gap-1.5">
                  <GripVertical className="size-3.5" />
                  {t('displayOrder')}
                </Label>
                <Input
                  id="display_order"
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) => handleChange("display_order", Number.parseInt(e.target.value) || 0)}
                  placeholder="0"
                  data-testid="product-form-display-order"
                />
                <p className="text-xs text-muted-foreground">{t('displayOrderHint')}</p>
              </div>

              {/* Badges */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('badges')}</Label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_BADGES.map((badge) => (
                    <button
                      key={badge}
                      type="button"
                      onClick={() => toggleBadge(badge)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedBadges.includes(badge)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                      data-testid={`badge-${badge}`}
                    >
                      {t(`badge_${badge}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sizes - Gallery Template Only */}
          {template === 'gallery' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{t('sizes')}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSize}
                  data-testid="add-size-btn"
                >
                  <Plus className="size-4 mr-1" />
                  {t('addSize')}
                </Button>
              </div>
              {sizes.length > 0 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_100px_80px_80px_32px] gap-2 text-xs font-medium text-muted-foreground px-1">
                    <span>{t('sizeLabel')}</span>
                    <span>{t('sizeDimensions')}</span>
                    <span>{tCommon('price')}</span>
                    <span>{t('stock')}</span>
                    <span></span>
                  </div>
                  {sizes.map((size, index) => (
                    <div key={size.id} className="grid grid-cols-[1fr_100px_80px_80px_32px] gap-2 items-center">
                      <Input
                        value={size.label}
                        onChange={(e) => updateSize(index, 'label', e.target.value)}
                        placeholder={t('sizeLabelPlaceholder')}
                        className="h-9"
                        data-testid={`size-label-${index}`}
                      />
                      <Input
                        value={size.dimensions}
                        onChange={(e) => updateSize(index, 'dimensions', e.target.value)}
                        placeholder="30x40cm"
                        className="h-9"
                        data-testid={`size-dimensions-${index}`}
                      />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={size.price}
                        onChange={(e) => updateSize(index, 'price', Number.parseFloat(e.target.value) || 0)}
                        className="h-9"
                        data-testid={`size-price-${index}`}
                      />
                      <Input
                        type="number"
                        min="0"
                        value={size.stock}
                        onChange={(e) => updateSize(index, 'stock', Number.parseInt(e.target.value) || 0)}
                        className="h-9"
                        data-testid={`size-stock-${index}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSize(index)}
                        className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                        data-testid={`remove-size-${index}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {sizes.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                  {t('noSizes')}
                </p>
              )}
            </div>
          )}

          {/* Active Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="active" className="text-sm font-medium cursor-pointer">
                {t('activeLabel')}
              </Label>
              <p className="text-xs text-muted-foreground">
                Los productos activos son visibles en la tienda
              </p>
            </div>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleChange("active", checked)}
              data-testid="product-active-checkbox"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="product-form-cancel-btn"
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading} data-testid="product-form-submit">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? t('save') : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
