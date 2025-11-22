'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings } from 'lucide-react'
import { checkDashboardAccess } from '@/lib/auth/permissions'

interface DashboardAccessButtonProps {
  tenantId: string
}

/**
 * Floating button to access dashboard from storefront
 * Only visible to superadmins and tenant owners
 */
export function DashboardAccessButton({ tenantId }: DashboardAccessButtonProps) {
  const router = useRouter()
  const [canAccess, setCanAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      const result = await checkDashboardAccess(tenantId)
      setCanAccess(result.canAccessDashboard)
      setLoading(false)
    }

    checkAccess()
  }, [tenantId])

  if (loading || !canAccess) {
    return null
  }

  return (
    <button
      onClick={() => router.push(`/${tenantId}/dashboard`)}
      className="fixed bottom-24 right-8 w-16 h-16 bg-purple-600 text-white flex items-center justify-center z-50 shadow-[4px_4px_0px_0px_rgba(255,255,255,1),8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1),10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
      title="Dashboard"
      data-testid="dashboard-access-button"
    >
      <Settings className="w-6 h-6" />
    </button>
  )
}

