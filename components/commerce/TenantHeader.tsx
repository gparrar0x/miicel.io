/**
 * TenantHeader Component (Neo-Brutalist Editorial)
 * 
 * Aesthetic: Minimal, Text-Focused, Sticky
 */

import { type TenantConfigResponse } from '@/lib/schemas/order'
import Image from 'next/image'

interface TenantHeaderProps {
  config: TenantConfigResponse
}

export function TenantHeader({ config }: TenantHeaderProps) {
  const {
    businessName,
    subtitle,
    logoUrl,
  } = config

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--color-background)]/80 backdrop-blur-md border-b border-black/10" data-testid="tenant-header">
      <div className="max-w-[var(--container-width)] mx-auto px-4 h-[var(--header-height)] flex items-center justify-between">

        {/* Left: Brand */}
        <div className="flex items-center gap-4">
          {logoUrl && (
            <div className="relative w-10 h-10 overflow-hidden rounded-full border border-black/20">
              <Image
                src={logoUrl}
                alt={businessName}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight leading-none text-[var(--color-ink)]">
              {businessName}
            </h1>
            {subtitle && (
              <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Navigation / Actions (Placeholder) */}
        <nav className="hidden md:flex items-center gap-8">
          <button className="font-mono text-sm hover:underline decoration-2 underline-offset-4">COLLECTIONS</button>
          <button className="font-mono text-sm hover:underline decoration-2 underline-offset-4">ABOUT</button>
          <button className="font-mono text-sm hover:underline decoration-2 underline-offset-4">CONTACT</button>
        </nav>

      </div>
    </header>
  )
}
