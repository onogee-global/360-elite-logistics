"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Package, Home } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { fetchOrderDetail } from "@/lib/supabase";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "N/A";
  const { t, locale } = useLocale();
  const [displayOrderNumber, setDisplayOrderNumber] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!orderId || orderId === "N/A") return;
      try {
        const detail = await fetchOrderDetail(orderId);
        if (!cancelled) {
          if (detail?.orderNumber) {
            setDisplayOrderNumber(String(detail.orderNumber));
          } else {
            setDisplayOrderNumber(orderId);
          }
        }
      } catch {
        if (!cancelled) setDisplayOrderNumber(orderId);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-primary/10 p-6">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4">{t("orderSuccess")}</h1>
          <p className="text-muted-foreground mb-8">
            {t("orderSuccessMessage")}
          </p>

          <div className="bg-muted rounded-lg p-6 mb-8">
            <div className="flex flex-col items-center gap-1 mb-2">
              <div className="flex items-center justify-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t("orderNumber")}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {t("orderNumberHint")}
              </span>
            </div>
            <p className="text-2xl font-bold">{displayOrderNumber || "…"}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 text-left">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  {locale === "en"
                    ? "Order confirmation"
                    : "Potvrda porudžbine"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {locale === "en"
                    ? "We sent you an email with order details."
                    : "Poslali smo vam email sa detaljima porudžbine."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  {locale === "en"
                    ? "Order preparation"
                    : "Priprema porudžbine"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {locale === "en"
                    ? "Our team will prepare your order and contact you to confirm delivery time."
                    : "Naš tim će pripremiti vašu porudžbinu i kontaktirati vas za potvrdu termina dostave."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">
                  {locale === "en" ? "Delivery" : "Dostava"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {locale === "en"
                    ? "Your order will be delivered to the address you provided at the agreed time."
                    : "Vaša porudžbina će biti dostavljena na adresu koju ste naveli u dogovorenom terminu."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                {locale === "en" ? "Back to home" : "Nazad na početnu"}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/products">
                {locale === "en" ? "Continue shopping" : "Nastavi kupovinu"}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
