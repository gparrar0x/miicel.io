'use client'

import { Download, Printer, QrCode } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { QRCodeCanvas } from 'qrcode.react'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Product } from '@/lib/schemas/product'

interface QRProductModalProps {
  product: Product | null
  tenantId: string
  locale: string
  isOpen: boolean
  onClose: () => void
}

export function QRProductModal({
  product,
  tenantId,
  locale,
  isOpen,
  onClose,
}: QRProductModalProps) {
  const t = useTranslations('Products.qr')
  const tCommon = useTranslations('Common')
  const qrRef = useRef<HTMLDivElement>(null)

  if (!product) return null

  const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://miicel.io'}/${locale}/${tenantId}/p/${product.id}`

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const productSlug = product.name.toLowerCase().replace(/\s+/g, '-')
      link.download = `qr-${productSlug}-${product.id}.png`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" data-testid="qr-modal-container">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="size-5" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product name */}
          <div className="text-center font-medium text-lg" data-testid="qr-modal-product-name">
            {product.name}
          </div>

          {/* QR Code */}
          <div
            ref={qrRef}
            className="flex justify-center items-center bg-white p-6 rounded-lg border qr-code-print-area"
            data-testid={`qr-code-${product.id}`}
          >
            <QRCodeCanvas value={productUrl} size={256} level="H" includeMargin={true} />
          </div>

          {/* URL Preview */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">{t('url')}</p>
            <p
              className="text-xs font-mono bg-muted px-3 py-2 rounded break-all"
              data-testid="qr-modal-url-preview"
            >
              {productUrl}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            data-testid="qr-modal-print-button"
          >
            <Printer className="mr-2 h-4 w-4" />
            {t('print')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDownload}
            data-testid="qr-modal-download-button"
          >
            <Download className="mr-2 h-4 w-4" />
            {t('download')}
          </Button>
          <Button type="button" onClick={onClose} data-testid="qr-modal-close-button">
            {tCommon('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
