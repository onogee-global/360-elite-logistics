"use client";

import { useLocale } from "@/lib/locale-context";
import { Card } from "@/components/ui/card";
import { Package, Truck, Users, Award, Target, Heart } from "lucide-react";
import Counter from "@/components/counter";

export default function AboutPage() {
  const { t } = useLocale();

  const values = [
    {
      icon: <Target className="h-8 w-8" />,
      titleKey: "about.value1.title",
      descKey: "about.value1.desc",
    },
    {
      icon: <Heart className="h-8 w-8" />,
      titleKey: "about.value2.title",
      descKey: "about.value2.desc",
    },
    {
      icon: <Award className="h-8 w-8" />,
      titleKey: "about.value3.title",
      descKey: "about.value3.desc",
    },
  ];

  const stats = [
    // { icon: <Package className="h-10 w-10" />, value: 10000, suffix: "+", labelKey: "about.stat1" },
    // { icon: <Users className="h-10 w-10" />, value: 5000, suffix: "+", labelKey: "about.stat2" },
    {
      icon: <Truck className="h-10 w-10" />,
      value: 20,
      suffix: "+",
      labelKey: "about.stat3",
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
              {t("about.title")}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {t("about.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center gap-20">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="p-8 text-center hover:shadow-lg transition-shadow w-full max-w-sm"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              {stat.icon}
            </div>
            <div className="text-4xl font-bold mb-2">
              <Counter
                to={stat.value as number}
                durationMs={1400}
                suffix={stat.suffix as string}
              />
            </div>
            <div className="text-muted-foreground">{t(stat.labelKey)}</div>
          </Card>
        ))}

        {/* Story Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            {t("about.storyTitle")}
          </h2>
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
            <p className="leading-relaxed">{t("about.story1")}</p>
            <p className="leading-relaxed">{t("about.story2")}</p>
            <p className="leading-relaxed">{t("about.story3")}</p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            {t("about.valuesTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="p-8 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{t(value.titleKey)}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t(value.descKey)}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
