"use client"

import { useState } from "react"
import { Product } from "@/lib/schemas/product"
import { ProductsTable } from "@/components/ProductsTable"
import { ProductForm } from "@/components/ProductForm"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

interface AdminProductsClientProps {
    initialProducts: Product[]
    tenantId: number
    tenantSlug: string
}

export function AdminProductsClient({ initialProducts, tenantId, tenantSlug }: AdminProductsClientProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()
    const t = useTranslations('Products')
    const tCommon = useTranslations('Common')

    const refreshData = async () => {
        router.refresh()
    }

    const handleAdd = () => {
        setEditingProduct(undefined)
        setIsFormOpen(true)
    }

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setIsFormOpen(true)
    }

    const handleDelete = async (product: Product) => {
        if (!confirm(t('deleteConfirm'))) return

        try {
            const { error } = await supabase
                .from("products")
                .delete()
                .eq("id", product.id!)

            if (error) throw error

            setProducts((prev) => prev.filter((p) => p.id !== product.id))
            toast.success(t('deleteSuccess'))
            refreshData()
        } catch (error) {
            console.error("Error deleting product:", error)
            toast.error("Failed to delete product")
        }
    }

    const handleSubmit = async (data: Product, imageFile?: File) => {
        setIsLoading(true)
        try {
            let imageUrl = data.image_url

            // 1. Upload Image if provided
            if (imageFile) {
                const fileExt = imageFile.name.split(".").pop()
                const fileName = `${tenantSlug}/${Math.random()}.${fileExt}`

                // Check if assets bucket exists, otherwise use a default or handle error
                // We assume 'assets' bucket exists as per migration 025
                const { error: uploadError } = await supabase.storage
                    .from("assets")
                    .upload(fileName, imageFile)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from("assets")
                    .getPublicUrl(fileName)

                imageUrl = publicUrl
            }

            // 2. Upsert Product
            const productData = {
                ...data,
                image_url: imageUrl,
                tenant_id: tenantId,
            }

            const { data: savedProduct, error } = await supabase
                .from("products")
                .upsert(productData)
                .select()
                .single()

            if (error) throw error

            setProducts((prev) => {
                if (editingProduct) {
                    return prev.map((p) => (p.id === savedProduct.id ? (savedProduct as unknown as Product) : p))
                }
                return [savedProduct as unknown as Product, ...prev]
            })

            toast.success(editingProduct ? t('updateSuccess') : t('createSuccess'))
            setIsFormOpen(false)
            refreshData()
        } catch (error) {
            console.error("Error saving product:", error)
            toast.error(t('saveError'))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('title')}</h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>

            <ProductsTable
                products={products}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {isFormOpen && (
                <ProductForm
                    key={editingProduct?.id || 'new'}
                    initialData={editingProduct}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    isLoading={isLoading}
                />
            )}
        </div>
    )
}
