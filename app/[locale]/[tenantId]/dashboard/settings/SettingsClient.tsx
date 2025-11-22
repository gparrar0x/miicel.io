"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/AdminSidebar"
import { toast } from "sonner"
import { Upload, Save, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { useRouter, usePathname } from '@/i18n/routing'
import { useLocale, useTranslations } from "next-intl"

interface SettingsClientProps {
    tenantId: number
    tenantSlug: string
    tenantName: string
    initialConfig: any
}

type Tab = 'general' | 'payment' | 'contact'

export function SettingsClient({ tenantId, tenantSlug, tenantName, initialConfig }: SettingsClientProps) {
    const router = useRouter()
    const pathname = usePathname()
    const currentLocale = useLocale()
    const t = useTranslations('Settings')
    const tCommon = useTranslations('Common')

    const [activeTab, setActiveTab] = useState<Tab>('general')
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState<any>(null)

    // General tab state
    const [businessName, setBusinessName] = useState(tenantName)
    const [heroSubtitle, setHeroSubtitle] = useState('')
    const [businessLocation, setBusinessLocation] = useState('')
    const [logoUrl, setLogoUrl] = useState<string | null>(null)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [bannerUrl, setBannerUrl] = useState<string | null>(null)
    const [bannerFile, setBannerFile] = useState<File | null>(null)
    const [primaryColor, setPrimaryColor] = useState('#3B82F6')
    const [secondaryColor, setSecondaryColor] = useState('#10B981')

    // Payment tab state
    const [mpAccessToken, setMpAccessToken] = useState('')
    const [showMpToken, setShowMpToken] = useState(false)

    // Contact tab state
    const [whatsapp, setWhatsapp] = useState('')
    const [email, setEmail] = useState('')
    const [instagram, setInstagram] = useState('')
    const [monday, setMonday] = useState({ open: '09:00', close: '18:00' })
    const [tuesday, setTuesday] = useState({ open: '09:00', close: '18:00' })
    const [wednesday, setWednesday] = useState({ open: '09:00', close: '18:00' })
    const [thursday, setThursday] = useState({ open: '09:00', close: '18:00' })
    const [friday, setFriday] = useState({ open: '09:00', close: '18:00' })
    const [saturday, setSaturday] = useState({ open: '09:00', close: '14:00' })
    const [sunday, setSunday] = useState({ open: '', close: '' })

    // Fetch settings on mount
    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch(`/api/settings?tenant_id=${tenantId}`)
            if (!res.ok) throw new Error('Failed to fetch settings')

            const data = await res.json()
            setSettings(data)

            // Populate form fields
            const config = data.config || {}
            const secureConfig = data.secure_config || {}

            // General
            setBusinessName(data.name || tenantName)
            setHeroSubtitle(config.business?.subtitle || config.subtitle || '')
            setBusinessLocation(config.business?.location || config.location || '')
            setLogoUrl(config.logo || config.logo_url || null)
            setBannerUrl(config.banner || config.banner_url || null)
            setPrimaryColor(config.colors?.primary || '#3B82F6')
            setSecondaryColor(config.colors?.secondary || '#10B981')

            // Payment
            setMpAccessToken(data.mp_access_token || '')

            // Contact
            setWhatsapp(secureConfig.whatsapp || '')
            setEmail(config.business?.email || '')
            setInstagram(config.business?.instagram || '')

            // Hours
            const hours = config.hours || {}
            setMonday(hours.monday || { open: '09:00', close: '18:00' })
            setTuesday(hours.tuesday || { open: '09:00', close: '18:00' })
            setWednesday(hours.wednesday || { open: '09:00', close: '18:00' })
            setThursday(hours.thursday || { open: '09:00', close: '18:00' })
            setFriday(hours.friday || { open: '09:00', close: '18:00' })
            setSaturday(hours.saturday || { open: '09:00', close: '14:00' })
            setSunday(hours.sunday || { open: '', close: '' })
        } catch (error) {
            console.error('Error fetching settings:', error)
            toast.error(t('saveError'))
        }
    }

    const handleLogoUpload = async () => {
        if (!logoFile) return logoUrl

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('file', logoFile)

            const res = await fetch(`/api/settings/upload-logo?tenant_id=${tenantId}`, {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Upload failed')
            }

            const { url } = await res.json()
            setLogoUrl(url)
            setLogoFile(null)
            toast.success('Logo uploaded')
            return url
        } catch (error) {
            console.error('Logo upload error:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to upload logo')
            return logoUrl
        } finally {
            setLoading(false)
        }
    }

    const handleBannerUpload = async () => {
        if (!bannerFile) return bannerUrl

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('file', bannerFile)

            const res = await fetch(`/api/settings/upload-banner?tenant_id=${tenantId}`, {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Upload failed')
            }

            const { url } = await res.json()
            setBannerUrl(url)
            setBannerFile(null)
            toast.success('Banner uploaded')
            return url
        } catch (error) {
            console.error('Banner upload error:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to upload banner')
            return bannerUrl
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            // Upload logo/banner first if there's a new file
            let finalLogoUrl = logoUrl
            let finalBannerUrl = bannerUrl
            if (logoFile) {
                finalLogoUrl = await handleLogoUpload()
            }
            if (bannerFile) {
                finalBannerUrl = await handleBannerUpload()
            }

            // Build config based on active tab
            let updateData: any = {}

            if (activeTab === 'general') {
                updateData.name = businessName
                updateData.config = {
                    ...(settings?.config || {}),
                    business_name: businessName,
                    subtitle: heroSubtitle || undefined,
                    location: businessLocation || undefined,
                    logo: finalLogoUrl,
                    logo_url: finalLogoUrl,
                    business: {
                        ...((settings?.config?.business as any) || {}),
                        name: businessName,
                        subtitle: heroSubtitle || undefined,
                        location: businessLocation || undefined
                    },
                    ...(finalBannerUrl ? { banner: finalBannerUrl, banner_url: finalBannerUrl } : {}),
                    colors: {
                        ...((settings?.config?.colors as any) || {}),
                        primary: primaryColor,
                        secondary: secondaryColor,
                        accent: primaryColor
                    }
                }
            } else if (activeTab === 'payment') {
                updateData.mp_access_token = mpAccessToken || null
            } else if (activeTab === 'contact') {
                updateData.config = {
                    ...(settings?.config || {}),
                    business: {
                        ...((settings?.config?.business as any) || {}),
                        email,
                        instagram
                    },
                    hours: {
                        monday,
                        tuesday,
                        wednesday,
                        thursday,
                        friday,
                        saturday,
                        sunday
                    }
                }
                updateData.secure_config = {
                    ...(settings?.secure_config || {}),
                    whatsapp
                }
            }

            console.log('Sending update request:', updateData)

            const res = await fetch(`/api/settings?tenant_id=${tenantId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            })

            console.log('Response status:', res.status, res.statusText)

            if (!res.ok) {
                const responseText = await res.text()
                console.error('API Error Response (raw):', responseText)
                console.error('Response Status:', res.status, res.statusText)
                console.error('Request Data:', JSON.stringify(updateData, null, 2))

                let error
                try {
                    error = JSON.parse(responseText)
                } catch (e) {
                    error = { error: responseText || 'Unknown error' }
                }

                throw new Error(error.error || `Save failed (${res.status}): ${res.statusText}`)
            }

            await fetchSettings()
            toast.success(t('saveSuccess'))
        } catch (error) {
            console.error('Save error:', error)
            const errorMessage = error instanceof Error ? error.message : t('saveError')
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleLanguageChange = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale })
    }

    const tabs = [
        { id: 'general' as Tab, label: t('general'), testId: 'tab-general' },
        { id: 'payment' as Tab, label: t('payment'), testId: 'tab-payment' },
        { id: 'contact' as Tab, label: t('contact'), testId: 'tab-contact' }
    ]

    return (
        <>
            <AdminSidebar tenant={tenantSlug} tenantName={tenantName} />
            <div className="lg:pl-64 min-h-screen bg-gray-50">
                <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 mt-16 lg:mt-0">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t('title')}</h1>
                        <p className="text-gray-500 mt-2">
                            {t('subtitle')}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="border-b border-gray-200">
                            <nav className="flex -mb-px">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        data-testid={tab.testId}
                                        className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="p-6">
                            {/* General Tab */}
                            {activeTab === 'general' && (
                                <div className="space-y-6" data-testid="general-tab-content">
                                    {/* Language Selector */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('language')}
                                        </label>
                                        <select
                                            value={currentLocale}
                                            onChange={(e) => handleLanguageChange(e.target.value)}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            data-testid="select-language"
                                        >
                                            <option value="es">Español</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>

                                    {/* Business Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('businessName')}
                                        </label>
                                        <input
                                            type="text"
                                            value={businessName}
                                            onChange={(e) => setBusinessName(e.target.value)}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            data-testid="input-business-name"
                                        />
                                    </div>

                                    {/* Hero subtitle & Location */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('heroTitle')}
                                            </label>
                                            <input
                                                type="text"
                                                value={heroSubtitle}
                                                onChange={(e) => setHeroSubtitle(e.target.value)}
                                                placeholder="Deliciosa comida Venezolana"
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                data-testid="input-hero-title"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('storeLocation')}
                                            </label>
                                            <input
                                                type="text"
                                                value={businessLocation}
                                                onChange={(e) => setBusinessLocation(e.target.value)}
                                                placeholder="Centenario - Neuquén"
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                data-testid="input-store-location"
                                            />
                                        </div>
                                    </div>

                                    {/* Logo & Banner */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Logo */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('logo')}
                                            </label>
                                            {logoUrl && !logoFile && (
                                                <div className="mb-4">
                                                    <Image
                                                        src={logoUrl}
                                                        alt="Current logo"
                                                        width={120}
                                                        height={120}
                                                        className="rounded-lg border"
                                                    />
                                                </div>
                                            )}
                                            {logoFile && (
                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-600">
                                                        {t('newFile')} {logoFile.name}
                                                    </p>
                                                </div>
                                            )}
                                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                                                <Upload className="h-4 w-4" />
                                                {t('chooseLogo')}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) setLogoFile(file)
                                                    }}
                                                    className="hidden"
                                                    data-testid="input-logo-file"
                                                />
                                            </label>
                                        </div>

                                        {/* Banner */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('banner')}
                                            </label>
                                            {bannerUrl && !bannerFile && (
                                                <div className="mb-4">
                                                    <Image
                                                        src={bannerUrl}
                                                        alt="Current banner"
                                                        width={320}
                                                        height={120}
                                                        className="rounded-lg border object-cover"
                                                    />
                                                </div>
                                            )}
                                            {bannerFile && (
                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-600">
                                                        {t('newFile')} {bannerFile.name}
                                                    </p>
                                                </div>
                                            )}
                                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                                                <Upload className="h-4 w-4" />
                                                {t('chooseBanner')}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) setBannerFile(file)
                                                    }}
                                                    className="hidden"
                                                    data-testid="input-banner-file"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Colors */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('primaryColor')}
                                            </label>
                                            <input
                                                type="color"
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                className="h-10 w-full rounded border border-gray-300"
                                                data-testid="input-primary-color"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('secondaryColor')}
                                            </label>
                                            <input
                                                type="color"
                                                value={secondaryColor}
                                                onChange={(e) => setSecondaryColor(e.target.value)}
                                                className="h-10 w-full rounded border border-gray-300"
                                                data-testid="input-secondary-color"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment Tab */}
                            {activeTab === 'payment' && (
                                <div className="space-y-6" data-testid="payment-tab-content">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('mpToken')}
                                        </label>
                                        <p className="text-sm text-gray-500 mb-3">
                                            {t('mpTokenDesc')}
                                        </p>
                                        <div className="relative">
                                            <input
                                                type={showMpToken ? "text" : "password"}
                                                value={mpAccessToken}
                                                onChange={(e) => setMpAccessToken(e.target.value)}
                                                placeholder="APP_USR-..."
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                data-testid="input-mp-token"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowMpToken(!showMpToken)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showMpToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Contact Tab */}
                            {activeTab === 'contact' && (
                                <div className="space-y-6" data-testid="contact-tab-content">
                                    {/* Contact Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('whatsapp')}
                                            </label>
                                            <input
                                                type="tel"
                                                value={whatsapp}
                                                onChange={(e) => setWhatsapp(e.target.value)}
                                                placeholder="+54 11 1234 5678"
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                data-testid="input-whatsapp"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('email')}
                                            </label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="contact@business.com"
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                data-testid="input-email"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('instagram')}
                                            </label>
                                            <input
                                                type="text"
                                                value={instagram}
                                                onChange={(e) => setInstagram(e.target.value)}
                                                placeholder="@yourbusiness"
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                data-testid="input-instagram"
                                            />
                                        </div>
                                    </div>

                                    {/* Business Hours */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-3">{t('hours')}</h3>
                                        <div className="space-y-3">
                                            {[
                                                { day: 'monday', state: monday, setState: setMonday },
                                                { day: 'tuesday', state: tuesday, setState: setTuesday },
                                                { day: 'wednesday', state: wednesday, setState: setWednesday },
                                                { day: 'thursday', state: thursday, setState: setThursday },
                                                { day: 'friday', state: friday, setState: setFriday },
                                                { day: 'saturday', state: saturday, setState: setSaturday },
                                                { day: 'sunday', state: sunday, setState: setSunday }
                                            ].map(({ day, state, setState }) => (
                                                <div key={day} className="flex items-center gap-4">
                                                    <label className="w-24 text-sm text-gray-700">{t(`days.${day}`)}</label>
                                                    <input
                                                        type="time"
                                                        value={state.open}
                                                        onChange={(e) => setState({ ...state, open: e.target.value })}
                                                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-900"
                                                    />
                                                    <span className="text-sm text-gray-500">to</span>
                                                    <input
                                                        type="time"
                                                        value={state.close}
                                                        onChange={(e) => setState({ ...state, close: e.target.value })}
                                                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-900"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Save Button */}
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    data-testid="btn-save-settings"
                                >
                                    <Save className="h-4 w-4" />
                                    {loading ? t('saving') : t('save')}
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}
