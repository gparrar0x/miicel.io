'use client'

import type { ModifierGroup as ModifierGroupType } from '@/types/commerce'

interface ModifierGroupProps {
  group: ModifierGroupType
  selected: string[]
  onChange: (optionId: string, checked: boolean) => void
  error?: boolean
}

function formatDelta(delta: number, currency: string): string {
  if (delta === 0) return 'Gratis'
  const sign = delta > 0 ? '+' : ''
  return `${sign}$${Math.abs(delta).toLocaleString('es-CL')}`
}

export function ModifierGroup({ group, selected, onChange, error = false }: ModifierGroupProps) {
  const isRadio = group.max_selections === 1
  const options = group.options?.filter((o) => o.active) ?? []

  return (
    <div data-testid={`modifier-group-${group.id}`} className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{group.name}</h4>
        <span className="text-xs text-gray-500">
          {group.min_selections > 0 ? (
            <span className="text-red-500 font-medium">Requerido</span>
          ) : (
            'Opcional'
          )}
          {group.max_selections > 1 && ` · max ${group.max_selections}`}
        </span>
      </div>

      {error && (
        <p
          data-testid={`modifier-group-${group.id}-error`}
          className="text-xs text-red-500 font-medium"
        >
          Selecciona al menos {group.min_selections} opción
          {group.min_selections > 1 ? 'es' : ''}
        </p>
      )}

      <div className="space-y-1">
        {options.map((option) => {
          const isChecked = selected.includes(option.id)
          const inputType = isRadio ? 'radio' : 'checkbox'
          const isDisabled =
            !isRadio &&
            !isChecked &&
            group.max_selections > 0 &&
            selected.length >= group.max_selections

          return (
            <label
              key={option.id}
              data-testid={`modifier-option-${option.id}`}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                isChecked
                  ? 'border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_8%,white)]'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-3">
                <input
                  type={inputType}
                  name={isRadio ? `modifier-radio-${group.id}` : undefined}
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={(e) => onChange(option.id, e.target.checked)}
                  className="w-4 h-4 accent-[var(--color-primary)]"
                  aria-label={option.name}
                />
                <span className="text-sm text-gray-800">{option.name}</span>
              </div>
              <span
                data-testid={`modifier-option-${option.id}-price`}
                className={`text-sm font-semibold ${
                  option.price_delta > 0
                    ? 'text-[var(--color-primary)]'
                    : option.price_delta < 0
                      ? 'text-green-600'
                      : 'text-gray-500'
                }`}
              >
                {formatDelta(option.price_delta, 'CLP')}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
