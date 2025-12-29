"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, Product, ProductVariation } from "./types"

interface CartStore {
  items: CartItem[]
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
      addItem: (product, variation) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.variation.id === variation.id)
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.variation.id === variation.id ? { ...item, quantity: item.quantity + 1 } : item,
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
        set((state) => ({
          items: state.items.map((item) => (item.variation.id === variationId ? { ...item, quantity } : item)),
        }))
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => {
          const isBaseItem = item.variation.id.startsWith("base-")
          const basePrice = item.variation.price
          // Apply product-level discount only to base option lines
          const effectiveUnitPrice =
            isBaseItem && typeof item.product.discount === "number"
              ? basePrice * (1 - item.product.discount / 100)
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
