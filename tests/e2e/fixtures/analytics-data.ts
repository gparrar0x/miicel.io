/**
 * Analytics Test Data Fixtures
 *
 * Provides realistic test data for analytics dashboard tests.
 * Seeds realistic sales data for a 30-day period with:
 * - Multiple products across categories
 * - Mixed payment methods
 * - Various discount codes
 * - Distributed transactions
 */

export interface AnalyticsTestData {
  products: ProductData[]
  categories: CategoryData[]
  paymentMethods: PaymentMethodData[]
  discountCodes: DiscountCodeData[]
  transactions: TransactionData[]
  dateRange: DateRange
}

export interface ProductData {
  id: string
  name: string
  category: string
  quantity: number
  revenue: number
  percentOfTotal: number
}

export interface CategoryData {
  name: string
  itemsSold: number
  revenue: number
  percentOfTotal: number
}

export interface PaymentMethodData {
  name: 'MercadoPago' | 'Efectivo'
  count: number
  amount: number
}

export interface DiscountCodeData {
  source: string
  count: number
  amount: number
}

export interface TransactionData {
  id: string
  date: Date
  product: string
  quantity: number
  revenue: number
  paymentMethod: string
  discount?: string
}

export interface DateRange {
  start: Date
  end: Date
}

/**
 * Generate realistic analytics test data for a 30-day period
 * Includes seasonal variations and realistic distributions
 *
 * @param daysBack - Number of days back from today to start (default: 30)
 * @returns Complete analytics dataset
 */
export function generateAnalyticsTestData(daysBack: number = 30): AnalyticsTestData {
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - daysBack * 24 * 60 * 60 * 1000)

  // Base products (Hot Dog shop example)
  const baseProducts = [
    { name: 'Classic Hot Dog', category: 'Main Course', unitPrice: 8.99 },
    { name: 'Cheese Hot Dog', category: 'Main Course', unitPrice: 10.49 },
    { name: 'Bacon Hot Dog', category: 'Main Course', unitPrice: 12.99 },
    { name: 'Jalapeño Special', category: 'Main Course', unitPrice: 11.99 },
    { name: 'Double Meat', category: 'Main Course', unitPrice: 14.99 },
    { name: 'Combo Meal', category: 'Combos', unitPrice: 16.99 },
    { name: 'Family Pack (4)', category: 'Combos', unitPrice: 32.99 },
    { name: 'Fries', category: 'Sides', unitPrice: 3.99 },
    { name: 'Drink (Soda)', category: 'Beverages', unitPrice: 2.99 },
    { name: 'Milkshake', category: 'Beverages', unitPrice: 5.99 },
  ]

  // Generate transactions
  const transactions: TransactionData[] = []
  const productSales: Record<string, { qty: number; revenue: number }> = {}
  const categorySales: Record<string, { qty: number; revenue: number }> = {}

  // Simulate realistic daily sales (weekends higher)
  for (let day = 0; day < daysBack; day++) {
    const currentDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000)
    const dayOfWeek = currentDate.getDay()

    // Weekends have more sales
    const dailyTransactions = dayOfWeek === 0 || dayOfWeek === 6 ? 25 : 15

    for (let i = 0; i < dailyTransactions; i++) {
      // Randomize product selection (some products more popular)
      const productIndex = Math.floor(Math.random() * baseProducts.length)
      const product = baseProducts[productIndex]

      // Higher quantity on weekends
      const baseQty = Math.random() < 0.7 ? 1 : dayOfWeek === 0 || dayOfWeek === 6 ? 2 : 1
      const quantity = Math.max(1, baseQty + (Math.random() < 0.2 ? 1 : 0))

      const unitPrice = product.unitPrice
      let revenue = unitPrice * quantity

      // Random discount (20% of transactions)
      let discountApplied: string | undefined
      if (Math.random() < 0.2) {
        const discountPercent = Math.random() < 0.6 ? 10 : 20
        revenue *= (1 - discountPercent / 100)
        discountApplied = Math.random() < 0.5 ? 'RedBag8' : 'LOCAL_PROMO'
      }

      const transaction: TransactionData = {
        id: `TRX-${Date.now()}-${i}`,
        date: currentDate,
        product: product.name,
        quantity,
        revenue: Math.round(revenue * 100) / 100,
        paymentMethod: Math.random() < 0.6 ? 'MercadoPago' : 'Efectivo',
        discount: discountApplied,
      }

      transactions.push(transaction)

      // Aggregate product sales
      if (!productSales[product.name]) {
        productSales[product.name] = { qty: 0, revenue: 0 }
      }
      productSales[product.name].qty += quantity
      productSales[product.name].revenue += revenue

      // Aggregate category sales
      if (!categorySales[product.category]) {
        categorySales[product.category] = { qty: 0, revenue: 0 }
      }
      categorySales[product.category].qty += quantity
      categorySales[product.category].revenue += revenue
    }
  }

  // Calculate totals
  const totalRevenue = Object.values(productSales).reduce((sum, p) => sum + p.revenue, 0)
  const totalItems = Object.values(productSales).reduce((sum, p) => sum + p.qty, 0)
  const totalTransactions = transactions.length

  // Build products array (sorted by revenue, top 10)
  const products: ProductData[] = Object.entries(productSales)
    .map(([name, { qty, revenue }]) => {
      const product = baseProducts.find(p => p.name === name)!
      return {
        id: `PRD-${name.replace(/\s+/g, '-').toLowerCase()}`,
        name,
        category: product.category,
        quantity: qty,
        revenue: Math.round(revenue * 100) / 100,
        percentOfTotal: (revenue / totalRevenue) * 100,
      }
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  // Build categories array (sorted by revenue)
  const categories: CategoryData[] = Object.entries(categorySales)
    .map(([name, { qty, revenue }]) => ({
      name,
      itemsSold: qty,
      revenue: Math.round(revenue * 100) / 100,
      percentOfTotal: (revenue / totalRevenue) * 100,
    }))
    .sort((a, b) => b.revenue - a.revenue)

  // Build payment methods
  const paymentStats: Record<string, { count: number; amount: number }> = {}
  transactions.forEach(tx => {
    if (!paymentStats[tx.paymentMethod]) {
      paymentStats[tx.paymentMethod] = { count: 0, amount: 0 }
    }
    paymentStats[tx.paymentMethod].count += 1
    paymentStats[tx.paymentMethod].amount += tx.revenue
  })

  const paymentMethods: PaymentMethodData[] = Object.entries(paymentStats).map(([name, stats]) => ({
    name: name as 'MercadoPago' | 'Efectivo',
    count: stats.count,
    amount: Math.round(stats.amount * 100) / 100,
  }))

  // Build discount codes
  const discountStats: Record<string, { count: number; amount: number }> = {}
  transactions.forEach(tx => {
    if (tx.discount) {
      if (!discountStats[tx.discount]) {
        discountStats[tx.discount] = { count: 0, amount: 0 }
      }
      discountStats[tx.discount].count += 1
      // Discount amount is the reduction, not the transaction amount
      const originalPrice = tx.revenue / 0.9 // Assume ~10-20% discount average
      const discountAmount = originalPrice - tx.revenue
      discountStats[tx.discount].amount += discountAmount
    }
  })

  const discountCodes: DiscountCodeData[] = Object.entries(discountStats).map(([source, stats]) => ({
    source,
    count: stats.count,
    amount: Math.round(stats.amount * 100) / 100,
  }))

  return {
    products,
    categories,
    paymentMethods,
    discountCodes,
    transactions,
    dateRange: {
      start: startDate,
      end: endDate,
    },
  }
}

/**
 * Get realistic summary metrics from test data
 */
export function calculateSummaryMetrics(data: AnalyticsTestData) {
  const totalRevenue = data.transactions.reduce((sum, tx) => sum + tx.revenue, 0)
  const totalItems = data.transactions.reduce((sum, tx) => sum + tx.quantity, 0)
  const averageTicket = totalRevenue / data.transactions.length

  return {
    totalSales: Math.round(totalRevenue * 100) / 100,
    totalTransactions: data.transactions.length,
    averageTicket: Math.round(averageTicket * 100) / 100,
    itemsSold: totalItems,
  }
}

/**
 * Generate empty dataset (no sales for date range)
 */
export function generateEmptyAnalyticsData(): AnalyticsTestData {
  return {
    products: [],
    categories: [],
    paymentMethods: [],
    discountCodes: [],
    transactions: [],
    dateRange: {
      start: new Date(),
      end: new Date(),
    },
  }
}

/**
 * Simulate analytics data for specific scenarios
 */
export const AnalyticsScenarios = {
  /**
   * Last 30 days with realistic data
   */
  last30Days: (): AnalyticsTestData => generateAnalyticsTestData(30),

  /**
   * Single day with limited transactions
   */
  today: (): AnalyticsTestData => generateAnalyticsTestData(1),

  /**
   * Current week
   */
  thisWeek: (): AnalyticsTestData => generateAnalyticsTestData(7),

  /**
   * No data (future date range)
   */
  empty: (): AnalyticsTestData => generateEmptyAnalyticsData(),

  /**
   * High volume day (e.g., promotion)
   */
  promotionDay: (): AnalyticsTestData => {
    const data = generateAnalyticsTestData(1)
    // Triple the transactions for promotion scenario
    const baseTransactions = data.transactions

    for (let i = 0; i < baseTransactions.length * 2; i++) {
      const baseTx = baseTransactions[i % baseTransactions.length]
      data.transactions.push({
        ...baseTx,
        id: `TRX-PROMO-${i}`,
      })
    }

    return data
  },
}

/**
 * Format analytics data for API mock responses
 */
export function formatAnalyticsResponse(data: AnalyticsTestData) {
  const metrics = calculateSummaryMetrics(data)

  return {
    metrics,
    products: data.products,
    categories: data.categories,
    paymentMethods: data.paymentMethods,
    discounts: data.discountCodes,
    dateRange: data.dateRange,
  }
}
