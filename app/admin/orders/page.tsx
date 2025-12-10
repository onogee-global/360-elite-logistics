"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Mock orders data
  const orders = [
    {
      id: "ORD-1234567890",
      customer: "Petar Petrović",
      email: "petar@example.com",
      total: 4599.99,
      status: "pending" as const,
      date: "15.01.2025 14:30",
      items: 8,
    },
    {
      id: "ORD-1234567891",
      customer: "Ana Anić",
      email: "ana@example.com",
      total: 2899.99,
      status: "completed" as const,
      date: "15.01.2025 12:15",
      items: 5,
    },
    {
      id: "ORD-1234567892",
      customer: "Marko Marković",
      email: "marko@example.com",
      total: 3299.99,
      status: "processing" as const,
      date: "14.01.2025 18:45",
      items: 12,
    },
    {
      id: "ORD-1234567893",
      customer: "Jovana Jovanović",
      email: "jovana@example.com",
      total: 1899.99,
      status: "cancelled" as const,
      date: "14.01.2025 10:20",
      items: 3,
    },
    {
      id: "ORD-1234567894",
      customer: "Stefan Stefanović",
      email: "stefan@example.com",
      total: 5499.99,
      status: "completed" as const,
      date: "13.01.2025 16:00",
      items: 15,
    },
  ]

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleStatusChange = (orderId: string, newStatus: string) => {
    toast({
      title: "Status ažuriran",
      description: `Status porudžbine ${orderId} je promenjen`,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
            Na čekanju
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/20">
            U pripremi
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Dostavljeno
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            Otkazano
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Porudžbine</h1>
        <p className="text-muted-foreground">Upravljajte porudžbinama vaših kupaca</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pretraži porudžbine..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Prikazano {filteredOrders.length} od {orders.length} porudžbina
            </p>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Porudžbine</TableHead>
                  <TableHead>Kupac</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Proizvodi</TableHead>
                  <TableHead>Ukupno</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-muted-foreground">{order.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.items} proizvoda</TableCell>
                    <TableCell className="font-semibold">{order.total.toFixed(2)} RSD</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Na čekanju</SelectItem>
                          <SelectItem value="processing">U pripremi</SelectItem>
                          <SelectItem value="completed">Dostavljeno</SelectItem>
                          <SelectItem value="cancelled">Otkazano</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
