/**
 * Zustand store for Author Landing Editor (dashboard).
 * Manages selected author, prompt, generation state, and preview content.
 */

import { create } from 'zustand'
import type { AuthorLandingContent } from '@/lib/schemas/author-landing'

export interface AuthorOption {
  id: number
  name: string
  slug: string
  image_url: string | null
  latest_landing: {
    id: number
    status: 'draft' | 'published'
    generated_at: string
  } | null
}

interface AuthorLandingState {
  // Data
  authors: AuthorOption[]
  selectedAuthorId: number | null
  tenantId: number | null
  customPrompt: string
  previewContent: AuthorLandingContent | null
  previewAuthorName: string | null
  previewAuthorImage: string | null
  landingStatus: 'draft' | 'published' | null

  // Loading states
  isLoadingAuthors: boolean
  isGenerating: boolean
  isPublishing: boolean
  isUploading: boolean
  error: string | null

  // Actions
  setAuthors: (authors: AuthorOption[]) => void
  selectAuthor: (authorId: number | null) => void
  setTenantId: (tenantId: number) => void
  setCustomPrompt: (prompt: string) => void
  setPreview: (
    content: AuthorLandingContent,
    authorName: string,
    authorImage: string | null,
    status: 'draft' | 'published',
  ) => void
  clearPreview: () => void
  setError: (error: string | null) => void
  setIsLoadingAuthors: (v: boolean) => void
  setIsGenerating: (v: boolean) => void
  setIsPublishing: (v: boolean) => void
  setIsUploading: (v: boolean) => void
  setLandingStatus: (status: 'draft' | 'published') => void
  updateAuthorImage: (authorId: number, imageUrl: string) => void
}

export const useAuthorLandingStore = create<AuthorLandingState>((set, get) => ({
  authors: [],
  selectedAuthorId: null,
  tenantId: null,
  customPrompt: '',
  previewContent: null,
  previewAuthorName: null,
  previewAuthorImage: null,
  landingStatus: null,
  isLoadingAuthors: false,
  isGenerating: false,
  isPublishing: false,
  isUploading: false,
  error: null,

  setAuthors: (authors) => set({ authors }),
  selectAuthor: (authorId) => {
    const author = authorId ? get().authors.find((a) => a.id === authorId) : null
    set({
      selectedAuthorId: authorId,
      previewContent: null,
      previewAuthorName: author?.name ?? null,
      previewAuthorImage: author?.image_url ?? null,
      landingStatus: author?.latest_landing?.status ?? null,
      error: null,
    })
  },
  setTenantId: (tenantId) => set({ tenantId }),
  setCustomPrompt: (prompt) => set({ customPrompt: prompt }),
  setPreview: (content, authorName, authorImage, status) =>
    set({
      previewContent: content,
      previewAuthorName: authorName,
      previewAuthorImage: authorImage,
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
    const authors = get().authors.map((a) =>
      a.id === authorId ? { ...a, image_url: imageUrl } : a,
    )
    set({ authors })
    if (get().selectedAuthorId === authorId) {
      set({ previewAuthorImage: imageUrl })
    }
  },
}))
