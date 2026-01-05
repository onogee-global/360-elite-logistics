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
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { fetchOrdersForUser, type OrderSummary, getUserProfile, upsertUserProfile, type UserProfile } from "@/lib/supabase";

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [authChecked, setAuthChecked] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [activeTab, setActiveTab] = useState<"account" | "orders">("account");

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
      // Load profile from user_profiles (upsert later if missing)
      try {
        const p = await getUserProfile(u.id);
        setProfile(
          p ?? {
            userId: u.id,
            companyName: "",
            pib: "",
            address: "",
            city: "",
            phone: "",
            contactName: "",
          },
        );
      } catch {
        setProfile({
          userId: u.id,
          companyName: "",
          pib: "",
          address: "",
          city: "",
          phone: "",
          contactName: "",
        });
      }
      // Load orders
      try {
        const list = await fetchOrdersForUser(u.id);
        setOrders(list);
      } catch {
        setOrders([]);
      }
      setAuthChecked(true);
    }
    load();
    // Restore UI state: tab and scroll position
    const urlTab = (searchParams?.get("tab") as "account" | "orders" | null) ?? null;
    const savedTab = (typeof window !== "undefined"
      ? (sessionStorage.getItem("account.activeTab") as "account" | "orders" | null)
      : null) ?? null;
    const nextTab = urlTab || savedTab;
    if (nextTab) setActiveTab(nextTab);
    const resume = typeof window !== "undefined" ? sessionStorage.getItem("account.resume") : null;
    if (resume) {
      try {
        const { scrollY } = JSON.parse(resume) as { scrollY?: number };
        if (typeof scrollY === "number") {
          requestAnimationFrame(() => window.scrollTo(0, scrollY));
        }
      } catch {}
      sessionStorage.removeItem("account.resume");
    }
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  const handleSaveAccount = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        router.replace(`/login?redirect=${encodeURIComponent("/account")}`);
        return;
      }
      if (!profile) return;
      await upsertUserProfile(profile);
      toast({
        title: "Podaci sačuvani",
        description: "Profil je uspešno sačuvan",
      });
    } catch (err: any) {
      toast({
        title: "Greška pri čuvanju",
        description: err?.message || "Pokušajte ponovo kasnije",
        variant: "destructive",
      });
    }
  };

  // removed separate address save; unified into handleSaveAccount

  // Orders loaded from Supabase (see useEffect)

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

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          const v = (val as "account" | "orders") ?? "account";
          setActiveTab(v);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("account.activeTab", v);
          }
          // Update URL (shallow) to persist tab
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("tab", v);
            router.replace(url.pathname + "?" + url.searchParams.toString());
          }
        }}
        className="space-y-6"
      >
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
                Podaci o kompaniji
              </CardTitle>
              <CardDescription>
                Popunite podatke za dostavu i kontakt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Kompanija</Label>
                <Input
                  id="company"
                  value={profile?.companyName ?? ""}
                  onChange={(e) => setProfile((p) => (p ? { ...p, companyName: e.target.value } : p))}
                  placeholder="Naziv kompanije"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pib">PIB</Label>
                <Input
                  id="pib"
                  value={profile?.pib ?? ""}
                  onChange={(e) => setProfile((p) => (p ? { ...p, pib: e.target.value } : p))}
                  placeholder="123456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr-street">Adresa</Label>
                <Input
                  id="addr-street"
                  value={profile?.address ?? ""}
                  onChange={(e) => setProfile((p) => (p ? { ...p, address: e.target.value } : p))}
                  placeholder="Kneza Miloša 10"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="addr-city">Grad</Label>
                  <Input
                    id="addr-city"
                    value={profile?.city ?? ""}
                    onChange={(e) => setProfile((p) => (p ? { ...p, city: e.target.value } : p))}
                    placeholder="Beograd"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Kontakt telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile?.phone ?? ""}
                    onChange={(e) => setProfile((p) => (p ? { ...p, phone: e.target.value } : p))}
                    placeholder="+381 60 123 4567"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-name">Ime i prezime (kontakt)</Label>
                <Input
                  id="contact-name"
                  value={profile?.contactName ?? ""}
                  onChange={(e) => setProfile((p) => (p ? { ...p, contactName: e.target.value } : p))}
                  placeholder="Petar Petrović"
                />
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
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nemate porudžbina.
                  </p>
                ) : (
                  orders.map((order) => (
                    <div key={order.id}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">
                            {typeof order.orderNumber === "number"
                              ? `Porudžbina ${order.orderNumber}.`
                              : `Porudžbina #${order.id}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString("sr-RS")}{" "}
                            • {order.itemsCount} proizvoda
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {order.total.toFixed(2)} RSD
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (typeof window !== "undefined") {
                                sessionStorage.setItem(
                                  "account.resume",
                                  JSON.stringify({
                                    tab: activeTab,
                                    scrollY: window.scrollY,
                                    ts: Date.now(),
                                  }),
                                );
                                sessionStorage.setItem("account.activeTab", activeTab);
                              }
                              router.push(`/account/orders/${order.id}`);
                            }}
                          >
                            Prikaži detalje
                          </Button>
                        </div>
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
