"use client";

import type React from "react";
import Link from "next/link";
import Image from "next/image";
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
import { motion } from "framer-motion";

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
    try {
      await supabase.auth.signOut();
    } finally {
      // Optimistically clear local UI state and force a hard reload
      setUserEmail(null);
      setUserName(null);
      setMobileMenuOpen(false);
      if (typeof window !== "undefined") {
        window.location.assign("/");
      } else {
        router.replace("/");
        router.refresh();
      }
    }
  };

  const navLinks = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/products", label: t("shop"), icon: ShoppingBag },
    { href: "/employee-meals", label: t("mealsForEmployees"), icon: Truck },
    { href: "/about", label: t("about"), icon: Info },
    { href: "/delivery", label: t("delivery"), icon: Truck },
    { href: "/contact", label: t("contact"), icon: Mail },
  ];

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: scrolled
          ? "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)"
          : "none",
      }}
      transition={{
        opacity: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        y: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        boxShadow: { duration: 0.25 },
      }}
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80"
    >
      <div className="bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="container mx-auto px-4 py-2"
        >
          <div className="flex items-center justify-between md:justify-between gap-4 text-xs md:text-sm overflow-x-auto scrollbar-hide h-2">
            {/* <p className="whitespace-nowrap">
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
            </p> */}
          </div>
        </motion.div>
      </div>

      <motion.div
        className="container mx-auto px-4 py-3 md:py-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.06, delayChildren: 0.1 },
          },
        }}
      >
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
              className="w-[300px] sm:w-[350px] p-0 flex flex-col max-h-dvh h-dvh overflow-hidden pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] [&>button]:hidden"
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gradient-to-r from-primary/5 to-accent/5 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-md">
                    360
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-lg leading-none truncate">
                      <span className="text-primary">360</span>
                      <span className="text-accent">logistic</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {locale === "sr" ? "Vaša prodavnica" : "Your store"}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={locale === "sr" ? "Zatvori meni" : "Close menu"}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <ScrollArea className="flex-1 min-h-0 px-4 py-6">
                <nav className="space-y-2">
                  {navLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <motion.div
                        key={link.href}
                        initial={false}
                        animate={
                          mobileMenuOpen
                            ? {
                                opacity: 1,
                                x: 0,
                                transition: {
                                  duration: 0.3,
                                  ease: [0.22, 1, 0.36, 1],
                                  delay: index * 0.05,
                                },
                              }
                            : {
                                opacity: 0,
                                x: -12,
                                transition: { duration: 0.15 },
                              }
                        }
                      >
                        <Link
                          href={link.href}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <motion.div
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/20 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                            }}
                          >
                            <Icon className="h-4 w-4" />
                          </motion.div>
                          <span>{link.label}</span>
                        </Link>
                      </motion.div>
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
          <motion.div
            variants={{
              hidden: { opacity: 0, x: -12 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            <Link href="/" className="flex items-center gap-2 group">
              <motion.span
                className="block"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Image
                  src="/brand/logo.png"
                  alt="360 Logistic"
                  width={200}
                  height={50}
                  className="h-7 md:h-8 w-auto transition-opacity group-hover:opacity-90"
                  priority
                />
              </motion.span>
            </Link>
          </motion.div>

          <motion.form
            onSubmit={handleSearch}
            className="hidden sm:flex flex-1 max-w-2xl"
            variants={{
              hidden: { opacity: 0, y: 6 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("search")}
                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.form>

          {/* Actions */}
          <motion.div
            className="flex items-center gap-1 md:gap-2 ml-auto"
            variants={{
              hidden: { opacity: 0, x: 12 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
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
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <CartDrawer />
            </motion.div>
          </motion.div>
        </div>

        <motion.form
          onSubmit={handleSearch}
          className="sm:hidden mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
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
        </motion.form>
      </motion.div>

      <motion.div
        className="border-t border-border/50 hidden md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.35 }}
      >
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-6 py-3 text-sm">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.35 + i * 0.04,
                }}
              >
                <Link
                  href={link.href}
                  className="relative py-1.5 font-medium text-foreground/90 hover:text-primary transition-colors duration-200 group block"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 h-0.5 bg-primary rounded-full w-0 group-hover:w-full transition-all duration-200 origin-left" />
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>
      </motion.div>
    </motion.header>
  );
}
