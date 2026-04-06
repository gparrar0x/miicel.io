'use client'

import { Copy, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
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
    landingStatus,
    isLoadingAuthors,
    isGenerating,
    isPublishing,
    isUploading,
    error,
    setAuthors,
    selectAuthor,
    setCustomPrompt,
    setPreview,
    setError,
    setIsLoadingAuthors,
    setIsGenerating,
    setIsPublishing,
    setIsUploading,
    setLandingStatus,
    updateAuthorImage,
    selectedAuthor: getSelectedAuthor,
  } = useAuthorLandingStore()

  const t = useTranslations('Authors')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedAuthor = getSelectedAuthor()

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

  useEffect(() => {
    if (!customPrompt) setCustomPrompt(DEFAULT_PROMPT)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
      setPreview(landing.content, landing.status)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }, [selectedAuthorId, customPrompt, setError, setIsGenerating, setPreview])

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
      fetchAuthors()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsPublishing(false)
    }
  }, [selectedAuthorId, setError, setIsPublishing, setLandingStatus, fetchAuthors])

  const ctaHref = `/${locale}/${tenantSlug}/?artist=${encodeURIComponent(selectedAuthor?.name ?? '')}`
  const landingUrl = selectedAuthor
    ? `micelio.skyw.app/${locale}/${tenantSlug}/a/${selectedAuthor.slug}`
    : ''

  const [copied, setCopied] = useState(false)
  const handleCopyUrl = useCallback(() => {
    navigator.clipboard.writeText(`https://${landingUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [landingUrl])

  return (
    <div className="flex gap-8 h-[calc(100vh-8rem)]">
      {/* Left column: controls */}
      <div className="w-full max-w-md shrink-0 flex flex-col gap-5 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="author-select">
            {t('author')}
          </label>
          <Select
            value={selectedAuthorId ? String(selectedAuthorId) : ''}
            onValueChange={(val) => selectAuthor(val ? Number(val) : null)}
          >
            <SelectTrigger
              data-testid="author-select-dropdown"
              id="author-select"
              className="w-fit min-w-48"
            >
              <SelectValue
                placeholder={isLoadingAuthors ? t('loadingAuthors') : t('selectAuthor')}
              />
            </SelectTrigger>
            <SelectContent>
              {authors.map((author) => (
                <SelectItem key={author.id} value={String(author.id)}>
                  {author.name}
                  {author.latest_landing && (
                    <Badge
                      variant={author.latest_landing.status === 'published' ? 'default' : 'outline'}
                      className="text-[10px] px-1.5 py-0 ml-2"
                    >
                      {author.latest_landing.status}
                    </Badge>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedAuthorId && (
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('authorImage')}</label>
            <div className="flex items-center gap-4">
              {selectedAuthor?.image_url && (
                <img
                  src={selectedAuthor.image_url}
                  alt={selectedAuthor.name}
                  className="w-12 h-12 object-cover border-2 border-border"
                />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                disabled={isUploading}
                data-testid="author-image-upload"
                className="text-sm file:mr-4 file:py-1.5 file:px-3 file:border file:border-border file:bg-background file:text-foreground file:text-xs file:font-medium hover:file:bg-muted file:rounded-md file:cursor-pointer disabled:opacity-50"
              />
              {isUploading && (
                <span className="text-sm text-muted-foreground">{t('uploading')}</span>
              )}
            </div>
          </div>
        )}

        {selectedAuthorId && (
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <label className="text-sm font-medium shrink-0" htmlFor="author-prompt">
              {t('prompt')}
            </label>
            <Textarea
              id="author-prompt"
              data-testid="author-prompt-textarea"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={t('promptPlaceholder')}
              className="font-mono text-xs flex-1 min-h-24 resize-none"
            />
          </div>
        )}

        {selectedAuthorId && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
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
              <Button
                size="sm"
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
            )}
          </div>
        )}

        {selectedAuthor && (
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground font-mono truncate">{landingUrl}</p>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="shrink-0 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              data-testid="copy-landing-url"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2 rounded">
            {error}
          </p>
        )}
      </div>

      {/* Right column: preview with internal scroll */}
      {previewContent && selectedAuthor ? (
        <div className="flex-1 min-w-0 flex flex-col">
          <div
            data-testid="author-preview-container"
            className="border-2 border-border rounded-lg overflow-hidden flex flex-col h-full"
          >
            <div className="bg-muted px-4 py-2 border-b-2 border-border flex items-center justify-between shrink-0">
              <span className="text-sm font-mono font-medium uppercase tracking-wider">
                {t('preview')}
              </span>
              {landingStatus && (
                <Badge variant={landingStatus === 'published' ? 'default' : 'outline'}>
                  {landingStatus}
                </Badge>
              )}
            </div>
            <div className="overflow-y-auto flex-1">
              <AuthorLanding
                content={previewContent}
                authorName={selectedAuthor.name}
                authorImage={selectedAuthor.image_url}
                ctaHref={ctaHref}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  )
}
