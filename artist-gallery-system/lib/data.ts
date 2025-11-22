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
  sizes: {
    id: string
    dimensions: string
    price: number
    stock: number | null // null means unlimited
    label: string
  }[]
  isLimitedEdition: boolean
}

export const artworks: Artwork[] = [
  {
    id: "1",
    title: "Ethereal Silence",
    artist: "Elena Vostokova",
    year: 2024,
    description:
      "A study of light and shadow in the early morning hours. This piece explores the quiet moments before the world wakes up, capturing the delicate balance between presence and absence.",
    technique: "Oil on Canvas",
    collection: "Abstract Horizons",
    image: "/abstract-minimalist-painting-white-blue.jpg",
    price: 1200,
    isLimitedEdition: true,
    sizes: [
      { id: "s", dimensions: "30 × 40 cm", price: 1200, stock: 5, label: "Small" },
      { id: "m", dimensions: "50 × 70 cm", price: 2400, stock: 3, label: "Medium" },
      { id: "l", dimensions: "100 × 140 cm", price: 4800, stock: 1, label: "Large" },
    ],
  },
  {
    id: "2",
    title: "Urban Rhythm",
    artist: "Elena Vostokova",
    year: 2023,
    description:
      "Capturing the chaotic yet structured movement of city life. The bold strokes represent the energy of the streets, while the negative space invites contemplation.",
    technique: "Acrylic on Wood Panel",
    collection: "Cityscapes",
    image: "/abstract-urban-painting-black-white.jpg",
    price: 950,
    isLimitedEdition: false,
    sizes: [
      { id: "s", dimensions: "40 × 40 cm", price: 950, stock: null, label: "Original Size" },
      { id: "p", dimensions: "30 × 30 cm", price: 150, stock: null, label: "Fine Art Print" },
    ],
  },
  {
    id: "3",
    title: "Midnight Bloom",
    artist: "Elena Vostokova",
    year: 2024,
    description:
      "Inspired by the resilience of nature in darkness. Deep blues and blacks contrast with sudden bursts of light, symbolizing hope in difficult times.",
    technique: "Mixed Media",
    collection: "Abstract Horizons",
    image: "/dark-abstract-flower-painting.jpg",
    price: 1800,
    isLimitedEdition: true,
    sizes: [{ id: "m", dimensions: "60 × 80 cm", price: 1800, stock: 2, label: "Original" }],
  },
  {
    id: "4",
    title: "Geometric Solitude",
    artist: "Elena Vostokova",
    year: 2023,
    description:
      "A minimalist exploration of form and structure. Sharp lines intersect with soft gradients to create a sense of depth and isolation.",
    technique: "Digital Print on Aluminum",
    collection: "Geometry",
    image: "/geometric-minimalist-art.jpg",
    price: 450,
    isLimitedEdition: false,
    sizes: [
      { id: "s", dimensions: "30 × 30 cm", price: 450, stock: null, label: "Small" },
      { id: "m", dimensions: "50 × 50 cm", price: 750, stock: null, label: "Medium" },
      { id: "l", dimensions: "80 × 80 cm", price: 1200, stock: null, label: "Large" },
    ],
  },
]

export const collections = ["All Works", "Abstract Horizons", "Cityscapes", "Geometry"]
