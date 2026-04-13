'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GenerationConfigPanel } from './GenerationConfigPanel'

const PostCreator = dynamic(
  () => import('@/components/social/PostCreator').then((m) => m.PostCreator),
  { ssr: false },
)

interface GenerateContentButtonProps {
  productId: number
  tenantId: number
}

/**
 * Trigger button for content generation flow.
 * Opens GenerationConfigPanel dialog on click.
 * Bridges to PostCreator when user publishes from AssetGallery.
 *
 * @testid generate-content-btn
 */
export function GenerateContentButton({ productId, tenantId }: GenerateContentButtonProps) {
  const [open, setOpen] = useState(false)
  const [creatorOpen, setCreatorOpen] = useState(false)
  const [creatorMediaUrls, setCreatorMediaUrls] = useState<string[]>([])

  const handlePublishAsset = (urls: string[]) => {
    setCreatorMediaUrls(urls)
    setCreatorOpen(true)
  }

  return (
    <>
      <Button data-testid="generate-content-btn" onClick={() => setOpen(true)} className="gap-2">
        <Sparkles className="h-4 w-4" />
        Generate Content
      </Button>
      <GenerationConfigPanel
        open={open}
        onOpenChange={setOpen}
        productId={productId}
        tenantId={tenantId}
        onPublishAsset={handlePublishAsset}
      />
      <PostCreator
        open={creatorOpen}
        onOpenChange={setCreatorOpen}
        tenantId={tenantId}
        mediaUrls={creatorMediaUrls}
        productId={productId}
        onPublished={() => {
          setCreatorOpen(false)
          setCreatorMediaUrls([])
        }}
      />
    </>
  )
}
