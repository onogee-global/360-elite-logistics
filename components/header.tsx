"use client";

import type React from "react";
import Link from "next/link";
import {
  Search,
  User,
  Globe,
  Menu,
  Home,
  ShoppingBag,
  Info,
  Truck,
  Mail,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartDrawer } from "@/components/cart-drawer";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { locale, setLocale, t } = useLocale();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (!isMounted) return;
      const u = data.user;
      if (u) {
        setUserEmail(u.email ?? null);
        const meta = (u as any).user_metadata || {};
        setUserName(meta.name || meta.full_name || null);
      } else {
        setUserEmail(null);
        setUserName(null);
      }
    }
    loadUser();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });
    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const displayName = useMemo(() => {
    if (userName && userName.trim()) return userName;
    if (userEmail) return userEmail.split("@")[0];
    return null;
  }, [userName, userEmail]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/products", label: t("shop"), icon: ShoppingBag },
    { href: "/about", label: t("about"), icon: Info },
    { href: "/delivery", label: t("delivery"), icon: Truck },
    { href: "/contact", label: t("contact"), icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between md:justify-between gap-4 text-xs md:text-sm overflow-x-auto scrollbar-hide">
            <p className="whitespace-nowrap">
              {locale === "sr"
                ? "Dostava u vreme koje odaberete"
                : "Delivery at your chosen time"}
            </p>
            <p className="whitespace-nowrap hidden sm:block">
              {locale === "sr"
                ? "Poruči do 21h za sledeće jutro"
                : "Order by 9 PM for next morning"}
            </p>
            <p className="whitespace-nowrap hidden md:block">
              {locale === "sr"
                ? "Donosimo teške artikle do tvojih vrata"
                : "We bring heavy items to your door"}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center gap-2 md:gap-6">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-primary/10 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] sm:w-[350px] p-0 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-md">
                    360
                  </div>
                  <div>
                    <div className="font-bold text-lg leading-none">
                      <span className="text-primary">360</span>
                      <span className="text-accent">logistics</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {locale === "sr" ? "Vaša prodavnica" : "Your store"}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1 px-4 py-6">
                <nav className="space-y-2">
                  {navLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium hover:bg-primary/10 hover:text-primary transition-all duration-200 group animate-in slide-in-from-left"
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-6 pt-6 border-t">
                  {displayName ? (
                    <div className="px-4 space-y-2">
                      <Link
                        href="/account"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/20 transition-colors">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="truncate max-w-[160px]">
                          {displayName}
                        </span>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={handleLogout}
                      >
                        {locale === "sr" ? "Odjava" : "Logout"}
                      </Button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/20 transition-colors">
                        <User className="h-4 w-4" />
                      </div>
                      <span>
                        {t("login")} / {t("register")}
                      </span>
                    </Link>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="px-4 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {locale === "sr" ? "Jezik" : "Language"}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-12 hover:bg-primary/10 hover:text-primary hover:border-primary transition-all bg-transparent"
                    onClick={() => {
                      setLocale(locale === "sr" ? "en" : "sr");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Globe className="h-4 w-4" />
                    <span className="font-medium">
                      {locale === "sr" ? "English" : "Srpski"}
                    </span>
                  </Button>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm md:text-lg">
              360
            </div>
            <span className="text-lg md:text-2xl font-bold">
              <span className="text-primary">360</span>
              <span className="text-accent">logistics</span>
            </span>
          </Link>

          <form
            onSubmit={handleSearch}
            className="hidden sm:flex flex-1 max-w-2xl"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("search")}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 md:gap-2 h-9 px-2 md:px-3"
              onClick={() => setLocale(locale === "sr" ? "en" : "sr")}
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs md:text-sm">
                {locale === "sr" ? "EN" : "SR"}
              </span>
            </Button>
            {displayName ? (
              <Link
                href="/account"
                className="gap-2 hidden md:flex items-center h-9 px-3 rounded-md hover:bg-primary/10 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium truncate max-w-[140px]">
                  {displayName}
                </span>
              </Link>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hidden md:flex"
                asChild
              >
                <Link href="/login">
                  <User className="h-4 w-4" />
                  <span>
                    {t("login")} / {t("register")}
                  </span>
                </Link>
              </Button>
            )}
            {displayName && (
              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex bg-transparent"
                onClick={handleLogout}
              >
                {locale === "sr" ? "Odjava" : "Logout"}
              </Button>
            )}
            <CartDrawer />
          </div>
        </div>

        <form onSubmit={handleSearch} className="sm:hidden mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("search")}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      <div className="border-t hidden md:block">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-6 py-3 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-primary font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
