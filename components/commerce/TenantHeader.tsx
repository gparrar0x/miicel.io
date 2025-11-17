/**
 * TenantHeader Component
 *
 * Displays tenant branding: banner image, circular logo, business info
 * Spec: DESIGN_SYSTEM_COMMERCE.md Section 5.1
 *
 * Anatomy:
 * - Banner: Full-width, 180px mobile → 240px desktop
 * - Logo: Circular, 100px mobile → 120px desktop, overlaps banner bottom
 * - Info: Business name, subtitle, location
 *
 * Props:
 * - businessName: Required
 * - bannerUrl, logoUrl: Optional (fallbacks to primary color)
 * - subtitle, location: Optional
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
    location,
    bannerUrl,
    logoUrl,
    colors,
  } = config

  // Fallback banner background (primary color at 20% opacity)
  const fallbackBannerStyle = {
    backgroundColor: `${colors.primary}33`,
  }

  return (
    <header className="relative mb-16" data-testid="tenant-header">
      {/* Banner */}
      <div
        className="h-[180px] md:h-[240px] w-full bg-cover bg-center relative"
        style={bannerUrl ? undefined : fallbackBannerStyle}
        role="img"
        aria-label={`${businessName} banner`}
      >
        {bannerUrl && (
          <Image
            src={bannerUrl}
            alt={`${businessName} banner`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}
      </div>

      {/* Logo */}
      <div className="absolute left-4 md:left-6 -bottom-10 md:-bottom-12">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={`${businessName} logo`}
            width={120}
            height={120}
            className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-full border-4 border-white object-cover"
            style={{ boxShadow: 'var(--shadow-logo)' }}
            data-testid="tenant-logo"
            priority
          />
        ) : (
          <div
            className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-2xl md:text-3xl"
            style={{
              backgroundColor: colors.primary,
              boxShadow: 'var(--shadow-logo)',
            }}
            data-testid="tenant-logo"
          >
            {businessName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Business Info */}
      <div className="pl-[130px] md:pl-[160px] pt-4 pr-4 md:pr-6 pb-4 bg-bg-elevated">
        <h1
          className="text-[24px] md:text-[28px] font-bold leading-tight"
          style={{ color: 'var(--color-text-primary)' }}
          data-testid="business-name"
        >
          {businessName}
        </h1>
        {subtitle && (
          <p
            className="text-[14px] md:text-[16px] mt-1"
            style={{ color: 'var(--color-text-secondary)' }}
            data-testid="business-tagline"
          >
            {subtitle}
          </p>
        )}
        {location && (
          <div
            className="flex items-center gap-1 text-[12px] md:text-[14px] mt-2"
            style={{ color: 'var(--color-text-tertiary)' }}
            data-testid="business-location"
          >
            <span aria-hidden="true">📍</span>
            <span>{location}</span>
          </div>
        )}
      </div>
    </header>
  )
}
