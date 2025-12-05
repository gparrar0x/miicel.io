"use client"

import { useState } from "react"
import { Product } from "@/lib/schemas/product"
import { Edit, Trash2, Plus, Search } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Button } from "./ui/button"

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
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white p-4 rounded-[8px] shadow-mii border border-mii-gray-200">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-mii-gray-500" />
                        <input
                            placeholder={t('table.search')}
                            className="pl-8 h-11 w-full rounded-[4px] border border-mii-gray-200 bg-white px-3 py-2 text-sm shadow-mii transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mii-blue focus-visible:ring-offset-2 focus-visible:ring-offset-white text-mii-gray-900"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="h-11 rounded-[4px] border border-mii-gray-200 bg-white px-3 py-2 text-sm shadow-mii focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mii-blue focus-visible:ring-offset-2 focus-visible:ring-offset-white text-mii-gray-900"
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
                        className="h-11 rounded-[4px] border border-mii-gray-200 bg-white px-3 py-2 text-sm shadow-mii focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mii-blue focus-visible:ring-offset-2 focus-visible:ring-offset-white text-mii-gray-900"
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value)}
                    >
                        <option value="ALL">{t('table.allStatus')}</option>
                        <option value="ACTIVE">{t('active')}</option>
                        <option value="INACTIVE">{t('inactive')}</option>
                    </select>
                </div>
                <Button
                  onClick={onAdd}
                  data-testid="products-new-button"
                  variant="primary"
                  size="sm"
                  className="h-11 px-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('addProduct')}
                </Button>
            </div>

            <div className="rounded-[8px] border border-mii-gray-200 bg-white shadow-mii overflow-hidden">
                <div className="overflow-x-auto">
                    <table data-testid="product-table" className="w-full text-sm text-left">
                        <thead className="bg-mii-gray-50 text-mii-gray-700 font-semibold border-b border-mii-gray-200">
                            <tr>
                                <th className="px-4 py-3 w-[80px]">{t('form.image')}</th>
                                <th className="px-4 py-3">{t('name')}</th>
                                <th className="px-4 py-3">{t('category')}</th>
                                <th className="px-4 py-3">{t('price')}</th>
                                <th className="px-4 py-3 text-center">{tCommon('active')}</th>
                                <th className="px-4 py-3 text-right">{tCommon('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-mii-gray-600">
                                        {t('table.noProducts')}
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} data-testid="product-table-row" className="hover:bg-mii-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="relative h-10 w-10 rounded-[6px] overflow-hidden bg-mii-gray-100 border border-mii-gray-200">
                                                {product.image_url ? (
                                                    <Image
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-mii-gray-400">
                                                        <span className="text-xs">{t('table.noImg')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-mii-gray-900">
                                            {product.name}
                                            {product.description && (
                                                <p className="text-xs text-mii-gray-600 truncate max-w-[200px]">
                                                    {product.description}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-mii-gray-200 bg-mii-gray-50 text-mii-gray-800">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            ${product.price.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${product.active
                                                    ? "bg-[#ECFDF3] text-[#15803D] ring-1 ring-inset ring-[#BBF7D0]"
                                                    : "bg-[#FEF2F2] text-[#B91C1C] ring-1 ring-inset ring-[#FECACA]"
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
                                                    className="p-2 hover:bg-mii-gray-50 rounded-md text-mii-gray-600 hover:text-mii-blue transition-colors"
                                                    title={tCommon('edit')}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(product)}
                                                    data-testid="product-delete-button"
                                                    className="p-2 hover:bg-mii-gray-50 rounded-md text-mii-gray-600 hover:text-[#EF4444] transition-colors"
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
