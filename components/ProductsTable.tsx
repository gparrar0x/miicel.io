"use client"

import { useState } from "react"
import { Product } from "@/lib/schemas/product"
import { Edit, Trash2, Plus, Search, Filter } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"

interface ProductsTableProps {
    products: Product[]
    onEdit: (product: Product) => void
    onDelete: (product: Product) => void
    onAdd: () => void
}

export function ProductsTable({ products, onEdit, onDelete, onAdd }: ProductsTableProps) {
    const t = useTranslations('Products')
    const tCommon = useTranslations('Common')

    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState<string>("ALL")
    const [activeFilter, setActiveFilter] = useState<string>("ALL")

    const categories = Array.from(new Set(products.map((p) => p.category)))

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = categoryFilter === "ALL" || product.category === categoryFilter
        const matchesActive =
            activeFilter === "ALL" ||
            (activeFilter === "ACTIVE" ? product.active : !product.active)

        return matchesSearch && matchesCategory && matchesActive
    })

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <input
                            placeholder={t('table.search')}
                            className="pl-8 h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF6B35] text-[#1A1A1A]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF6B35] text-[#1A1A1A]"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="ALL">{t('table.allCategories')}</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                    <select
                        className="h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF6B35] text-[#1A1A1A]"
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value)}
                    >
                        <option value="ALL">{t('table.allStatus')}</option>
                        <option value="ACTIVE">{t('active')}</option>
                        <option value="INACTIVE">{t('inactive')}</option>
                    </select>
                </div>
                <button
                    onClick={onAdd}
                    data-testid="products-new-button"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-black text-white shadow hover:bg-black/90 h-9 px-4 py-2"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('addProduct')}
                </button>
            </div>

            <div className="rounded-lg border border-border bg-background overflow-hidden">
                <div className="overflow-x-auto">
                    <table data-testid="product-table" className="w-full text-sm text-left">
                        <thead className="bg-secondary">
                            <tr>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[80px]">{t('form.image')}</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('name')}</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('category')}</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('price')}</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">{tCommon('active')}</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">{tCommon('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        {t('table.noProducts')}
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} data-testid="product-table-row" className="hover:bg-accent/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="relative h-10 w-10 rounded-md overflow-hidden bg-gray-100 border">
                                                {product.image_url ? (
                                                    <Image
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-400">
                                                        <span className="text-xs">{t('table.noImg')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            {product.name}
                                            {product.description && (
                                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                    {product.description}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 bg-gray-100 text-gray-800">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            ${product.price.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${product.active
                                                    ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                                                    : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                                                    }`}
                                            >
                                                {product.active ? t('active') : t('inactive')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => onEdit(product)}
                                                    data-testid="product-edit-button"
                                                    className="p-2 hover:bg-gray-100 rounded-md text-gray-600 hover:text-blue-600 transition-colors"
                                                    title={tCommon('edit')}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(product)}
                                                    data-testid="product-delete-button"
                                                    className="p-2 hover:bg-gray-100 rounded-md text-gray-600 hover:text-red-600 transition-colors"
                                                    title={tCommon('delete')}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
