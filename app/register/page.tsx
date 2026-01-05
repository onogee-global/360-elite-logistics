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
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
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
        title: "Greška",
        description: "Lozinke se ne poklapaju",
        variant: "destructive",
      });
      return;
    }

    if (!acceptedTerms) {
      toast({
        title: "Greška",
        description: "Morate prihvatiti uslove korišćenja",
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
      toast({
        title: "Uspešna registracija",
        description: "Registracija uspešna.",
      });
      const redirect = searchParams.get("redirect");
      router.push(redirect || "/account");
    } catch (err: any) {
      toast({
        title: "Registracija neuspešna",
        description: err?.message || "Pokušajte ponovo kasnije",
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
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-2xl">
              M
            </div>
          </div>
          <CardTitle className="text-2xl">Registracija</CardTitle>
          <CardDescription>Kreirajte vaš MAXI nalog</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Kompanija</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Naziv kompanije"
                  className="pl-10"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email adresa</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="vas@email.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Lozinka</Label>
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
                Minimum 8 karaktera
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Potvrdite lozinku</Label>
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
                Prihvatam{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  uslove korišćenja
                </Link>{" "}
                i{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  politiku privatnosti
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {isLoading ? "Registracija u toku..." : "Registruj se"}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              ILI
            </span>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Već imate nalog? </span>
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Prijavite se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
