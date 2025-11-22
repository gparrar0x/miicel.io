import { artworks } from "@/lib/data"
import { notFound } from "next/navigation"
import { ArtworkDetail } from "@/components/artwork/artwork-detail"
import { Header } from "@/components/layout/header"

export default async function ArtworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const artwork = artworks.find((a) => a.id === id)

  if (!artwork) {
    notFound()
  }

  // Find related artworks (same collection, excluding current)
  const relatedArtworks = artworks.filter((a) => a.collection === artwork.collection && a.id !== artwork.id).slice(0, 4)

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <main>
        <ArtworkDetail artwork={artwork} relatedArtworks={relatedArtworks} />
      </main>
    </div>
  )
}
