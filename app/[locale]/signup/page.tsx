'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema, type SignupFormData } from '@/lib/schemas/signup'
import { toast } from 'sonner'
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur'
  })

  const slugValue = watch('slug')

  // Debounced slug validation
  const validateSlug = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null)
      return
    }

    setCheckingSlug(true)
    try {
      const res = await fetch('/api/signup/validate-slug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      })

      const data = await res.json()
      setSlugAvailable(data.available)
    } catch (error) {
      console.error('Error validating slug:', error)
      setSlugAvailable(null)
    } finally {
      setCheckingSlug(false)
    }
  }

  // Debounce slug validation with useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (slugValue) validateSlug(slugValue)
    }, 500)
    return () => clearTimeout(timer)
  }, [slugValue])

  const onSubmit = async (data: SignupFormData) => {
    if (slugAvailable === false) {
      toast.error('El slug no esta disponible')
      return
    }

    setSubmitting(true)
    try {
      // Step 1: Create account via API
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Error al crear cuenta')
      }

      const result = await res.json()

      // Step 2: Sign in the user automatically
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (signInError || !signInData.session) {
        console.error('Auto sign-in failed:', signInError)
        throw new Error('Cuenta creada pero error al iniciar sesion. Por favor inicia sesion manualmente.')
      }

      console.log('✅ User signed in:', signInData.user.id)
      console.log('✅ Session established:', signInData.session.access_token.substring(0, 20) + '...')

      toast.success('Cuenta creada exitosamente!')

      // Small delay to ensure cookies are written
      await new Promise(resolve => setTimeout(resolve, 500))

      router.push(`/signup/${result.tenantSlug}/onboarding`)
    } catch (error) {
      console.error('Signup error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear cuenta')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crea tu tienda</h1>
          <p className="text-gray-600">Comienza a vender en minutos</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="signup-form">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tu@email.com"
              data-testid="signup-email-input"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600" data-testid="signup-email-error">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contrasena
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                placeholder="********"
                data-testid="signup-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                data-testid="signup-toggle-password-button"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600" data-testid="signup-password-error">{errors.password.message}</p>
            )}
          </div>

          {/* Business Name */}
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Negocio
            </label>
            <input
              id="businessName"
              type="text"
              {...register('businessName')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mi Tienda"
              data-testid="signup-businessname-input"
            />
            {errors.businessName && (
              <p className="mt-1 text-sm text-red-600" data-testid="signup-businessname-error">{errors.businessName.message}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              URL de tu tienda
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  id="slug"
                  type="text"
                  {...register('slug')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="mi-tienda"
                  data-testid="signup-slug-input"
                  onChange={(e) => {
                    e.target.value = e.target.value.toLowerCase()
                    setSlugAvailable(null)
                  }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checkingSlug && <Loader2 size={20} className="animate-spin text-gray-400" data-testid="signup-slug-loading-spinner" />}
                  {!checkingSlug && slugAvailable === true && (
                    <CheckCircle size={20} className="text-green-500" data-testid="signup-slug-available-icon" />
                  )}
                  {!checkingSlug && slugAvailable === false && (
                    <XCircle size={20} className="text-red-500" data-testid="signup-slug-unavailable-icon" />
                  )}
                </div>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              tutienda.com/<span className="font-medium">{slugValue || 'slug'}</span>
            </p>
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600" data-testid="signup-slug-error">{errors.slug.message}</p>
            )}
            {slugAvailable === false && (
              <p className="mt-1 text-sm text-red-600" data-testid="signup-slug-error">Este slug no esta disponible</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || slugAvailable === false}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            data-testid="signup-submit-button"
          >
            {submitting ? (
              <>
                <Loader2 size={20} className="animate-spin" data-testid="signup-submit-loading-spinner" />
                Creando cuenta...
              </>
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Ya tienes cuenta?{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium" data-testid="signup-login-link">
            Inicia sesion
          </a>
        </p>
      </div>
    </div>
  )
}
