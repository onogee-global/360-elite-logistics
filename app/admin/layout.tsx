import type React from "react";
import Link from "next/link";
import { FolderTree, Package } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Header */}
      <AdminHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-2 sticky top-8">
              <Link
                href="/admin/categories"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-background transition-colors"
              >
                <FolderTree className="h-5 w-5" />
                <span className="font-medium">Kategorije</span>
              </Link>
              <Link
                href="/admin/products"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-background transition-colors"
              >
                <Package className="h-5 w-5" />
                <span className="font-medium">Proizvodi</span>
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
