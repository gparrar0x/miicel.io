import { create } from 'zustand'
import type { AuthorLandingContent, LandingStatus } from '@/lib/schemas/author-landing'

export interface AuthorOption {
  id: number
  name: string
  slug: string
  image_url: string | null
  latest_landing: {
    id: number
    status: LandingStatus
    content: AuthorLandingContent
    generated_at: string
  } | null
}

interface AuthorLandingState {
  authors: AuthorOption[]
  selectedAuthorId: number | null
  customPrompt: string
  previewContent: AuthorLandingContent | null
  landingStatus: LandingStatus | null

  isLoadingAuthors: boolean
  isGenerating: boolean
  isPublishing: boolean
  isUploading: boolean
  error: string | null

  setAuthors: (authors: AuthorOption[]) => void
  selectAuthor: (authorId: number | null) => void
  setCustomPrompt: (prompt: string) => void
  setPreview: (content: AuthorLandingContent, status: LandingStatus) => void
  clearPreview: () => void
  setError: (error: string | null) => void
  setIsLoadingAuthors: (v: boolean) => void
  setIsGenerating: (v: boolean) => void
  setIsPublishing: (v: boolean) => void
  setIsUploading: (v: boolean) => void
  setLandingStatus: (status: LandingStatus) => void
  updateAuthorImage: (authorId: number, imageUrl: string) => void

  // Derived selectors
  selectedAuthor: () => AuthorOption | undefined
}

export const useAuthorLandingStore = create<AuthorLandingState>((set, get) => ({
  authors: [],
  selectedAuthorId: null,
  customPrompt: '',
  previewContent: null,
  landingStatus: null,
  isLoadingAuthors: false,
  isGenerating: false,
  isPublishing: false,
  isUploading: false,
  error: null,

  setAuthors: (authors) => set({ authors }),
  selectAuthor: (authorId) => {
    const author = authorId ? get().authors.find((a) => a.id === authorId) : null
    const landing = author?.latest_landing ?? null
    set({
      selectedAuthorId: authorId,
      previewContent: landing?.content ?? null,
      landingStatus: landing?.status ?? null,
      error: null,
    })
  },
  setCustomPrompt: (prompt) => set({ customPrompt: prompt }),
  setPreview: (content, status) =>
    set({
      previewContent: content,
      landingStatus: status,
    }),
  clearPreview: () => set({ previewContent: null, landingStatus: null }),
  setError: (error) => set({ error }),
  setIsLoadingAuthors: (v) => set({ isLoadingAuthors: v }),
  setIsGenerating: (v) => set({ isGenerating: v }),
  setIsPublishing: (v) => set({ isPublishing: v }),
  setIsUploading: (v) => set({ isUploading: v }),
  setLandingStatus: (status) => set({ landingStatus: status }),
  updateAuthorImage: (authorId, imageUrl) => {
    set({
      authors: get().authors.map((a) => (a.id === authorId ? { ...a, image_url: imageUrl } : a)),
    })
  },

  selectedAuthor: () => {
    const { authors, selectedAuthorId } = get()
    return authors.find((a) => a.id === selectedAuthorId)
  },
}))
