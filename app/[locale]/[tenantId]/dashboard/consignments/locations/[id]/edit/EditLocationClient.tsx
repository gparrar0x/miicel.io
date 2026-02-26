'use client'

/**
 * EditLocationClient Component
 *
 * Edit form for existing consignment location
 */

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LocationForm } from '@/components/dashboard/consignments/LocationForm'
import { useConsignmentLocations } from '@/lib/hooks/useConsignmentLocations'
import type { ConsignmentLocation, CreateLocationRequest } from '@/lib/types/consignment'

interface EditLocationClientProps {
  tenantId: number
  tenantSlug: string
  locale: string
  location: ConsignmentLocation
  locationId: string
}

export function EditLocationClient({
  tenantId,
  tenantSlug,
  locale,
  location,
  locationId,
}: EditLocationClientProps) {
  const router = useRouter()
  const { updateLocation } = useConsignmentLocations(tenantId)

  const handleSave = async (data: CreateLocationRequest) => {
    await updateLocation(locationId, data)
    toast.success('Ubicación actualizada exitosamente')
    router.push(`/${locale}/${tenantSlug}/dashboard/consignments/locations/${locationId}`)
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <button
        onClick={handleCancel}
        className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>
      <LocationForm isOpen={true} location={location} onSave={handleSave} onCancel={handleCancel} />
    </div>
  )
}
