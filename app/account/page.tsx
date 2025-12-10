"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { User, Package, MapPin, Settings, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AccountPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [profileData, setProfileData] = useState({
    name: "Petar Petrović",
    email: "petar@example.com",
    phone: "+381 60 123 4567",
  })

  const handleLogout = () => {
    toast({
      title: "Odjavljeni ste",
      description: "Uspešno ste se odjavili sa vašeg naloga",
    })
    router.push("/")
  }

  const handleSaveProfile = () => {
    toast({
      title: "Profil ažuriran",
      description: "Vaši podaci su uspešno sačuvani",
    })
  }

  // Mock order data
  const orders = [
    {
      id: "ORD-1234567890",
      date: "15.01.2025",
      total: 4599.99,
      status: "Dostavljeno",
      items: 8,
    },
    {
      id: "ORD-1234567891",
      date: "10.01.2025",
      total: 2899.99,
      status: "U pripremi",
      items: 5,
    },
    {
      id: "ORD-1234567892",
      date: "05.01.2025",
      total: 3299.99,
      status: "Dostavljeno",
      items: 12,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Moj nalog</h1>
        <p className="text-muted-foreground">Upravljajte vašim nalogom i porudžbinama</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Porudžbine</span>
          </TabsTrigger>
          <TabsTrigger value="addresses" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Adrese</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Lični podaci
              </CardTitle>
              <CardDescription>Ažurirajte vaše lične informacije</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Ime i prezime</Label>
                <Input
                  id="profile-name"
                  value={profileData.name}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-email">Email adresa</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-phone">Telefon</Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveProfile}>Sačuvaj izmene</Button>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Odjavi se
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moje porudžbine</CardTitle>
              <CardDescription>Pregled svih vaših porudžbina</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.date} • {order.items} proizvoda
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{order.total.toFixed(2)} RSD</p>
                        <p className="text-sm text-muted-foreground">{order.status}</p>
                      </div>
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adrese za dostavu</CardTitle>
              <CardDescription>Upravljajte vašim adresama za dostavu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">Kućna adresa</p>
                      <p className="text-sm text-muted-foreground mt-1">Kneza Miloša 10</p>
                      <p className="text-sm text-muted-foreground">Beograd, 11000</p>
                      <p className="text-sm text-muted-foreground">Srbija</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Izmeni
                    </Button>
                  </div>
                </div>

                <Button variant="outline" className="w-full bg-transparent">
                  + Dodaj novu adresu
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
