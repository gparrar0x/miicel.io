'use client'

import { ModifierGroup } from '@/components/gastronomy/atoms/ModifierGroup'
import { Separator } from '@/components/ui/separator'
import type { ModifierGroup as ModifierGroupType } from '@/types/commerce'

interface ModifierGroupListProps {
  groups: ModifierGroupType[]
  selectedMap: Record<string, string[]>
  errorMap: Record<string, boolean>
  onChange: (groupId: string, optionId: string, checked: boolean) => void
}

export function ModifierGroupList({
  groups,
  selectedMap,
  errorMap,
  onChange,
}: ModifierGroupListProps) {
  const activeGroups = groups.filter((g) => g.active)

  return (
    <div data-testid="modifier-group-list" className="space-y-4">
      {activeGroups.map((group, idx) => (
        <div key={group.id}>
          <ModifierGroup
            group={group}
            selected={selectedMap[group.id] ?? []}
            onChange={(optionId, checked) => onChange(group.id, optionId, checked)}
            error={errorMap[group.id] ?? false}
          />
          {idx < activeGroups.length - 1 && <Separator className="mt-4" />}
        </div>
      ))}
    </div>
  )
}
