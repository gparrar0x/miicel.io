export interface Artwork {
  id: string
  title: string
  artist: string
  year: number
  description: string
  technique: string
  collection: string
  image: string
  price: number
  currency: string
  sizes: {
    id: string
    dimensions: string
    price: number
    stock: number | null // null means unlimited
    label: string
  }[]
  isLimitedEdition: boolean
}
