import type React from "react"
import Link from "next/link"
import { LayoutDashboard, Package, ShoppingCart, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Header */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
                M
              </div>
              <div>
                <h1 className="text-xl font-bold">MAXI Admin</h1>
                <p className="text-sm text-muted-foreground">Administratorska kontrolna tabla</p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Nazad na sajt
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-2 sticky top-8">
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-background transition-colors"
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="font-medium">Kontrolna tabla</span>
              </Link>
              <Link
                href="/admin/products"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-background transition-colors"
              >
                <Package className="h-5 w-5" />
                <span className="font-medium">Proizvodi</span>
              </Link>
              <Link
                href="/admin/orders"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-background transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium">Porudžbine</span>
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
