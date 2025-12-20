"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Package, ShoppingCart, Users, TrendingUp, DollarSign } from "lucide-react"

export default function AdminDashboardPage() {
  // Mock statistics
  const stats = [
    {
      title: "Ukupna prodaja",
      value: "1,234,567 RSD",
      change: "+12.5%",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Porudžbine",
      value: "156",
      change: "+8.2%",
      icon: ShoppingCart,
      trend: "up",
    },
    {
      title: "Proizvodi",
      value: "342",
      change: "+5",
      icon: Package,
      trend: "up",
    },
    {
      title: "Korisnici",
      value: "1,234",
      change: "+23.1%",
      icon: Users,
      trend: "up",
    },
  ]

  const recentOrders = [
    { id: "ORD-001", customer: "Petar Petrović", total: 4599.99, status: "U pripremi", date: "15.01.2025" },
    { id: "ORD-002", customer: "Ana Anić", total: 2899.99, status: "Dostavljeno", date: "15.01.2025" },
    { id: "ORD-003", customer: "Marko Marković", total: 3299.99, status: "U pripremi", date: "14.01.2025" },
    { id: "ORD-004", customer: "Jovana Jovanović", total: 1899.99, status: "Otkazano", date: "14.01.2025" },
    { id: "ORD-005", customer: "Stefan Stefanović", total: 5499.99, status: "Dostavljeno", date: "13.01.2025" },
  ]

  const topProducts = [
    { name: "Mleko 2.8% mm Imlek", sales: 234, revenue: 35099.66 },
    { name: "Hleb beli", sales: 189, revenue: 13221.11 },
    { name: "Jogurt Čobanče 2.8%", sales: 156, revenue: 14038.44 },
    { name: "Coca Cola", sales: 145, revenue: 18848.55 },
    { name: "Jabuke Granny Smith", sales: 123, revenue: 19679.77 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Kontrolna tabla</h1>
        <p className="text-muted-foreground">Pregled performansi vaše prodavnice</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span className="text-primary">{stat.change}</span> od prošlog meseca
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Nedavne porudžbine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{order.total.toFixed(2)} RSD</p>
                    <p
                      className={`text-xs ${
                        order.status === "Dostavljeno"
                          ? "text-primary"
                          : order.status === "Otkazano"
                            ? "text-destructive"
                            : "text-muted-foreground"
                      }`}
                    >
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Najprodavaniji proizvodi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-1">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sales} prodaja</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{product.revenue.toFixed(2)} RSD</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
