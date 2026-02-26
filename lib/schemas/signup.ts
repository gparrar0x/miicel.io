import { z } from 'zod'

// Signup form schema
export const signupSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z
    .string()
    .min(8, 'La contrasena debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayuscula')
    .regex(/[a-z]/, 'Debe contener al menos una minuscula')
    .regex(/[0-9]/, 'Debe contener al menos un numero'),
  businessName: z
    .string()
    .min(2, 'El nombre del negocio es muy corto')
    .max(50, 'El nombre es muy largo'),
  slug: z
    .string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .max(30, 'El slug es muy largo')
    .regex(/^[a-z0-9-]+$/, 'Solo se permiten letras minusculas, numeros y guiones')
    .regex(/^[a-z]/, 'Debe comenzar con una letra')
    .regex(/[^-]$/, 'No puede terminar con un guion'),
})

export type SignupFormData = z.infer<typeof signupSchema>

// Slug validation response
export const slugValidationSchema = z.object({
  available: z.boolean(),
  suggestions: z.array(z.string()).optional(),
})

export type SlugValidation = z.infer<typeof slugValidationSchema>
