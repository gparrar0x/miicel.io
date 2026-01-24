'use client'

/**
 * NewLocationClient Component
 *
 * Form page for creating a new consignment location
 */

import { useRouter } from 'next/navigation'
import { useConsignmentLocations } from '@/lib/hooks/useConsignmentLocations'
import { LocationForm } from '@/components/dashboard/consignments/LocationForm'
import { CreateLocationRequest } from '@/lib/types/consignment'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

interface NewLocationClientProps {
  tenantId: number
  tenantSlug: string
}

export function NewLocationClient({ tenantId, tenantSlug }: NewLocationClientProps) {
  const router = useRouter()
  const { createLocation } = useConsignmentLocations(tenantId)

  const handleSave = async (data: CreateLocationRequest) => {
    try {
      const newLocation = await createLocation(data)
      toast.success('Ubicación creada exitosamente')
      router.push(`/${tenantSlug}/dashboard/consignments`)
    } catch (error) {
      throw error // Let form handle error display
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <button
        onClick={handleCancel}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>
      <LocationForm isOpen={true} onSave={handleSave} onCancel={handleCancel} />
    </div>
  )
}
