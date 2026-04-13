'use client'

import { useState } from 'react'
import { Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PostCreator } from './PostCreator'

interface PublishToInstagramButtonProps {
  tenantId: number
  mediaUrls: string[]
  productId?: number
  generationId?: string
}

/**
 * Trigger button for Instagram publishing flow.
 * Opens PostCreator dialog on click.
 *
 * @testid publish-ig-btn
 */
export function PublishToInstagramButton({
  tenantId,
  mediaUrls,
  productId,
  generationId,
}: PublishToInstagramButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button data-testid="publish-ig-btn" onClick={() => setOpen(true)} className="gap-2">
        <Instagram className="h-4 w-4" />
        Publish to Instagram
      </Button>
      <PostCreator
        open={open}
        onOpenChange={setOpen}
        tenantId={tenantId}
        mediaUrls={mediaUrls}
        productId={productId}
        generationId={generationId}
      />
    </>
  )
}
