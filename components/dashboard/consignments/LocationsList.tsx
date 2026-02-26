'use client'

/**
 * LocationsList Component
 *
 * List view with search and filters for consignment locations
 * Includes empty state and loading skeleton
 */

import { MapPin, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ConsignmentLocation } from '@/lib/types/consignment'
import { LocationCard } from './LocationCard'

interface LocationsListProps {
  locations: ConsignmentLocation[]
  onLocationSelect: (locationId: string) => void
  onEdit: (location: ConsignmentLocation) => void
  onDelete: (locationId: string) => void
  onAddNew: () => void
}

export function LocationsList({
  locations,
  onLocationSelect,
  onEdit,
  onDelete,
  onAddNew,
}: LocationsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCity, setFilterCity] = useState<string | null>(null)

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchCity = !filterCity || loc.city === filterCity
      return matchSearch && matchCity
    })
  }, [locations, searchTerm, filterCity])

  const cities = useMemo(() => {
    return [...new Set(locations.map((l) => l.city))].sort()
  }, [locations])

  if (locations.length === 0) {
    return <LocationsListEmpty onAddNew={onAddNew} />
  }

  return (
    <div className="space-y-4" data-testid="location-list">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Ubicaciones</h2>
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-2 border-[var(--btn-primary-border)] rounded-lg hover:bg-[var(--btn-primary-hover-bg)] transition-colors shadow-[var(--btn-primary-shadow)]"
          data-testid="add-location-button"
        >
          <Plus className="h-4 w-4" />
          Nueva Ubicación
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] h-5 w-5" />
        <input
          type="text"
          placeholder="Buscar ubicación..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-[var(--color-border-subtle)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]"
          data-testid="location-search"
        />
      </div>

      {/* City Filter Pills */}
      {cities.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCity(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
              filterCity === null
                ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-[var(--btn-primary-border)]'
                : 'bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] border-[var(--btn-secondary-border)] hover:bg-[var(--btn-secondary-hover-bg)]'
            }`}
          >
            Todas
          </button>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setFilterCity(filterCity === city ? null : city)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
                filterCity === city
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-[var(--btn-primary-border)]'
                  : 'bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] border-[var(--btn-secondary-border)] hover:bg-[var(--btn-secondary-hover-bg)]'
              }`}
              data-testid={`city-filter-${city}`}
            >
              {city}
            </button>
          ))}
        </div>
      )}

      {/* Results Grid */}
      {filteredLocations.length > 0 ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          data-testid="location-grid"
        >
          {filteredLocations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              onView={onLocationSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-[var(--color-text-secondary)]">No se encontraron ubicaciones</p>
          <button
            onClick={() => {
              setSearchTerm('')
              setFilterCity(null)
            }}
            className="mt-4 text-[var(--color-text-primary)] hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
}

function LocationsListEmpty({ onAddNew }: { onAddNew: () => void }) {
  return (
    <div className="text-center py-16" data-testid="locations-empty-state">
      <div className="mx-auto w-16 h-16 bg-[var(--color-bg-secondary)] rounded-full flex items-center justify-center mb-4">
        <MapPin className="h-8 w-8 text-[var(--color-text-muted)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
        No hay ubicaciones registradas
      </h3>
      <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
        Crea tu primera ubicación para comenzar a gestionar tus consignaciones
      </p>
      <button
        onClick={onAddNew}
        className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-2 border-[var(--btn-primary-border)] rounded-lg hover:bg-[var(--btn-primary-hover-bg)] transition-colors font-medium shadow-[var(--btn-primary-shadow)]"
        data-testid="add-first-location-button"
      >
        <Plus className="h-5 w-5" />
        Crear Ubicación
      </button>
    </div>
  )
}

export function LocationsListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="bg-[var(--color-bg-secondary)] rounded-lg h-40 animate-pulse"
            data-testid={`location-skeleton-${i}`}
          />
        ))}
    </div>
  )
}
