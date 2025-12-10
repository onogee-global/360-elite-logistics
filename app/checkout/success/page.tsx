"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Package, Home } from "lucide-react"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId") || "N/A"

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-primary/10 p-6">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4">Porudžbina uspešno primljena!</h1>
          <p className="text-muted-foreground mb-8">
            Hvala vam na poverenju. Vaša porudžbina je uspešno primljena i biće dostavljena u najkraćem mogućem roku.
          </p>

          <div className="bg-muted rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Broj porudžbine</span>
            </div>
            <p className="text-2xl font-bold">{orderId}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 text-left">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Potvrda porudžbine</h3>
                <p className="text-sm text-muted-foreground">
                  Poslali smo vam email sa detaljima porudžbine na vašu email adresu.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Priprema porudžbine</h3>
                <p className="text-sm text-muted-foreground">
                  Naš tim će pripremiti vašu porudžbinu i kontaktirati vas za potvrdu termina dostave.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Dostava</h3>
                <p className="text-sm text-muted-foreground">
                  Vaša porudžbina će biti dostavljena na adresu koju ste naveli u dogovorenom terminu.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Nazad na početnu
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/products">Nastavi kupovinu</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
