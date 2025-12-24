"use client";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/locale-context";

export function AdminHeader() {
  const { t, locale } = useLocale();
  const backLabel = t
    ? t("admin.back")
    : locale === "sr"
    ? "Nazad na sajt"
    : "Back to site";
  const title = t
    ? t("admin.headerTitle")
    : locale === "sr"
    ? "Administracija"
    : "Admin Panel";
  const subtitle = t
    ? t("admin.headerSubtitle")
    : locale === "sr"
    ? "Upravljajte proizvodima, kategorijama i porudžbinama"
    : "Manage products, categories, and orders";

  return (
    <div className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Shield className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h1 className="text-xl font-bold">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
