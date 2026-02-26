'use client'

import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface DateRangePickerProps {
  value: { from: string; to: string }
  onChange: (range: { from: string; to: string }) => void
}

type Preset = 'today' | 'yesterday' | 'week' | 'month' | 'custom'

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [activePreset, setActivePreset] = useState<Preset>('today')
  const [showCustom, setShowCustom] = useState(false)

  const getDateRange = (preset: Preset): { from: string; to: string } => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (preset) {
      case 'today': {
        const dateStr = today.toISOString().split('T')[0]
        return { from: dateStr, to: dateStr }
      }
      case 'yesterday': {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const dateStr = yesterday.toISOString().split('T')[0]
        return { from: dateStr, to: dateStr }
      }
      case 'week': {
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        return {
          from: weekAgo.toISOString().split('T')[0],
          to: today.toISOString().split('T')[0],
        }
      }
      case 'month': {
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return {
          from: monthAgo.toISOString().split('T')[0],
          to: today.toISOString().split('T')[0],
        }
      }
      default:
        return value
    }
  }

  const handlePresetClick = (preset: Preset) => {
    setActivePreset(preset)
    if (preset === 'custom') {
      setShowCustom(true)
    } else {
      setShowCustom(false)
      const range = getDateRange(preset)
      onChange(range)
    }
  }

  const handleCustomDateChange = (field: 'from' | 'to', dateValue: string) => {
    const newRange = { ...value, [field]: dateValue }
    onChange(newRange)
  }

  return (
    <div className="space-y-2" data-testid="date-range-picker">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activePreset === 'today' ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => handlePresetClick('today')}
        >
          Hoy
        </Button>
        <Button
          variant={activePreset === 'yesterday' ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => handlePresetClick('yesterday')}
        >
          Ayer
        </Button>
        <Button
          variant={activePreset === 'week' ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => handlePresetClick('week')}
        >
          Semana
        </Button>
        <Button
          variant={activePreset === 'month' ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => handlePresetClick('month')}
        >
          Mes
        </Button>
        <Button
          variant={activePreset === 'custom' ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => handlePresetClick('custom')}
        >
          <CalendarIcon className="h-4 w-4 mr-1" />
          Rango
        </Button>
      </div>

      {showCustom && (
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Desde</label>
              <Input
                type="date"
                value={value.from}
                onChange={(e) => handleCustomDateChange('from', e.target.value)}
                max={value.to}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hasta</label>
              <Input
                type="date"
                value={value.to}
                onChange={(e) => handleCustomDateChange('to', e.target.value)}
                min={value.from}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
