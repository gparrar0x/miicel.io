'use client'

/**
 * LocationDetailClient Component
 *
 * Displays location details with assigned artworks
 * Allows assigning/removing artworks from this location
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ConsignmentLocation } from '@/lib/types/consignment'
import { ArrowLeft, MapPin, Edit, Package } from 'lucide-react'
import { SelectProductModal } from '@/components/dashboard/consignments/SelectProductModal'
import { toast } from 'sonner'

interface Artwork {
  id: number
  name: string
  image_url?: string
  price: number
  status: string
}

interface AssignmentResponse {
  id: number
  work_id: number
  status: string
  work: {
    id: number
    name: string
    price: number
    image_url?: string
  }
}

interface LocationDetailClientProps {
  tenantId: number
  tenantSlug: string
  locale: string
  location: ConsignmentLocation
  locationId: string
}

export function LocationDetailClient({
  tenantId,
  tenantSlug,
  locale,
  location,
  locationId,
}: LocationDetailClientProps) {
  const router = useRouter()
  const [assignedArtworks, setAssignedArtworks] = useState<Artwork[]>([])
  const [availableArtworks, setAvailableArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)

  useEffect(() => {
    fetchAssignedArtworks()
    fetchAvailableArtworks()
  }, [locationId])

  const fetchAssignedArtworks = async () => {
    try {
      const res = await fetch(
        `/api/dashboard/consignment-locations/${locationId}/artworks?tenant_id=${tenantId}`
      )
      if (!res.ok) throw new Error('Failed to fetch artworks')
      const data = await res.json()
      // Map API response to Artwork interface
      const artworks: Artwork[] = (data.items || []).map((item: AssignmentResponse) => ({
        id: item.work?.id || item.work_id,
        name: item.work?.name || 'Sin nombre',
        image_url: item.work?.image_url,
        price: item.work?.price || 0,
        status: item.status,
      }))
      setAssignedArtworks(artworks)
    } catch (error) {
      console.error('Error fetching assigned artworks:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableArtworks = async () => {
    try {
      // This would fetch artworks that are NOT assigned to this location
      // For now, using a placeholder
      setAvailableArtworks([])
    } catch (error) {
      console.error('Error fetching available artworks:', error)
    }
  }

  const handleAssignArtwork = async (
    productId: number,
    status: string,
    notes?: string
  ) => {
    try {
      const res = await fetch(
        `/api/dashboard/consignment-locations/${locationId}/artworks`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant_id: tenantId,
            work_id: productId,
            status,
            notes,
          }),
        }
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to assign artwork')
      }

      toast.success('Obra asignada exitosamente')
      fetchAssignedArtworks()
      setIsAssignModalOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al asignar obra')
      throw error
    }
  }

  const handleRemoveArtwork = async (artworkId: number) => {
    if (!confirm('¿Desasignar esta obra de la ubicación?')) return

    try {
      const res = await fetch(
        `/api/dashboard/consignment-locations/${locationId}/artworks/${artworkId}`,
        { method: 'DELETE' }
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to remove artwork')
      }

      toast.success('Obra desasignada')
      fetchAssignedArtworks()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al desasignar obra')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid={`location-detail-${locationId}`}>
      {/* Back Button */}
      <button
        onClick={() => router.push(`/${locale}/${tenantSlug}/dashboard/consignments`)}
        className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Consignaciones
      </button>

      {/* Location Header */}
      <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[var(--color-bg-secondary)] rounded-lg flex items-center justify-center">
              <MapPin className="h-6 w-6 text-[var(--color-text-primary)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{location.name}</h1>
              <p className="text-[var(--color-text-secondary)]">
                {location.city}, {location.country}
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              router.push(`/${locale}/${tenantSlug}/dashboard/consignments/locations/${locationId}/edit`)
            }
            className="flex items-center gap-2 px-4 py-2 bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] border-2 border-[var(--btn-secondary-border)] rounded-lg hover:bg-[var(--btn-secondary-hover-bg)] shadow-[var(--btn-secondary-shadow)]"
          >
            <Edit className="h-4 w-4" />
            Editar
          </button>
        </div>

        {location.address && (
          <p className="text-[var(--color-text-primary)] mb-2">
            <strong>Dirección:</strong> {location.address}
          </p>
        )}
        {location.description && (
          <p className="text-[var(--color-text-secondary)]">{location.description}</p>
        )}
        {location.contact_name && (
          <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
            <p className="text-sm text-[var(--color-text-secondary)]">
              <strong>Contacto:</strong> {location.contact_name}
              {location.contact_email && ` • ${location.contact_email}`}
              {location.contact_phone && ` • ${location.contact_phone}`}
            </p>
          </div>
        )}
      </div>

      {/* Assigned Artworks */}
      <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-[var(--color-text-secondary)]" />
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Obras en Esta Ubicación</h2>
          </div>
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="px-4 py-2 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-2 border-[var(--btn-primary-border)] rounded-lg hover:bg-[var(--btn-primary-hover-bg)] shadow-[var(--btn-primary-shadow)]"
            data-testid="assign-artwork-btn"
          >
            Asignar Obra
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-[var(--color-text-secondary)]">Cargando...</div>
        ) : assignedArtworks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-secondary)] mb-4">
              No hay obras asignadas a esta ubicación
            </p>
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="text-[var(--color-text-primary)] hover:underline"
            >
              Asignar primera obra
            </button>
          </div>
        ) : (
          <div className="space-y-3" data-testid="assigned-artworks-list">
            {assignedArtworks.map((artwork) => (
              <div
                key={artwork.id}
                className="flex items-center justify-between p-3 border border-[var(--color-border-subtle)] rounded-lg hover:bg-[var(--color-bg-secondary)]"
              >
                <div className="flex items-center gap-3">
                  {artwork.image_url && (
                    <img
                      src={artwork.image_url}
                      alt={artwork.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">{artwork.name}</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      ${artwork.price.toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveArtwork(artwork.id)}
                  className="px-3 py-1 text-sm text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded"
                  data-testid="remove-artwork-btn"
                >
                  Desasignar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Select Product Modal */}
      <SelectProductModal
        isOpen={isAssignModalOpen}
        tenantId={tenantId}
        locationId={locationId}
        locationName={location.name}
        onSelect={handleAssignArtwork}
        onClose={() => setIsAssignModalOpen(false)}
      />
    </div>
  )
}
