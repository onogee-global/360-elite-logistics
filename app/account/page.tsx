"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { User, Package, MapPin, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [authChecked, setAuthChecked] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [addressData, setAddressData] = useState({
    street: "",
    city: "",
    zip: "",
    country: "",
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      const u = data.user;
      if (!u) {
        router.replace(`/login?redirect=${encodeURIComponent("/account")}`);
        return;
      }
      const meta = (u as any)?.user_metadata ?? {};
      setProfileData({
        name: meta.name || meta.full_name || u.email?.split("@")[0] || "",
        email: u.email || "",
        phone: meta.phone || "",
      });
      setAddressData({
        street: meta.street || "",
        city: meta.city || "",
        zip: meta.zip || "",
        country: meta.country || "",
      });
      setAuthChecked(true);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSaveAccount = () => {
    toast({
      title: "Podaci sačuvani",
      description: "Vaš profil i adresa su uspešno sačuvani",
    });
  };

  // removed separate address save; unified into handleSaveAccount

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
  ];

  if (!authChecked) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Moj nalog</h1>
        <p className="text-muted-foreground">
          Upravljajte vašim nalogom i porudžbinama
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profil i adrese</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Porudžbine</span>
          </TabsTrigger>
        </TabsList>

        {/* Account Tab (Profile + Addresses merged) */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Lični podaci
              </CardTitle>
              <CardDescription>
                Ažurirajte vaše lične informacije
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Ime i prezime</Label>
                <Input
                  id="profile-name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-email">Email adresa</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-phone">Telefon</Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                />
              </div>

              {/* single save button moved below address section */}

              <div className="space-y-2">
                <Label htmlFor="addr-street">Ulica i broj</Label>
                <Input
                  id="addr-street"
                  value={addressData.street}
                  onChange={(e) =>
                    setAddressData((prev) => ({
                      ...prev,
                      street: e.target.value,
                    }))
                  }
                  placeholder="Kneza Miloša 10"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="addr-city">Grad</Label>
                  <Input
                    id="addr-city"
                    value={addressData.city}
                    onChange={(e) =>
                      setAddressData((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    placeholder="Beograd"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr-zip">Poštanski broj</Label>
                  <Input
                    id="addr-zip"
                    value={addressData.zip}
                    onChange={(e) =>
                      setAddressData((prev) => ({
                        ...prev,
                        zip: e.target.value,
                      }))
                    }
                    placeholder="11000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr-country">Država</Label>
                  <Input
                    id="addr-country"
                    value={addressData.country}
                    onChange={(e) =>
                      setAddressData((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    placeholder="Srbija"
                  />
                </div>
              </div>
              <div className="pt-4">
                <Button onClick={handleSaveAccount}>Sačuvaj</Button>
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
                        <p className="font-bold">
                          {order.total.toFixed(2)} RSD
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.status}
                        </p>
                      </div>
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
