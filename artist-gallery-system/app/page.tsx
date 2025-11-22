import { artworks, collections } from "@/lib/data"
import { Header } from "@/components/layout/header"
import { GalleryGrid } from "@/components/gallery/gallery-grid"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight">Elena Vostokova</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Exploring the boundaries between chaos and order through abstract expressionism.
          </p>
        </div>

        <GalleryGrid artworks={artworks} collections={collections} />
      </main>
    </div>
  )
}
