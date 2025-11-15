'use client'

import { useState } from 'react'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
  presetColors?: string[]
}

const DEFAULT_PRESETS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#84CC16'  // Lime
]

export function ColorPicker({
  label,
  value,
  onChange,
  presetColors = DEFAULT_PRESETS
}: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value)

  const handlePresetClick = (color: string) => {
    setCustomColor(color)
    onChange(color)
  }

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setCustomColor(color)
    onChange(color)
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Preset colors */}
      <div className="grid grid-cols-5 gap-2">
        {presetColors.map((color, index) => (
          <button
            key={color}
            type="button"
            onClick={() => handlePresetClick(color)}
            className={`w-12 h-12 rounded-lg transition-all ${
              value === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select ${color}`}
            data-testid={`onboarding-preset-color-${index}`}
          />
        ))}
      </div>

      {/* Custom color picker */}
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={customColor}
          onChange={handleCustomChange}
          className="w-16 h-12 rounded-lg cursor-pointer border border-gray-300"
          data-testid={label.includes('primario') ? 'onboarding-primary-color-input' : 'onboarding-secondary-color-input'}
        />
        <input
          type="text"
          value={customColor}
          onChange={handleCustomChange}
          placeholder="#000000"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
          maxLength={7}
        />
      </div>

      {/* Preview */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg" data-testid="onboarding-color-preview">
        <div
          className="w-16 h-16 rounded-lg shadow-md"
          style={{ backgroundColor: value }}
        />
        <div>
          <p className="text-sm font-medium text-gray-700">Vista previa</p>
          <p className="text-xs text-gray-500">{value.toUpperCase()}</p>
        </div>
      </div>
    </div>
  )
}
