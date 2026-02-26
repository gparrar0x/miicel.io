import { z } from 'zod'

// Product form schema for onboarding
export const productSchema = z.object({
  name: z.string().min(2, 'Nombre muy corto').max(100, 'Nombre muy largo'),
  price: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  category: z.string().min(2, 'Categoria requerida'),
  stock: z.number().int().min(0, 'Stock invalido'),
  image: z.any().optional(), // Accept any file input type (File or FileList)
})

export type ProductFormData = z.infer<typeof productSchema>

// Onboarding complete data schema
export const onboardingSchema = z.object({
  logo: z.string().url('Logo URL invalida'),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color invalido'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color invalido'),
  products: z.array(productSchema).min(1, 'Debes agregar al menos un producto'),
})

export type OnboardingData = z.infer<typeof onboardingSchema>
