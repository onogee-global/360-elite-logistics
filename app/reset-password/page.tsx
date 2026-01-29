"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/lib/locale-context";
import { Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { t, locale } = useLocale();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      try {
        // 1) session check (bolje od getUser za recovery)
        const { data } = await supabase.auth.getSession();
        if (!cancelled) setHasSession(!!data.session);

        // 2) listen for auth changes (kad Supabase “pokupi” token iz URL-a)
        const { data: sub } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            if (!cancelled) setHasSession(!!session);
          },
        );

        // If URL has hash (recovery link), re-check session after Supabase processes it
        if (
          typeof window !== "undefined" &&
          window.location.hash &&
          !data.session
        ) {
          const t = setTimeout(async () => {
            const { data: retry } = await supabase.auth.getSession();
            if (!cancelled) setHasSession(!!retry.session);
          }, 600);
          return () => {
            clearTimeout(t);
            sub.subscription.unsubscribe();
          };
        }

        return () => sub.subscription.unsubscribe();
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    let cleanup: (() => void) | undefined;
    sync().then((c) => (cleanup = c));

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8 || password !== confirm) {
      toast({
        title: locale === "en" ? "Invalid password" : "Neispravna lozinka",
        description:
          locale === "en"
            ? "Passwords must match and be at least 8 characters."
            : "Lozinke moraju biti iste i imati najmanje 8 karaktera.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({
        title: locale === "en" ? "Password updated" : "Lozinka ažurirana",
        description:
          locale === "en"
            ? "You can now log in."
            : "Sada možete da se prijavite.",
      });
      router.push("/login");
    } catch (err: any) {
      toast({
        title: locale === "en" ? "Update failed" : "Ažuriranje neuspešno",
        description:
          err?.message ||
          (locale === "en" ? "Try again later" : "Pokušajte ponovo kasnije"),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) return null;

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {locale === "en" ? "Reset password" : "Reset lozinke"}
          </CardTitle>
          <CardDescription>
            {hasSession
              ? locale === "en"
                ? "Enter your new password below."
                : "Unesite novu lozinku."
              : locale === "en"
                ? "Open this page from the recovery email link to reset your password."
                : "Otvorite ovu stranicu iz linka za oporavak iz emaila da biste resetovali lozinku."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasSession ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  {locale === "en" ? "New password" : "Nova lozinka"}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">
                  {locale === "en" ? "Confirm password" : "Potvrdite lozinku"}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm"
                    type="password"
                    className="pl-10"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
              </div>
              <Button disabled={submitting} className="w-full" type="submit">
                {submitting
                  ? locale === "en"
                    ? "Saving..."
                    : "Čuvanje..."
                  : locale === "en"
                    ? "Save password"
                    : "Sačuvaj lozinku"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={() => router.push("/login")}
              >
                {locale === "en" ? "Back to login" : "Nazad na prijavu"}
              </Button>
            </form>
          ) : (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => router.push("/forgot-password")}
              >
                {locale === "en"
                  ? "Request new reset link"
                  : "Zatraži novi link"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
