'use client'

import { CheckCircle, Loader2, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ColorPicker } from '@/components/onboarding/ColorPicker'
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader'
import { ProductForm } from '@/components/onboarding/ProductForm'
import { createClient } from '@/lib/supabase/client'

interface Product {
  name: string
  price: number
  category: string
  stock: number
  imagePreview?: string
}

interface OnboardingData {
  logoUrl?: string
  logoFile?: File
  bannerUrl?: string
  bannerFile?: File
  primaryColor: string
  secondaryColor: string
  heroSubtitle: string
  location: string
  openingTime: string
  closingTime: string
  products: Product[]
}

const STEPS = [
  { id: 1, title: 'Sube tu logo', description: 'Personaliza tu tienda con tu marca' },
  { id: 2, title: 'Elige tus colores', description: 'Define la identidad visual' },
  { id: 3, title: 'Agrega productos', description: 'Carga tu catalogo inicial' },
  { id: 4, title: 'Vista previa', description: 'Revisa como se vera tu tienda' },
  { id: 5, title: 'Activar tienda', description: 'Listo para vender' },
]

export default function OnboardingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [data, setData] = useState<OnboardingData>({
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    heroSubtitle: '',
    location: '',
    openingTime: '11:00',
    closingTime: '00:30',
    products: [],
  })

  // Debug: Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        console.log('✅ Onboarding: Session found', session.user.id)
      } else {
        console.warn('⚠️ Onboarding: No session found')
      }
    }
    checkSession()
  }, [supabase])

  // Step 1: Logo Upload
  const handleLogoUpload = async (file: File) => {
    if (!file) return

    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 2MB')
      return
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Solo se permiten archivos JPG o PNG')
      return
    }

    setData({ ...data, logoFile: file, logoUrl: URL.createObjectURL(file) })
    toast.success('Logo cargado correctamente')
  }

  // Step 1: Banner Upload
  const handleBannerUpload = async (file: File) => {
    if (!file) return

    // Validate file
    if (file.size > 4 * 1024 * 1024) {
      toast.error('El banner debe ser menor a 4MB')
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Solo se permiten archivos JPG, PNG o WEBP')
      return
    }

    setData({ ...data, bannerFile: file, bannerUrl: URL.createObjectURL(file) })
    toast.success('Banner cargado correctamente')
  }

  // Upload logo to Supabase Storage
  const uploadLogo = async (): Promise<string | null> => {
    if (!data.logoFile) return data.logoUrl || null

    try {
      // Get current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        console.error('Session error:', sessionError)
        console.log('No session found. User needs to log in.')
        throw new Error('User not authenticated')
      }

      const user = session.user

      // Path must be: {userId}/filename for RLS policy
      const fileName = `${user.id}/${slug}-${Date.now()}.${data.logoFile.type.split('/')[1]}`
      const { data: uploadData, error } = await supabase.storage
        .from('logos')
        .upload(fileName, data.logoFile)

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from('logos').getPublicUrl(uploadData.path)

      return publicUrl
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Error al subir el logo')
      return null
    }
  }

  // Upload banner to Supabase Storage
  const uploadBanner = async (): Promise<string | null> => {
    if (!data.bannerFile) return data.bannerUrl || null

    try {
      // Get current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        console.error('Session error (banner):', sessionError)
        console.log('No session found. User needs to log in.')
        throw new Error('User not authenticated')
      }

      const user = session.user

      // Path must be: {userId}/filename for RLS policy
      const fileName = `${user.id}/${slug}-banner-${Date.now()}.${data.bannerFile.type.split('/')[1]}`
      const { data: uploadData, error } = await supabase.storage
        .from('logos')
        .upload(fileName, data.bannerFile)

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from('logos').getPublicUrl(uploadData.path)

      return publicUrl
    } catch (error) {
      console.error('Error uploading banner:', error)
      toast.error('Error al subir el banner')
      return null
    }
  }

  // Handle final activation
  const handleActivate = async () => {
    console.log('🚀 [ACTIVATION START] Starting activation for tenant:', slug)
    setLoading(true)
    try {
      // Upload logo first (optional - won't block activation if it fails)
      console.log('📤 [LOGO UPLOAD] Attempting logo upload...')
      let logoUrl: string | null = null
      let bannerUrl: string | null = null

      try {
        // Add timeout to uploadLogo to prevent infinite hang
        const uploadPromise = uploadLogo()
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => {
            console.warn('⏱️ [LOGO UPLOAD] Timeout after 3 seconds')
            resolve(null)
          }, 3000)
        })

        logoUrl = await Promise.race([uploadPromise, timeoutPromise])
        console.log('📤 [LOGO UPLOAD] Logo URL:', logoUrl)
      } catch (uploadError) {
        console.warn('⚠️ [LOGO UPLOAD] Failed to upload logo, continuing without it:', uploadError)
        // Continue activation without logo - it's optional
      }

      // Upload banner (optional - won't block activation if it fails)
      console.log('📤 [BANNER UPLOAD] Attempting banner upload...')
      try {
        const uploadPromise = uploadBanner()
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => {
            console.warn('⏱️ [BANNER UPLOAD] Timeout after 3 seconds')
            resolve(null)
          }, 3000)
        })

        bannerUrl = await Promise.race([uploadPromise, timeoutPromise])
        console.log('📤 [BANNER UPLOAD] Banner URL:', bannerUrl)
      } catch (uploadError) {
        console.warn(
          '⚠️ [BANNER UPLOAD] Failed to upload banner, continuing without it:',
          uploadError,
        )
      }

      // Format products for API
      const formattedProducts = data.products.map((p) => ({
        name: p.name,
        price: p.price,
        category: p.category || 'General',
        stock: p.stock,
        active: true,
        image_url: p.imagePreview, // Will be replaced by actual upload in future
      }))

      console.log('📦 [PRODUCTS] Formatted products:', formattedProducts.length)

      const payload = {
        config: {
          ...(logoUrl && { logo: logoUrl }), // Only include logo if it exists
          ...(bannerUrl && { banner: bannerUrl }), // Only include banner if it exists
          colors: {
            primary: data.primaryColor,
            secondary: data.secondaryColor,
          },
          business_name: slug,
          ...(data.heroSubtitle ? { subtitle: data.heroSubtitle } : {}),
          ...(data.location ? { location: data.location } : {}),
          hours: {
            monday: { open: data.openingTime, close: data.closingTime },
            tuesday: { open: data.openingTime, close: data.closingTime },
            wednesday: { open: data.openingTime, close: data.closingTime },
            thursday: { open: data.openingTime, close: data.closingTime },
            friday: { open: data.openingTime, close: data.closingTime },
            saturday: { open: data.openingTime, close: data.closingTime },
            sunday: { open: data.openingTime, close: data.closingTime },
          },
        },
        products: formattedProducts,
      }

      console.log('📡 [API CALL] Sending PATCH to /api/onboarding/save with payload:', payload)

      // Save onboarding data
      const res = await fetch('/api/onboarding/save', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      console.log('📡 [API RESPONSE] Status:', res.status, res.statusText)

      if (!res.ok) {
        const error = await res.json()
        console.error('❌ [API ERROR] Response:', error)
        throw new Error(error.error || 'Error al guardar configuracion')
      }

      const responseData = await res.json()
      console.log('✅ [API SUCCESS] Response:', responseData)

      toast.success('¡Tienda activada! Redirigiendo al panel...')

      console.log('🔄 [REDIRECT] Redirecting to dashboard:', `/${slug}/dashboard`)

      // Wait a moment for database to propagate changes
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Use router.push with timestamp to bypass cache
      // The middleware will check for _t param and use shorter cache TTL
      router.push(`/${slug}/dashboard?_t=${Date.now()}`)
    } catch (error) {
      console.error('❌ [ACTIVATION ERROR]', error)
      toast.error(error instanceof Error ? error.message : 'Error al activar tienda')
    } finally {
      setLoading(false)
      console.log('🏁 [ACTIVATION END] Process finished')
    }
  }

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return true // Logo is optional
      case 2:
        return !!data.primaryColor && !!data.secondaryColor
      case 3:
        return data.products.length > 0
      case 4:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (canGoNext() && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="onboarding-container">
      <OnboardingHeader
        currentStep={currentStep}
        totalSteps={STEPS.length}
        stepTitle={STEPS[currentStep - 1].title}
        onBack={handleBack}
        canGoBack={currentStep > 1}
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-gray-600 mb-8" data-testid={`onboarding-step${currentStep}-description`}>
          {STEPS[currentStep - 1].description}
        </p>

        {/* Step 1: Logo Upload */}
        {currentStep === 1 && (
          <div
            className="bg-white rounded-xl p-8 shadow-sm"
            data-testid="onboarding-step1-container"
          >
            <h1 className="text-2xl font-bold mb-6" data-testid="onboarding-step1-title">
              Sube tu logo
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Logo uploader */}
              <div className="max-w-md mx-auto w-full">
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer">
                    {data.logoUrl ? (
                      <div className="space-y-4">
                        <img
                          src={data.logoUrl}
                          alt="Logo preview"
                          className="max-w-full h-48 mx-auto object-contain"
                          data-testid="onboarding-logo-preview"
                        />
                        <p className="text-sm text-gray-600">Click para cambiar</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload size={48} className="mx-auto text-gray-400" />
                        <div>
                          <p className="text-lg font-medium text-gray-900">Sube tu logo</p>
                          <p className="text-sm text-gray-500 mt-1">JPG o PNG, max 2MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleLogoUpload(file)
                    }}
                    className="hidden"
                    data-testid="onboarding-logo-input"
                  />
                </label>
              </div>

              {/* Banner uploader */}
              <div className="max-w-md mx-auto w-full">
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                    {data.bannerUrl ? (
                      <div className="space-y-4">
                        <img
                          src={data.bannerUrl}
                          alt="Banner preview"
                          className="w-full h-40 object-cover rounded-lg"
                          data-testid="onboarding-banner-preview"
                        />
                        <p className="text-sm text-gray-600">Click para cambiar banner</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload size={40} className="mx-auto text-gray-400" />
                        <div>
                          <p className="text-lg font-medium text-gray-900">Sube tu banner</p>
                          <p className="text-sm text-gray-500 mt-1">
                            JPG, PNG o WEBP, max 4MB, formato horizontal
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleBannerUpload(file)
                    }}
                    className="hidden"
                    data-testid="onboarding-banner-input"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Color Picker */}
        {currentStep === 2 && (
          <div
            className="bg-white rounded-xl p-8 shadow-sm space-y-8"
            data-testid="onboarding-step2-container"
          >
            <h1 className="text-2xl font-bold mb-6" data-testid="onboarding-step2-title">
              Elige tus colores
            </h1>
            <ColorPicker
              label="Color primario"
              value={data.primaryColor}
              onChange={(color) => setData({ ...data, primaryColor: color })}
            />
            <ColorPicker
              label="Color secundario"
              value={data.secondaryColor}
              onChange={(color) => setData({ ...data, secondaryColor: color })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frase principal (Hero)
                </label>
                <input
                  type="text"
                  value={data.heroSubtitle}
                  onChange={(e) => setData({ ...data, heroSubtitle: e.target.value })}
                  placeholder="Deliciosa comida Venezolana"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación (ciudad / barrio)
                </label>
                <input
                  type="text"
                  value={data.location}
                  onChange={(e) => setData({ ...data, location: e.target.value })}
                  placeholder="Centenario - Neuquén"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horario de apertura
                </label>
                <input
                  type="time"
                  value={data.openingTime}
                  onChange={(e) => setData({ ...data, openingTime: e.target.value })}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horario de cierre
                </label>
                <input
                  type="time"
                  value={data.closingTime}
                  onChange={(e) => setData({ ...data, closingTime: e.target.value })}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Add Products */}
        {currentStep === 3 && (
          <div
            className="bg-white rounded-xl p-8 shadow-sm"
            data-testid="onboarding-step3-container"
          >
            <h1 className="text-2xl font-bold mb-6" data-testid="onboarding-step3-title">
              Agrega productos
            </h1>
            <ProductForm
              products={data.products}
              onProductsChange={(products) => setData({ ...data, products })}
            />
          </div>
        )}

        {/* Step 4: Preview */}
        {currentStep === 4 && (
          <div className="space-y-6" data-testid="onboarding-step4-container">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6" data-testid="onboarding-step4-title">
                Vista previa de tu tienda
              </h2>

              {/* Mock storefront preview */}
              <div className="border rounded-lg overflow-hidden">
                {/* Header */}
                <div
                  className="p-6 text-white"
                  style={{
                    backgroundColor: data.primaryColor,
                    backgroundImage: data.bannerUrl ? `url(${data.bannerUrl})` : undefined,
                    backgroundSize: data.bannerUrl ? 'cover' : undefined,
                    backgroundPosition: data.bannerUrl ? 'center' : undefined,
                  }}
                  data-testid="onboarding-preview-header"
                >
                  <div className="flex items-center gap-4">
                    {data.logoUrl && (
                      <img
                        src={data.logoUrl}
                        alt="Logo"
                        className="h-12 w-auto bg-white rounded p-1"
                        data-testid="onboarding-preview-logo"
                      />
                    )}
                    <h1 className="text-2xl font-bold capitalize">{slug}</h1>
                  </div>
                </div>

                {/* Products grid */}
                <div className="p-6 bg-gray-50" data-testid="onboarding-preview-products">
                  <h3 className="font-bold text-lg mb-4">Productos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.products.slice(0, 3).map((product, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg overflow-hidden shadow-sm"
                        data-testid={`onboarding-preview-product-${index}`}
                      >
                        {product.imagePreview && (
                          <img
                            src={product.imagePreview}
                            alt={product.name}
                            className="w-full h-32 object-cover"
                            data-testid={`onboarding-preview-product-image-${index}`}
                          />
                        )}
                        <div className="p-4">
                          <h4
                            className="font-medium"
                            data-testid={`onboarding-preview-product-name-${index}`}
                          >
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-600">{product.category}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold text-lg">${product.price}</span>
                            <button
                              className="px-3 py-1 text-sm rounded text-white"
                              style={{ backgroundColor: data.secondaryColor }}
                              data-testid={`onboarding-preview-product-add-button-${index}`}
                            >
                              Agregar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {data.products.length > 3 && (
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      +{data.products.length - 3} productos mas
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Activate */}
        {currentStep === 5 && (
          <div
            className="bg-white rounded-xl p-8 shadow-sm"
            data-testid="onboarding-step5-container"
          >
            <div className="max-w-md mx-auto text-center space-y-6">
              <CheckCircle size={64} className="mx-auto text-green-500" />
              <div>
                <h2
                  className="text-2xl font-bold text-gray-900 mb-2"
                  data-testid="onboarding-step5-title"
                >
                  Todo listo!
                </h2>
                <p className="text-gray-600" data-testid="onboarding-step5-description">
                  Tu tienda esta configurada y lista para activarse
                </p>
              </div>

              <div
                className="bg-gray-50 rounded-lg p-6 space-y-3 text-left"
                data-testid="onboarding-summary"
              >
                <h3 className="font-medium text-gray-900">Resumen:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Logo:</span>
                    <span className="font-medium" data-testid="onboarding-summary-logo">
                      {data.logoUrl ? 'Cargado' : 'Opcional'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Colores:</span>
                    <div className="flex gap-2" data-testid="onboarding-summary-colors">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: data.primaryColor }}
                        data-testid="onboarding-summary-primary-color"
                      />
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: data.secondaryColor }}
                        data-testid="onboarding-summary-secondary-color"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Productos:</span>
                    <span className="font-medium" data-testid="onboarding-summary-product-count">
                      {data.products.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">URL:</span>
                    <span className="font-medium" data-testid="onboarding-summary-url">
                      tutienda.com/{slug}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleActivate}
                disabled={loading}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                data-testid="onboarding-activate-button"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={20}
                      className="animate-spin"
                      data-testid="onboarding-activate-loading-spinner"
                    />
                    Activando tienda...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Activar & Lanzar Tienda
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        {currentStep < STEPS.length && (
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={currentStep === 1}
              data-testid="onboarding-back-button"
            >
              Atras
            </button>
            <button
              onClick={handleNext}
              disabled={!canGoNext()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              data-testid="onboarding-continue-button"
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
