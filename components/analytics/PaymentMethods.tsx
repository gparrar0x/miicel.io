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

interface PaymentMethod {
  method: string
  transaction_count: number
  total_amount: number
  percentage: number
}

interface PaymentMethodsProps {
  data: PaymentMethod[]
  onExport: () => void
}

const PAYMENT_METHOD_ICONS: Record<string, string> = {
  mercadopago: '💳',
  efectivo: '💵',
  transferencia: '🏦',
  otro: '💰',
  default: '💰',
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  mercadopago: 'MercadoPago',
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  otro: 'Otro',
}

export function PaymentMethods({ data, onExport }: PaymentMethodsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getMethodIcon = (method: string) => {
    const lowerMethod = method.toLowerCase()
    return PAYMENT_METHOD_ICONS[lowerMethod] || PAYMENT_METHOD_ICONS.default
  }

  const getMethodLabel = (method: string) => {
    const lowerMethod = method.toLowerCase()
    return PAYMENT_METHOD_LABELS[lowerMethod] || method
  }

  return (
    <Card data-testid="payment-methods">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Medios de Pago</CardTitle>
        <Button variant="ghost" size="sm" onClick={onExport} data-testid="export-btn-payments">
          <Download className="h-4 w-4 mr-2" />
          CSV
        </Button>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No hay datos para el período seleccionado
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Transacciones</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((method) => (
                <TableRow key={method.method}>
                  <TableCell className="font-medium">
                    <span className="mr-2">{getMethodIcon(method.method)}</span>
                    {getMethodLabel(method.method)}
                  </TableCell>
                  <TableCell className="text-right">{method.transaction_count} trans</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(method.total_amount)}
                  </TableCell>
                  <TableCell className="text-right">{method.percentage.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
