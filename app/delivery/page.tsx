"use client";

import { useLocale } from "@/lib/locale-context";
import { Card } from "@/components/ui/card";
import { Clock, MapPin, Package, Truck, CheckCircle2 } from "lucide-react";
import Reveal from "@/components/reveal";

export default function DeliveryPage() {
  const { t } = useLocale();

  const deliverySteps = [
    {
      icon: <Package className="h-8 w-8" />,
      titleKey: "delivery.step1.title",
      descKey: "delivery.step1.desc",
    },
    {
      icon: <CheckCircle2 className="h-8 w-8" />,
      titleKey: "delivery.step2.title",
      descKey: "delivery.step2.desc",
    },
    {
      icon: <Truck className="h-8 w-8" />,
      titleKey: "delivery.step3.title",
      descKey: "delivery.step3.desc",
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      titleKey: "delivery.step4.title",
      descKey: "delivery.step4.desc",
    },
  ];

  const deliveryZones = [
    {
      zone: t("delivery.zone1.name"),
      time: t("delivery.zone1.time"),
      fee: t("delivery.zone1.fee"),
    },
    {
      zone: t("delivery.zone2.name"),
      time: t("delivery.zone2.time"),
      fee: t("delivery.zone2.fee"),
    },
    {
      zone: t("delivery.zone3.name"),
      time: t("delivery.zone3.time"),
      fee: t("delivery.zone3.fee"),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        {/* Safe overlay to avoid build issues */}
        <div className="absolute inset-0 pointer-events-none -z-10" />
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
              <Truck className="h-10 w-10" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
              {t("delivery.title")}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {t("delivery.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Delivery Process */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            {t("delivery.processTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {deliverySteps.map((step, index) => (
              <Reveal key={index} delay={index * 0.08} y={18}>
                <Card className="p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                    {step.icon}
                  </div>
                  <div className="text-sm font-bold text-primary mb-2">
                    {t("delivery.step")} {index + 1}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{t(step.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t(step.descKey)}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Delivery Zones */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            {t("delivery.zonesTitle")}
          </h2>
          <div className="space-y-4">
            {deliveryZones.map((zone, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{zone.zone}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4" />
                        {zone.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {zone.fee}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <Card className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-primary/5 to-accent/5">
          <h3 className="text-2xl font-bold mb-4">{t("delivery.infoTitle")}</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>{t("delivery.info1")}</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>{t("delivery.info2")}</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>{t("delivery.info3")}</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>{t("delivery.info4")}</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
