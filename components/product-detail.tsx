"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Minus, Plus, ArrowLeft } from "lucide-react"
import type { Product, Category } from "@/lib/types"
import { useCartStore } from "@/lib/cart-store"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface ProductDetailProps {
  product: Product
  category?: Category
}

export function ProductDetail({ product, category }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)
  const { toast } = useToast()

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product)
    }
    toast({
      title: "Dodato u korpu",
      description: `${quantity}x ${product.name} je dodato u vašu korpu`,
    })
    setQuantity(1)
  }

  const finalPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 overflow-x-auto scrollbar-hide">
        <Link href="/" className="hover:text-foreground whitespace-nowrap">
          Početna
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground whitespace-nowrap">
          Proizvodi
        </Link>
        {category && (
          <>
            <span>/</span>
            <Link href={`/products?category=${category.slug}`} className="hover:text-foreground whitespace-nowrap">
              {category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground truncate">{product.name}</span>
      </div>

      <Button variant="ghost" size="sm" className="mb-4 md:mb-6" asChild>
        <Link href="/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Nazad na proizvode</span>
          <span className="sm:hidden">Nazad</span>
        </Link>
      </Button>

      {/* Product Image */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          {product.discount && (
            <Badge className="absolute top-3 right-3 md:top-4 md:right-4 z-10 bg-destructive text-destructive-foreground text-base md:text-lg px-2 py-1 md:px-3">
              -{product.discount}%
            </Badge>
          )}
          <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
        </div>

        {/* Product Info */}
        <div className="space-y-4 md:space-y-6">
          <div>
            {category && (
              <p className="text-xs md:text-sm text-muted-foreground mb-2">
                {category.icon} {category.name}
              </p>
            )}
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-sm md:text-base text-muted-foreground">{product.description}</p>
          </div>

          <Separator />

          {/* Price */}
          <div>
            <p className="text-xs md:text-sm text-muted-foreground mb-2">Cena</p>
            <div className="flex items-baseline gap-2 md:gap-3">
              {product.discount ? (
                <>
                  <span className="text-3xl md:text-4xl font-bold">{finalPrice.toFixed(2)} RSD</span>
                  <span className="text-lg md:text-xl text-muted-foreground line-through">
                    {product.price.toFixed(2)} RSD
                  </span>
                </>
              ) : (
                <span className="text-3xl md:text-4xl font-bold">{product.price.toFixed(2)} RSD</span>
              )}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Pakovanje: {product.unit}</p>
          </div>

          <Separator />

          {/* Quantity Selector */}
          <div>
            <p className="text-sm font-medium mb-3">Količina</p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">Ukupno: {(finalPrice * quantity).toFixed(2)} RSD</span>
            </div>
          </div>

          {/* Add to Cart */}
          <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={!product.inStock}>
            <ShoppingCart className="mr-2 h-5 w-5" />
            {product.inStock ? "Dodaj u korpu" : "Nema na stanju"}
          </Button>

          {/* Product Details */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <h3 className="font-semibold mb-4 text-sm md:text-base">Detalji proizvoda</h3>
              <dl className="space-y-2 text-xs md:text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Kategorija:</dt>
                  <dd className="font-medium">{category?.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Pakovanje:</dt>
                  <dd className="font-medium">{product.unit}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Dostupnost:</dt>
                  <dd className="font-medium">{product.inStock ? "Na stanju" : "Nema na stanju"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
