"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useToast } from "@/hooks/use-toast";
import { LogIn, Mail, Lock } from "lucide-react";
import { getCurrentUser, signInWithEmailPassword } from "../../lib/auth";
import { useLocale } from "@/lib/locale-context";
import { getUserProfile, upsertUserProfile, supabase } from "@/lib/supabase";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t, locale } = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // If already logged in, go to intended destination (redirect) or account
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await getCurrentUser();
      if (!cancelled && user) {
        const redirect = searchParams.get("redirect");
        const safeRedirect =
          redirect && redirect.startsWith("/") ? redirect : "/account";
        router.replace(safeRedirect);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailPassword(formData.email, formData.password);

      // After sign-in, finalize pending profile if present
      try {
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        if (user) {
          const raw = localStorage.getItem("pendingProfile");
          if (raw) {
            const pending = JSON.parse(raw) as { email?: string; companyName?: string; pib?: string };
            if (pending?.companyName || pending?.pib) {
              await upsertUserProfile({
                userId: user.id,
                companyName: pending.companyName ?? "",
                pib: pending.pib ?? "",
                address: "",
                city: "",
                phone: "",
                contactName: "",
              });
            }
            localStorage.removeItem("pendingProfile");
          }
        }
      } catch {}

      toast({
        title: locale === "en" ? "Login successful" : "Uspešna prijava",
        description: locale === "en" ? "Welcome back!" : "Dobrodošli nazad!",
      });

      const redirect = searchParams.get("redirect");
      router.push(redirect || "/account");
    } catch (err: any) {
      toast({
        title: locale === "en" ? "Login failed" : "Prijava neuspešna",
        description:
          err?.message ||
          (locale === "en" ? "Check your details and try again" : "Proverite podatke i pokušajte ponovo"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/brand/logo.png"
              alt="360 Logistics"
              width={160}
              height={160}
              className="h-16 w-auto sm:h-20"
              priority
            />
          </div>
          <CardTitle className="text-2xl">{t("loginTitle")}</CardTitle>
          <CardDescription>
            {locale === "en" ? "Sign in to your account" : "Prijavite se na vaš nalog"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("contact.emailLabel")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("password")}</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {locale === "en" ? "Forgot password?" : "Zaboravili ste lozinku?"}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              <LogIn className="mr-2 h-4 w-4" />
              {isLoading ? (locale === "en" ? "Signing in..." : "Prijava u toku...") : t("login")}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              {locale === "en" ? "OR" : "ILI"}
            </span>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">{locale === "en" ? "Don't have an account? " : "Nemate nalog? "}</span>
            <Link
              href="/register"
              className="text-primary font-medium hover:underline"
            >
              {t("registerTitle")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
