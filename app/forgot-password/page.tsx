"use client";

// Password reset link in the email goes to /reset-password. Use the same base URL as in Supabase
// URL Configuration (Site URL). Set NEXT_PUBLIC_APP_URL to that URL in production so reset links match.

import { useState } from "react";
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
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { t, locale } = useLocale();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use NEXT_PUBLIC_APP_URL in production so the email link always points to your app's reset page
      const baseUrl =
        typeof window !== "undefined"
          ? process.env.NEXT_PUBLIC_APP_URL || window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || "";
      const redirectTo = `${baseUrl.replace(/\/$/, "")}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) throw error;
      toast({
        title: locale === "en" ? "Email sent" : "Email poslat",
        description:
          locale === "en"
            ? "Check your inbox for the password reset link."
            : "Proverite vaš email za link za reset lozinke.",
      });
      router.push("/login");
    } catch (err: any) {
      toast({
        title: locale === "en" ? "Request failed" : "Zahtev neuspešan",
        description:
          err?.message ||
          (locale === "en" ? "Try again later" : "Pokušajte ponovo kasnije"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {locale === "en" ? "Forgot password" : "Zaboravljena lozinka"}
          </CardTitle>
          <CardDescription>
            {locale === "en"
              ? "Enter your email and we’ll send you a reset link."
              : "Unesite email i poslaćemo vam link za reset lozinke."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                {locale === "en" ? "Email address" : "Email adresa"}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? locale === "en"
                  ? "Sending..."
                  : "Slanje..."
                : locale === "en"
                  ? "Send reset link"
                  : "Pošalji link"}
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
        </CardContent>
      </Card>
    </div>
  );
}
