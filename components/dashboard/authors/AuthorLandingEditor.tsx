'use client'

/**
 * AuthorLandingEditor — dashboard panel for generating + publishing author landings.
 * Flow: select author → upload image → write prompt → generate → preview → publish.
 */

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef } from 'react'
import { AuthorLanding } from '@/components/storefront/AuthorLanding'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuthorLandingStore } from '@/lib/stores/author-landing-store'

interface AuthorLandingEditorProps {
  tenantId: number
  tenantSlug: string
  locale: string
}

const DEFAULT_PROMPT = `Tone: [artistic, minimal, warm — choose one]
Focus: [the technique, the story, the materials]
Extra detail: [add any specific info about this artist]`

export function AuthorLandingEditor({ tenantId, tenantSlug, locale }: AuthorLandingEditorProps) {
  const {
    authors,
    selectedAuthorId,
    customPrompt,
    previewContent,
    previewAuthorName,
    previewAuthorImage,
    landingStatus,
    isLoadingAuthors,
    isGenerating,
    isPublishing,
    isUploading,
    error,
    setAuthors,
    selectAuthor,
    setTenantId,
    setCustomPrompt,
    setPreview,
    setError,
    setIsLoadingAuthors,
    setIsGenerating,
    setIsPublishing,
    setIsUploading,
    setLandingStatus,
    updateAuthorImage,
  } = useAuthorLandingStore()

  const t = useTranslations('Authors')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Init
  useEffect(() => {
    setTenantId(tenantId)
  }, [tenantId, setTenantId])

  // Fetch authors
  const fetchAuthors = useCallback(async () => {
    setIsLoadingAuthors(true)
    setError(null)
    try {
      const res = await fetch(`/api/authors?tenant_id=${tenantId}`)
      if (!res.ok) throw new Error('Failed to load authors')
      const data = await res.json()
      setAuthors(data.authors ?? [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoadingAuthors(false)
    }
  }, [tenantId, setAuthors, setError, setIsLoadingAuthors])

  useEffect(() => {
    fetchAuthors()
  }, [fetchAuthors])

  // Set default prompt on first render
  useEffect(() => {
    if (!customPrompt) setCustomPrompt(DEFAULT_PROMPT)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Image upload
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !selectedAuthorId) return

      setIsUploading(true)
      setError(null)
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('tenant_id', String(tenantId))
        formData.append('author_id', String(selectedAuthorId))

        const res = await fetch('/api/authors/upload-image', { method: 'POST', body: formData })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Upload failed')
        }

        const { url } = await res.json()

        // Update author image_url via PUT
        await fetch(`/api/authors/${selectedAuthorId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: url }),
        })

        updateAuthorImage(selectedAuthorId, url)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    },
    [selectedAuthorId, tenantId, setError, setIsUploading, updateAuthorImage],
  )

  // Generate landing
  const handleGenerate = useCallback(async () => {
    if (!selectedAuthorId) return

    setIsGenerating(true)
    setError(null)
    try {
      const res = await fetch(`/api/authors/${selectedAuthorId}/generate-landing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_prompt: customPrompt || undefined }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Generation failed')
      }

      const { landing } = await res.json()
      const author = authors.find((a) => a.id === selectedAuthorId)

      setPreview(landing.content, author?.name ?? '', author?.image_url ?? null, landing.status)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }, [selectedAuthorId, customPrompt, authors, setError, setIsGenerating, setPreview])

  // Publish
  const handlePublish = useCallback(async () => {
    if (!selectedAuthorId) return

    setIsPublishing(true)
    setError(null)
    try {
      const res = await fetch(`/api/authors/${selectedAuthorId}/publish-landing`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Publish failed')
      }

      setLandingStatus('published')
      // Refresh author list to update badges
      fetchAuthors()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsPublishing(false)
    }
  }, [selectedAuthorId, setError, setIsPublishing, setLandingStatus, fetchAuthors])

  const selectedAuthor = authors.find((a) => a.id === selectedAuthorId)
  const ctaHref = `/${locale}/${tenantSlug}/?artist=${encodeURIComponent(selectedAuthor?.name ?? '')}`

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
      </div>

      {/* Controls */}
      <div className="space-y-6 max-w-2xl">
        {/* Author Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="author-select">
            {t('author')}
          </label>
          <Select
            value={selectedAuthorId ? String(selectedAuthorId) : ''}
            onValueChange={(val) => selectAuthor(val ? Number(val) : null)}
          >
            <SelectTrigger data-testid="author-select-dropdown" id="author-select">
              <SelectValue
                placeholder={isLoadingAuthors ? t('loadingAuthors') : t('selectAuthor')}
              />
            </SelectTrigger>
            <SelectContent>
              {authors.map((author) => (
                <SelectItem key={author.id} value={String(author.id)}>
                  <span className="flex items-center gap-2">
                    {author.name}
                    {author.latest_landing && (
                      <Badge
                        variant={
                          author.latest_landing.status === 'published' ? 'default' : 'outline'
                        }
                        className="text-[10px] px-1.5 py-0"
                      >
                        {author.latest_landing.status}
                      </Badge>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Image Upload */}
        {selectedAuthorId && (
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('authorImage')}</label>
            <div className="flex items-center gap-4">
              {previewAuthorImage && (
                <img
                  src={previewAuthorImage}
                  alt={selectedAuthor?.name ?? 'Author'}
                  className="w-16 h-16 object-cover border-2 border-black"
                />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                disabled={isUploading}
                data-testid="author-image-upload"
                className="text-sm file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:bg-white file:text-sm file:font-medium hover:file:bg-neutral-100 file:cursor-pointer disabled:opacity-50"
              />
              {isUploading && (
                <span className="text-sm text-muted-foreground">{t('uploading')}</span>
              )}
            </div>
          </div>
        )}

        {/* Prompt */}
        {selectedAuthorId && (
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="author-prompt">
              {t('prompt')}
            </label>
            <Textarea
              id="author-prompt"
              data-testid="author-prompt-textarea"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={4}
              placeholder={t('promptPlaceholder')}
              className="font-mono text-sm"
            />
          </div>
        )}

        {/* Actions */}
        {selectedAuthorId && (
          <div className="flex items-center gap-3">
            <Button
              data-testid="author-generate-btn"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating
                ? t('generating')
                : previewContent
                  ? t('regenerate')
                  : t('generateLanding')}
            </Button>

            {previewContent && (
              <>
                <Button
                  data-testid="author-regenerate-btn"
                  variant="outline"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? t('generating') : t('regenerate')}
                </Button>

                <Button
                  data-testid="author-publish-btn"
                  variant={landingStatus === 'published' ? 'secondary' : 'default'}
                  onClick={handlePublish}
                  disabled={isPublishing || landingStatus === 'published'}
                >
                  {isPublishing
                    ? t('publishing')
                    : landingStatus === 'published'
                      ? t('published')
                      : t('publish')}
                </Button>
              </>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2 rounded">
            {error}
          </p>
        )}
      </div>

      {/* Preview */}
      {previewContent && previewAuthorName && (
        <div data-testid="author-preview-container" className="border-2 border-black mt-8">
          <div className="bg-neutral-100 px-4 py-2 border-b-2 border-black flex items-center justify-between">
            <span className="text-sm font-mono font-medium uppercase tracking-wider">
              {t('preview')}
            </span>
            {landingStatus && (
              <Badge variant={landingStatus === 'published' ? 'default' : 'outline'}>
                {landingStatus}
              </Badge>
            )}
          </div>
          <AuthorLanding
            content={previewContent}
            authorName={previewAuthorName}
            authorImage={previewAuthorImage}
            ctaHref={ctaHref}
          />
        </div>
      )}
    </div>
  )
}
