"use client";

import Link from "next/link";
import { FolderTree, Package, Percent } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const { t } = useLocale();
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);
  return (
    <aside className="w-64 flex-shrink-0">
      <nav className="space-y-2 sticky top-8">
        <Link
          href="/admin/categories"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-background transition-colors",
            isActive("/admin/categories") && "bg-background font-semibold"
          )}
        >
          <FolderTree className="h-5 w-5" />
          <span className="font-medium">{t("categories")}</span>
        </Link>
        <Link
          href="/admin/products"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-background transition-colors",
            isActive("/admin/products") && "bg-background font-semibold"
          )}
        >
          <Package className="h-5 w-5" />
          <span className="font-medium">{t("admin.products.title")}</span>
        </Link>
        <Link
          href="/admin/promo-codes"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-background transition-colors",
            isActive("/admin/promo-codes") && "bg-background font-semibold"
          )}
        >
          <Percent className="h-5 w-5" />
          <span className="font-medium">Promo kodovi</span>
        </Link>
      </nav>
    </aside>
  );
}
