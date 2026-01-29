"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, Product, ProductVariation } from "./types"

export interface AppliedPromo {
  code: string
  discount: number
}

interface CartStore {
  items: CartItem[]
  appliedPromo: AppliedPromo | null
  setAppliedPromo: (promo: AppliedPromo | null) => void
  addItem: (product: Product, variation: ProductVariation) => void
  removeItem: (variationId: string) => void
  updateQuantity: (variationId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedPromo: null,
      setAppliedPromo: (promo) => set({ appliedPromo: promo }),
      addItem: (product, variation) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.variation.id === variation.id)
          if (existingItem) {
            const newQty = Math.min(99999, existingItem.quantity + 1)
            return {
              items: state.items.map((item) =>
                item.variation.id === variation.id ? { ...item, quantity: newQty } : item,
              ),
            }
          }
          return { items: [...state.items, { product, variation, quantity: 1 }] }
        })
      },
      removeItem: (variationId) => {
        set((state) => ({
          items: state.items.filter((item) => item.variation.id !== variationId),
        }))
      },
      updateQuantity: (variationId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variationId)
          return
        }
        const clamped = Math.min(99999, Math.max(1, Math.round(quantity)))
        set((state) => ({
          items: state.items.map((item) => (item.variation.id === variationId ? { ...item, quantity: clamped } : item)),
        }))
      },
      clearCart: () => set({ items: [], appliedPromo: null }),
      getTotal: () => {
        return get().items.reduce((total, item) => {
          const isBaseItem = item.variation.id.startsWith("base-")
          const basePrice = item.variation.price
          const variationDiscount =
            !isBaseItem && typeof (item.variation as any)?.discount === "number"
              ? ((item.variation as any).discount as number)
              : 0
          // Apply discount: product-level for base option; variation-level for variations
          const effectiveUnitPrice =
            isBaseItem && typeof item.product.discount === "number"
              ? basePrice * (1 - (item.product.discount as number) / 100)
              : variationDiscount > 0
              ? basePrice * (1 - variationDiscount / 100)
              : basePrice
          return total + effectiveUnitPrice * item.quantity
        }, 0)
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      // Bump storage key to avoid incompatible type issues after refactor
      name: "cart-storage-v2",
    },
  ),
)
