"use client";

import { use as usePromise, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const { id } = usePromise(params);

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
          Porudžbina #{order.id}
        </h1>
        <Button asChild variant="outline">
          <Link href="/account">Nazad</Link>
        </Button>
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
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-12 w-12 rounded overflow-hidden flex-shrink-0 bg-white">
                    <Image
                      src={it.image || "/placeholder.svg"}
                      alt={it.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {it.name}
                      {it.variationName ? ` — ${it.variationName}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {it.quantity} × {it.unitPrice.toFixed(2)} RSD
                    </p>
                  </div>
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
