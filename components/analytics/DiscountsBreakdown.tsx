import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Discount {
  source: string
  usage_count: number
  total_discount_amount: number
  affected_orders: number
}

interface DiscountsBreakdownProps {
  data: Discount[]
  onExport: () => void
}

const DISCOUNT_SOURCE_ICONS: Record<string, string> = {
  redbag8: '🏷️',
  local: '🏪',
  folleto: '📄',
  promo_web: '✨',
  influencer: '⭐',
  default: '🎫',
}

const DISCOUNT_SOURCE_LABELS: Record<string, string> = {
  redbag8: 'RedBag8',
  local: 'Descuento local',
  folleto: 'Folleto',
  promo_web: 'Promo web',
  influencer: 'Influencer',
}

export function DiscountsBreakdown({ data, onExport }: DiscountsBreakdownProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getSourceIcon = (source: string) => {
    const lowerSource = source.toLowerCase()
    return DISCOUNT_SOURCE_ICONS[lowerSource] || DISCOUNT_SOURCE_ICONS.default
  }

  const getSourceLabel = (source: string) => {
    const lowerSource = source.toLowerCase()
    return DISCOUNT_SOURCE_LABELS[lowerSource] || source
  }

  const totalDiscountAmount = data.reduce((sum, d) => sum + d.total_discount_amount, 0)

  return (
    <Card data-testid="discounts-breakdown">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Descuentos Aplicados</CardTitle>
        <Button variant="ghost" size="sm" onClick={onExport} data-testid="export-btn-discounts">
          <Download className="h-4 w-4 mr-2" />
          CSV
        </Button>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No hay descuentos para el período seleccionado
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origen</TableHead>
                  <TableHead className="text-right">Usos</TableHead>
                  <TableHead className="text-right">Descuento</TableHead>
                  <TableHead className="text-right">Pedidos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((discount) => (
                  <TableRow key={discount.source}>
                    <TableCell className="font-medium">
                      <span className="mr-2">{getSourceIcon(discount.source)}</span>
                      {getSourceLabel(discount.source)}
                    </TableCell>
                    <TableCell className="text-right">{discount.usage_count} usos</TableCell>
                    <TableCell className="text-right text-destructive">
                      -{formatCurrency(discount.total_discount_amount)}
                    </TableCell>
                    <TableCell className="text-right">{discount.affected_orders} pedidos</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
              <span className="font-semibold text-foreground">Total descontado</span>
              <span className="font-bold text-destructive">
                {formatCurrency(totalDiscountAmount)}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
