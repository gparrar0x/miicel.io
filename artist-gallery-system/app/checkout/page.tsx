import { CheckoutForm } from "@/components/checkout/checkout-form"
import { Header } from "@/components/layout/header"

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-serif font-bold mb-8">Checkout</h1>
        <CheckoutForm />
      </main>
    </div>
  )
}
