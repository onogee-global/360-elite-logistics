"use client";

import type React from "react";

import { useLocale } from "@/lib/locale-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { t, locale } = useLocale();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to send");
      }
      toast({
        title: locale === "en" ? "Message sent" : "Poruka poslata",
        description:
          locale === "en"
            ? "We'll get back to you soon."
            : "Odgovorićemo vam uskoro.",
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: locale === "en" ? "Send failed" : "Slanje nije uspelo",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6" />,
      titleKey: "contact.phone",
      value: "+381 64 5712247",
    },
    {
      icon: <Mail className="h-6 w-6" />,
      titleKey: "contact.email",
      value: "360elitelogistic@gmail.com",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      titleKey: "contact.address",
      value: t("contact.addressValue"),
    },
    {
      icon: <Clock className="h-6 w-6" />,
      titleKey: "contact.hours",
      value: t("contact.hoursValue"),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
              {t("contact.title")}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {t("contact.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">
              {t("contact.formTitle")}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">{t("contact.name")}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="email">{t("contact.emailLabel")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="phone">{t("contact.phoneLabel")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="message">{t("contact.message")}</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                  rows={5}
                  className="mt-2"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={sending}
              >
                {sending
                  ? locale === "en"
                    ? "Sending..."
                    : "Slanje..."
                  : t("contact.send")}
              </Button>
            </form>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-6">
                {t("contact.infoTitle")}
              </h2>
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <Card
                    key={index}
                    className="p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary flex-shrink-0">
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="font-bold mb-1">{t(info.titleKey)}</h3>
                        <p className="text-muted-foreground">{info.value}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">{t("contact.location")}</h3>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <MapPin className="h-12 w-12 text-muted-foreground" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
