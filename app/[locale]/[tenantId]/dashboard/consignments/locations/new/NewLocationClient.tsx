'use client'

/**
 * NewLocationClient Component
 *
 * Form page for creating a new consignment location
 */

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LocationForm } from '@/components/dashboard/consignments/LocationForm'
import { useConsignmentLocations } from '@/lib/hooks/useConsignmentLocations'
import type { CreateLocationRequest } from '@/lib/types/consignment'

interface NewLocationClientProps {
  tenantId: number
  tenantSlug: string
}

export function NewLocationClient({ tenantId, tenantSlug }: NewLocationClientProps) {
  const router = useRouter()
  const { createLocation } = useConsignmentLocations(tenantId)

  const handleSave = async (data: CreateLocationRequest) => {
    const _newLocation = await createLocation(data)
    toast.success('Ubicación creada exitosamente')
    router.push(`/${tenantSlug}/dashboard/consignments`)
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
      <LocationForm isOpen={true} onSave={handleSave} onCancel={handleCancel} />
    </div>
  )
}
