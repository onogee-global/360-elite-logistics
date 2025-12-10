"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/lib/cart-store"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Banknote, Package, MapPin } from "lucide-react"
import Image from "next/image"
import { useLocale } from "@/lib/locale-context"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const { toast } = useToast()
  const { locale } = useLocale()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    paymentMethod: "card" as "card" | "cash",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const subtotal = getTotal()
  const deliveryFee = subtotal >= 3000 ? 0 : 199
  const total = subtotal + deliveryFee

  if (items.length === 0) {
    router.push("/cart")
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Create order ID
    const orderId = `ORD-${Date.now()}`

    // Clear cart
    clearCart()

    toast({
      title: "Porudžbina uspešna!",
      description: `Vaša porudžbina #${orderId} je primljena.`,
    })

    // Redirect to success page
    router.push(`/checkout/success?orderId=${orderId}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Plaćanje</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                  Informacije o dostavi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ime i prezime *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Petar Petrović"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+381 60 123 4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="petar@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresa *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Kneza Miloša 10"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Grad *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      placeholder="Beograd"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">Poštanski broj *</Label>
                    <Input
                      id="zip"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      required
                      placeholder="11000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
                  Način plaćanja
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, paymentMethod: value as "card" | "cash" }))
                  }
                >
                  <div className="flex items-center space-x-3 border rounded-lg p-3 md:p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 md:gap-3 cursor-pointer flex-1">
                      <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm md:text-base">Platna kartica</div>
                        <div className="text-xs md:text-sm text-muted-foreground">Plaćanje karticom pri dostavi</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 border rounded-lg p-3 md:p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center gap-2 md:gap-3 cursor-pointer flex-1">
                      <Banknote className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm md:text-base">Gotovina</div>
                        <div className="text-xs md:text-sm text-muted-foreground">Plaćanje gotovinom pri dostavi</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Package className="h-4 w-4 md:h-5 md:w-5" />
                  Pregled porudžbine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Products */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => {
                    const finalPrice = item.product.discount
                      ? item.product.price * (1 - item.product.discount / 100)
                      : item.product.price

                    const productName = locale === "en" ? item.product.nameEn : item.product.name

                    return (
                      <div key={item.product.id} className="flex gap-2 md:gap-3">
                        <div className="relative h-12 w-12 md:h-16 md:w-16 flex-shrink-0">
                          <Image
                            src={item.product.image || "/placeholder.svg"}
                            alt={productName}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-medium line-clamp-2">{productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity}x {finalPrice.toFixed(2)} RSD
                          </p>
                        </div>
                        <div className="text-xs md:text-sm font-semibold">
                          {(finalPrice * item.quantity).toFixed(2)} RSD
                        </div>
                      </div>
                    )
                  })}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Proizvodi</span>
                    <span className="font-medium">{subtotal.toFixed(2)} RSD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dostava</span>
                    <span className="font-medium">
                      {deliveryFee === 0 ? "Besplatno" : `${deliveryFee.toFixed(2)} RSD`}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-base md:text-lg font-semibold">Ukupno</span>
                  <span className="text-xl md:text-2xl font-bold">{total.toFixed(2)} RSD</span>
                </div>

                {/* Submit Button */}
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Obrađuje se..." : "Potvrdi porudžbinu"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Klikom na dugme potvrđujete da ste pročitali i prihvatili naše uslove korišćenja
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
