/**
 * AuthorLanding — public-facing author landing page component.
 * RSC: zero client JS. Used both in public route and dashboard preview.
 *
 * Sections: Hero (headline + subheadline + image) → Bio → CTA
 */

import Image from 'next/image'
import Link from 'next/link'
import type { AuthorLandingContent } from '@/lib/schemas/author-landing'

interface AuthorLandingProps {
  content: AuthorLandingContent
  authorName: string
  authorImage: string | null
  ctaHref: string
}

export function AuthorLanding({ content, authorName, authorImage, ctaHref }: AuthorLandingProps) {
  return (
    <article className="min-h-screen bg-white text-black">
      {/* Hero */}
      <section
        data-testid="author-landing-hero"
        className="relative flex flex-col items-center justify-center min-h-[85vh] px-6 py-24 text-center bg-neutral-50"
      >
        {authorImage && (
          <div
            data-testid="author-landing-image"
            className="relative w-full max-w-2xl aspect-[4/3] mb-12 overflow-hidden border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <Image
              src={authorImage}
              alt={authorName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
            />
          </div>
        )}

        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] max-w-4xl">
          {content.hero.headline}
        </h1>

        <p className="mt-6 text-lg sm:text-xl md:text-2xl text-neutral-600 max-w-2xl font-light leading-relaxed">
          {content.hero.subheadline}
        </p>
      </section>

      {/* Bio */}
      <section data-testid="author-landing-bio" className="max-w-3xl mx-auto px-6 py-24 md:py-32">
        <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-8 border-b-2 border-black pb-4">
          {authorName}
        </h2>
        <p className="text-lg sm:text-xl leading-relaxed text-neutral-800 whitespace-pre-line">
          {content.bio.long}
        </p>
      </section>

      {/* CTA */}
      <section
        data-testid="author-landing-cta"
        className="flex flex-col items-center justify-center px-6 py-24 bg-black text-white text-center"
      >
        <p className="text-lg sm:text-xl text-neutral-400 mb-8 max-w-xl">{content.bio.short}</p>
        <Link
          href={ctaHref}
          className="inline-block px-10 py-4 text-lg font-bold uppercase tracking-wider bg-white text-black border-2 border-white hover:bg-neutral-200 transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]"
        >
          {content.hero.cta_text}
        </Link>
      </section>
    </article>
  )
}
