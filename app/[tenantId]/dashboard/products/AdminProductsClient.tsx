"use client"

import { useState } from "react"
import { Product } from "@/lib/schemas/product"
import { ProductsTable } from "@/components/ProductsTable"
import { ProductForm } from "@/components/ProductForm"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { AdminSidebar } from "@/components/AdminSidebar"

interface AdminProductsClientProps {
    initialProducts: Product[]
    tenantId: number
    tenantSlug: string
    tenantName: string
}

export function AdminProductsClient({ initialProducts, tenantId, tenantSlug, tenantName }: AdminProductsClientProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

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
        if (!confirm("Are you sure you want to delete this product?")) return

        try {
            const { error } = await supabase
                .from("products")
                .delete()
                .eq("id", product.id!)

            if (error) throw error

            setProducts((prev) => prev.filter((p) => p.id !== product.id))
            toast.success("Product deleted successfully")
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

            toast.success(editingProduct ? "Product updated" : "Product created")
            setIsFormOpen(false)
            refreshData()
        } catch (error) {
            console.error("Error saving product:", error)
            toast.error("Failed to save product")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <AdminSidebar tenant={tenantSlug} tenantName={tenantName} />
            <div className="lg:pl-64 min-h-screen bg-gray-50">
                <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 mt-16 lg:mt-0">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Products</h1>
                            <p className="text-gray-500 mt-2">
                                Manage your product catalog, prices, and inventory.
                            </p>
                        </div>
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
                </main>
            </div>
        </>
    )
}
