import { Card, CardContent } from '@/components/ui/card'
import { DollarSign, ShoppingCart, TrendingUp, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SummaryCardsProps {
  data: {
    total_sales: number
    total_transactions: number
    average_ticket: number
    items_sold: number
  }
  loading?: boolean
}

export function SummaryCards({ data, loading }: SummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const cards = [
    {
      title: 'Ventas Totales',
      value: formatCurrency(data.total_sales),
      icon: DollarSign,
      testId: 'total-sales',
    },
    {
      title: 'Transacciones',
      value: data.total_transactions.toString(),
      icon: ShoppingCart,
      testId: 'total-transactions',
    },
    {
      title: 'Ticket Promedio',
      value: formatCurrency(data.average_ticket),
      icon: TrendingUp,
      testId: 'average-ticket',
    },
    {
      title: 'Items Vendidos',
      value: data.items_sold.toString(),
      icon: Package,
      testId: 'items-sold',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="summary-cards">
      {cards.map((card) => (
        <Card key={card.testId} className="border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p
                  className={cn('text-3xl font-bold tracking-tight text-foreground', loading && 'animate-pulse')}
                  data-testid={card.testId}
                >
                  {loading ? '...' : card.value}
                </p>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <card.icon className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
