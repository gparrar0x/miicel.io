"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Product, productSchema } from "@/lib/schemas/product"
import { X, Upload, Loader2 } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"

interface ProductFormProps {
    initialData?: Product
    onSubmit: (data: Product, imageFile?: File) => Promise<void>
    onCancel: () => void
    isLoading?: boolean
}

export function ProductForm({ initialData, onSubmit, onCancel, isLoading }: ProductFormProps) {
    const t = useTranslations('Products.form')
    const tCommon = useTranslations('Common')

    const [imagePreview, setImagePreview] = useState<string | null>(
        initialData?.image_url || null
    )
    const [imageFile, setImageFile] = useState<File | undefined>(undefined)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: initialData || {
            active: true,
            display_order: 0,
            price: 0,
        },
    })

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

    const onFormSubmit = async (data: Product) => {
        await onSubmit(data, imageFile)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h2 className="text-lg font-semibold">
                        {initialData ? t('edit') : t('new')}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Left Column: Image & Basic Info */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('image')}
                                </label>
                                <div className="relative flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden">
                                    {imagePreview ? (
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">{t('upload')}</span>
                                            </p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        data-testid="product-image-input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {tCommon('name')}
                                </label>
                                <input
                                    {...register("name")}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm text-[#1A1A1A]"
                                    placeholder={t('namePlaceholder')}
                                    data-testid="product-form-name"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t('categoryPlaceholder')}
                                </label>
                                <input
                                    {...register("category")}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm text-[#1A1A1A]"
                                    placeholder={t('categoryPlaceholder')}
                                    data-testid="product-form-category"
                                />
                                {errors.category && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.category.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Details */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t('description')}
                                </label>
                                <textarea
                                    {...register("description")}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm text-[#1A1A1A]"
                                    placeholder={t('descPlaceholder')}
                                    data-testid="product-form-description"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {tCommon('price')}
                                    </label>
                                    <div className="relative mt-1 rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-gray-500 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            {...register("price")}
                                            className="block w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm text-[#1A1A1A]"
                                            placeholder="0.00"
                                            data-testid="product-form-price"
                                        />
                                    </div>
                                    {errors.price && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.price.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t('stock')}
                                    </label>
                                    <input
                                        type="number"
                                        {...register("stock")}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm text-[#1A1A1A]"
                                        placeholder="0"
                                        data-testid="product-form-stock"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...register("active")}
                                    id="active"
                                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                    data-testid="product-active-checkbox"
                                />
                                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                                    {t('activeLabel')}
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                            data-testid="product-form-cancel-btn"
                        >
                            {tCommon('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            data-testid="product-form-submit"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? t('save') : t('create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
