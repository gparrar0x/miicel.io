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

interface TopCategory {
  name: string
  items_sold: number
  revenue: number
  percentage: number
}

interface TopCategoriesProps {
  data: TopCategory[]
  onExport: () => void
}

const CATEGORY_EMOJIS: Record<string, string> = {
  PANCHOS: '🌭',
  CERVEZA: '🍺',
  BEBIDAS: '🥤',
  COMBOS: '🍔',
  POSTRES: '🍰',
  APERITIVOS: '🍿',
  default: '📦',
}

export function TopCategories({ data, onExport }: TopCategoriesProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getCategoryEmoji = (category: string) => {
    const upperCategory = category.toUpperCase()
    return CATEGORY_EMOJIS[upperCategory] || CATEGORY_EMOJIS.default
  }

  return (
    <Card data-testid="top-categories">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Top Categorías</CardTitle>
        <Button variant="ghost" size="sm" onClick={onExport} data-testid="export-btn-categories">
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
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((category) => (
                <TableRow key={category.name}>
                  <TableCell className="font-medium">
                    <span className="mr-2">{getCategoryEmoji(category.name)}</span>
                    {category.name}
                  </TableCell>
                  <TableCell className="text-right">{category.items_sold} items</TableCell>
                  <TableCell className="text-right">{formatCurrency(category.revenue)}</TableCell>
                  <TableCell className="text-right">{category.percentage.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
