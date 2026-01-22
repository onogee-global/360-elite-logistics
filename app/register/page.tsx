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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Mail, Lock, User } from "lucide-react";
import { getCurrentUser } from "../../lib/auth";
import { supabase, upsertUserProfile } from "@/lib/supabase";
import { useLocale } from "@/lib/locale-context";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import TermsContent from "@/components/legal/TermsContent";
import PrivacyContent from "@/components/legal/PrivacyContent";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t, locale } = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    pib: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // If already logged in, redirect to account
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await getCurrentUser();
      if (!cancelled && user) {
        router.replace("/account");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: locale === "en" ? "Error" : "Greška",
        description:
          locale === "en" ? "Passwords do not match" : "Lozinke se ne poklapaju",
        variant: "destructive",
      });
      return;
    }

    if (!acceptedTerms) {
      toast({
        title: locale === "en" ? "Error" : "Greška",
        description:
          locale === "en" ? "You must accept the terms" : "Morate prihvatiti uslove korišćenja",
        variant: "destructive",
      });
      return;
    }

    // PIB validation: required, numeric string 8-9 digits
    const rawPib = (formData.pib || "").trim();
    if (!rawPib) {
      toast({
        title: locale === "en" ? "PIB is required" : "PIB je obavezan",
        description:
          locale === "en"
            ? "Please enter your company PIB"
            : "Unesite PIB vaše kompanije",
        variant: "destructive",
      });
      return;
    }
    if (!/^\d{8,9}$/.test(rawPib)) {
      toast({
        title: locale === "en" ? "Invalid PIB" : "Neispravan PIB",
        description:
          locale === "en"
            ? "PIB must be 8-9 digits"
            : "PIB mora imati 8-9 cifara",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Store company name as metadata during signup (contact person captured later)
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { company: formData.name },
          emailRedirectTo: undefined,
        },
      });
      if (error) throw error;
      // Best-effort: if a session exists immediately, upsert user profile with PIB
      try {
        const { data } = await supabase.auth.getUser();
        const u = data.user;
        if (u) {
          await upsertUserProfile({
            userId: u.id,
            companyName: formData.name,
            pib: rawPib,
            address: "",
            city: "",
            phone: "",
            contactName: "",
          });
        } else {
          // Persist pending profile locally to finalize on first login
          try {
            localStorage.setItem(
              "pendingProfile",
              JSON.stringify({
                email: formData.email,
                companyName: formData.name,
                pib: rawPib,
              }),
            );
          } catch {}
        }
      } catch {
        // ignore if session not yet available (email confirmation flows)
      }
      toast({
        title: locale === "en" ? "Registration successful" : "Uspešna registracija",
        description:
          locale === "en" ? "Registration completed." : "Registracija uspešna.",
      });
      const redirect = searchParams.get("redirect");
      router.push(redirect || "/account");
    } catch (err: any) {
      toast({
        title: locale === "en" ? "Registration failed" : "Registracija neuspešna",
        description:
          err?.message || (locale === "en" ? "Try again later" : "Pokušajte ponovo kasnije"),
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
          <CardTitle className="text-2xl">{t("registerTitle")}</CardTitle>
          <CardDescription>
            {locale === "en" ? "Create your account" : "Kreirajte vaš nalog"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("account.company")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={locale === "en" ? "Company name" : "Naziv kompanije"}
                  className="pl-10"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pib">{t("account.pib")}</Label>
              <Input
                id="pib"
                name="pib"
                type="text"
                inputMode="numeric"
                placeholder="12345678"
                value={formData.pib}
                onChange={handleInputChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                {locale === "en" ? "8–9 digits" : "8–9 cifara"}
              </p>
            </div>

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
              <Label htmlFor="password">{t("password")}</Label>
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
                  minLength={8}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {locale === "en" ? "Minimum 8 characters" : "Minimum 8 karaktera"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {locale === "en" ? "Confirm password" : "Potvrdite lozinku"}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) =>
                  setAcceptedTerms(checked as boolean)
                }
              />
              <Label
                htmlFor="terms"
                className="text-sm leading-relaxed cursor-pointer"
              >
                {locale === "en" ? "I accept the " : "Prihvatam "}
                <Dialog>
                  <DialogTrigger asChild>
                    <button type="button" className="text-primary hover:underline">
                      {locale === "en" ? "terms of use" : "uslove korišćenja"}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] sm:max-w-5xl p-0 rounded-2xl border-2 bg-white dark:bg-card shadow-2xl overflow-hidden">
                    <div className="px-6 py-5 bg-gradient-to-r from-primary/10 via-background to-accent/10">
                      <DialogHeader className="p-0">
                        <DialogTitle className="text-xl font-bold">
                          {locale === "en" ? "Terms of Use" : "Uslovi korišćenja"}
                        </DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-muted-foreground mt-1">
                        {locale === "en"
                          ? "Please review our terms below."
                          : "Molimo pročitajte naše uslove u nastavku."}
                      </p>
                    </div>
                    <ScrollArea className="h-[70vh]">
                      <div className="p-6">
                        <TermsContent />
                      </div>
                    </ScrollArea>
                    <div className="px-6 py-4 border-t bg-background/60 text-xs text-muted-foreground">
                      {locale === "en" ? "Last updated: 2026-01-05" : "Poslednje ažuriranje: 05.01.2026"}
                    </div>
                  </DialogContent>
                </Dialog>
                {locale === "en" ? " and " : " i "}
                <Dialog>
                  <DialogTrigger asChild>
                    <button type="button" className="text-primary hover:underline">
                      {locale === "en" ? "privacy policy" : "politiku privatnosti"}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] sm:max-w-5xl p-0 rounded-2xl border-2 bg-white dark:bg-card shadow-2xl overflow-hidden">
                    <div className="px-6 py-5 bg-gradient-to-r from-primary/10 via-background to-accent/10">
                      <DialogHeader className="p-0">
                        <DialogTitle className="text-xl font-bold">
                          {locale === "en" ? "Privacy Policy" : "Politika privatnosti"}
                        </DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-muted-foreground mt-1">
                        {locale === "en"
                          ? "How we collect and protect your data."
                          : "Kako prikupljamo i štitimo vaše podatke."}
                      </p>
                    </div>
                    <ScrollArea className="h-[70vh]">
                      <div className="p-6">
                        <PrivacyContent />
                      </div>
                    </ScrollArea>
                    <div className="px-6 py-4 border-t bg-background/60 text-xs text-muted-foreground">
                      {locale === "en" ? "Last updated: 2026-01-05" : "Poslednje ažuriranje: 05.01.2026"}
                    </div>
                  </DialogContent>
                </Dialog>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {isLoading ? (locale === "en" ? "Signing up..." : "Registracija u toku...") : t("registerTitle")}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              {locale === "en" ? "OR" : "ILI"}
            </span>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {locale === "en" ? "Already have an account? " : "Već imate nalog? "}
            </span>
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              {t("loginTitle")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
