"use client";

import Link from "next/link";
import { FolderTree, Package, Percent } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

export function AdminSidebar() {
  const { t } = useLocale();
  return (
    <aside className="w-64 flex-shrink-0">
      <nav className="space-y-2 sticky top-8">
        <Link
          href="/admin/categories"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-background transition-colors"
        >
          <FolderTree className="h-5 w-5" />
          <span className="font-medium">{t("categories")}</span>
        </Link>
        <Link
          href="/admin/products"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-background transition-colors"
        >
          <Package className="h-5 w-5" />
          <span className="font-medium">{t("admin.products.title")}</span>
        </Link>
        <Link
          href="/admin/promo-codes"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-background transition-colors"
        >
          <Percent className="h-5 w-5" />
          <span className="font-medium">Promo kodovi</span>
        </Link>
      </nav>
    </aside>
  );
}
