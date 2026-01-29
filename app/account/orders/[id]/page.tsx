"use client";

import { use as usePromise, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const { id } = usePromise(params);
  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace(
          `/login?redirect=${encodeURIComponent(`/account/orders/${id}`)}`
        );
        return;
      }
      const { fetchOrderDetail } = await import("@/lib/supabase");
      const detail = await fetchOrderDetail(id);
      if (!cancelled) {
        setOrder(detail);
        setAuthChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  const handleRepeatOrder = async () => {
    if (!order) return;
    const { fetchProductById } = await import("@/lib/supabase");
    // Clear current cart before rebuilding from order
    clearCart();
    let added = 0;
    for (const it of order.items as Array<any>) {
      try {
        const productId: string | null = it.productId ?? null;
        const variationId: string | null = it.variationId ?? null;
        if (!productId) continue;
        const product = await fetchProductById(productId);
        if (!product) continue;
        // Find or synthesize variation
        let variation: any = null;
        if (variationId && !String(variationId).startsWith("base-")) {
          variation = (product.variations ?? []).find((v) => v.id === variationId) ?? null;
        } else {
          variation = {
            id: `base-${product.id}`,
            productId: product.id,
            name: product.name,
            nameEn: product.nameEn,
            price: product.price ?? 0,
            unit: product.unit ?? "",
            unitEn: product.unitEn ?? "",
            inStock: product.inStock ?? true,
            imageUrl: product.image,
            isActive: true,
          };
        }
        if (!variation || (variation.price ?? 0) <= 0) continue;
        const qty = Math.max(1, Number(it.quantity ?? 1));
        for (let i = 0; i < qty; i++) {
          addItem(product as any, variation as any);
        }
        added += qty;
      } catch {
        // skip on error
      }
    }
    // Navigate to cart
    router.push("/cart");
  };

  if (!authChecked) return null;
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Porudžbina nije pronađena</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/account">Nazad na nalog</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">
          {typeof order.orderNumber === "number"
            ? `Porudžbina #${order.orderNumber}`
            : `Porudžbina #${order.id}`}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRepeatOrder}>
            Ponovi porudžbinu
          </Button>
          <Button asChild variant="outline">
            <Link href="/account">Nazad</Link>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            Kreirano: {new Date(order.createdAt).toLocaleString("sr-RS")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.items.map((it: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {(it.variationName && it.variationName.trim()) || it.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {it.quantity} × {it.unitPrice.toFixed(2)} RSD
                  </p>
                </div>
                <div className="font-semibold whitespace-nowrap">
                  {(it.quantity * it.unitPrice).toFixed(2)} RSD
                </div>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Ukupno</span>
            <span className="text-xl font-bold">
              {order.total.toFixed(2)} RSD
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
