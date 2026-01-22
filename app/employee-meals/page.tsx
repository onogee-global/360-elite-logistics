"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useLocale } from "@/lib/locale-context";

export default function EmployeeMealsPage() {
  const { locale } = useLocale();

  type DayKey = "mon" | "tue" | "wed" | "thu" | "fri";
  type MenuDay = {
    titleSr: string;
    titleEn: string;
    lunch: string;
    snack: string;
  };

  const daysOrder: DayKey[] = ["mon", "tue", "wed", "thu", "fri"];
  const dayNames: Record<DayKey, { sr: string; en: string }> = {
    mon: { sr: "Ponedeljak", en: "Monday" },
    tue: { sr: "Utorak", en: "Tuesday" },
    wed: { sr: "Sreda", en: "Wednesday" },
    thu: { sr: "Četvrtak", en: "Thursday" },
    fri: { sr: "Petak", en: "Friday" },
  };

  // Example weekly menus (placeholder copy aligned with screenshots)
  const standardMenu: Record<DayKey, MenuDay> = {
    mon: {
      titleSr: "Ponedeljak",
      titleEn: "Monday",
      lunch: locale === "en" ? "Asian vegetables with mushrooms" : "Azijsko povrće sa bukovačom",
      snack: locale === "en" ? "Protein bars with peanut butter" : "Proteinske štanglice sa kikiriki puterom",
    },
    tue: {
      titleSr: "Utorak",
      titleEn: "Tuesday",
      lunch: locale === "en" ? "Turkey caprese burgers" : "Ćureći kapreze burgeri",
      snack: locale === "en" ? "Raw vegan cake with fruit gel" : "Vegan sirovi kolač sa voćnim gelom",
    },
    wed: {
      titleSr: "Sreda",
      titleEn: "Wednesday",
      lunch: locale === "en" ? "Sea bass fillets from pizza oven" : "Fileti brancina iz pica peći",
      snack: locale === "en" ? "Cheesecake with forest fruit" : "Čizkejk sa šumskim voćem",
    },
    thu: {
      titleSr: "Četvrtak",
      titleEn: "Thursday",
      lunch: locale === "en" ? "Chicken in ratatouille sauce" : "Piletina u ratatui sosu",
      snack: locale === "en" ? "Fruit salad" : "Voćna salata",
    },
    fri: {
      titleSr: "Petak",
      titleEn: "Friday",
      lunch: locale === "en" ? "Beef sticks with pepper and cheese" : "Juneći štapići sa paprikom i sirom",
      snack: locale === "en" ? "Coconut bars with hazelnut" : "Kokos štangle sa lešnikom",
    },
  };

  const veganMenu: Record<DayKey, MenuDay> = {
    mon: {
      titleSr: "Ponedeljak",
      titleEn: "Monday",
      lunch: locale === "en" ? "Asian vegetables" : "Azijsko povrće",
      snack: locale === "en" ? "Protein bars with peanut butter" : "Proteinske štanglice sa kikiriki puterom",
    },
    tue: {
      titleSr: "Utorak",
      titleEn: "Tuesday",
      lunch: locale === "en" ? "Veg caprese burgers" : "Vege kapreze burgeri",
      snack: locale === "en" ? "Raw vegan cake with fruit gel" : "Vegan sirovi kolač sa voćnim gelom",
    },
    wed: {
      titleSr: "Sreda",
      titleEn: "Wednesday",
      lunch: locale === "en" ? "Sea bass fillets" : "Fileti brancina",
      snack: locale === "en" ? "Cheesecake with forest fruit" : "Čizkejk sa šumskim voćem",
    },
    thu: {
      titleSr: "Četvrtak",
      titleEn: "Thursday",
      lunch: locale === "en" ? "Ratatouille vegetables" : "Ratatui povrće",
      snack: locale === "en" ? "Fruit salad" : "Voćna salata",
    },
    fri: {
      titleSr: "Petak",
      titleEn: "Friday",
      lunch: locale === "en" ? "Veg fritters with pepper and cheese" : "Vege uštipci sa paprikom i sirom",
      snack: locale === "en" ? "Coconut bars with hazelnut" : "Kokos štangle sa lešnikom",
    },
  };

  function Section({
    titleBadge,
    titleLine,
    menu,
  }: {
    titleBadge: string;
    titleLine: string;
    menu: Record<DayKey, MenuDay>;
  }) {
    return (
      <section className="relative py-16">
        <div className="text-center mb-8">
          <div className="inline-block rounded-full px-6 py-2 bg-foreground text-background text-sm font-semibold shadow-sm">
            {titleBadge}
          </div>
          <h2 className="mt-6 text-3xl md:text-4xl font-bold tracking-wide">
            {titleLine}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {locale === "en" ? "Minimum order size 6 meals" : "Minimalan broj obroka 6"}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {daysOrder.map((dk) => {
            const item = menu[dk];
            const dayLabel = locale === "en" ? item.titleEn : item.titleSr;
            return (
              <div key={dk} className="rounded-2xl p-[1px] bg-gradient-to-br from-primary/25 to-accent/25">
                <Card className="rounded-2xl border bg-card h-full">
                  <CardContent className="p-5">
                    <h3 className="text-lg md:text-xl font-bold mb-3">{dayLabel}</h3>
                    <div className="space-y-4 text-sm leading-relaxed">
                      <div>
                        <p className="font-semibold underline underline-offset-4">
                          {locale === "en" ? "LUNCH" : "RUČAK"}
                        </p>
                        <p className="text-muted-foreground">{item.lunch}</p>
                      </div>
                      <div>
                        <p className="font-semibold underline underline-offset-4">
                          {locale === "en" ? "SNACK" : "UŽINA"}
                        </p>
                        <p className="text-muted-foreground">{item.snack}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            {locale === "en" ? "Employee Meals" : "Obroci za zaposlene"}
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            {locale === "en"
              ? "Flexible, reliable daily meal supply for your team. We tailor options to your company’s needs."
              : "Fleksibilna i pouzdana isporuka obroka za vaš tim. Prilagođavamo ponudu potrebama vaše kompanije."}
          </p>
        </div>

        <Section
          titleBadge={locale === "en" ? "WEEKLY MENU EXAMPLE" : "PRIMER NEDELJNOG JELOVNIKA"}
          titleLine={locale === "en" ? "- STANDARD MENU -" : "- STANDARD MENI -"}
          menu={standardMenu}
        />

        <Section
          titleBadge={locale === "en" ? "WEEKLY MENU EXAMPLE" : "PRIMER NEDELJNOG JELOVNIKA"}
          titleLine={locale === "en" ? "- VEGAN MENU -" : "- VEGAN MENI -"}
          menu={veganMenu}
        />

        <div className="max-w-5xl mx-auto mt-16 grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">
                {locale === "en" ? "Benefits" : "Prednosti"}
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                <li>{locale === "en" ? "Simple monthly invoicing" : "Jednostavno mesečno fakturisanje"}</li>
                <li>{locale === "en" ? "Reliable delivery" : "Pouzdana dostava"}</li>
                <li>{locale === "en" ? "Custom menus" : "Prilagođeni jelovnici"}</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">
                {locale === "en" ? "How it works" : "Kako funkcioniše"}
              </h3>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal pl-4">
                <li>{locale === "en" ? "Contact us" : "Kontaktirajte nas"}</li>
                <li>{locale === "en" ? "We prepare a plan" : "Pripremamo plan"}</li>
                <li>{locale === "en" ? "We deliver daily" : "Isporuka svakog dana"}</li>
              </ol>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">
                {locale === "en" ? "Contact" : "Kontakt"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {locale === "en"
                  ? "Write to 360elitelogistic@gmail.com or use the contact page."
                  : "Pišite na 360elitelogistic@gmail.com ili koristite stranicu za kontakt."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

