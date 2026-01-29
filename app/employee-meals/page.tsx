"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useLocale } from "@/lib/locale-context";
import { motion } from "framer-motion";

const easeOutExpo = [0.22, 1, 0.36, 1] as const;

export default function EmployeeMealsPage() {
  const { locale } = useLocale();
  // Animation presets
  const fadeUp = {
    hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: easeOutExpo },
    },
  };
  const fadeUpSubtle = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: easeOutExpo },
    },
  };
  const scaleIn = {
    hidden: { opacity: 0, scale: 0.92 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: easeOutExpo },
    },
  };
  const stagger = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.1, delayChildren: 0.05 },
    },
  };
  const staggerSlow = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };
  const staggerCards = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  };

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
      lunch:
        locale === "en"
          ? "Asian vegetables with mushrooms"
          : "Azijsko povrće sa bukovačom",
      snack:
        locale === "en"
          ? "Protein bars with peanut butter"
          : "Proteinske štanglice sa kikiriki puterom",
    },
    tue: {
      titleSr: "Utorak",
      titleEn: "Tuesday",
      lunch:
        locale === "en" ? "Turkey caprese burgers" : "Ćureći kapreze burgeri",
      snack:
        locale === "en"
          ? "Raw vegan cake with fruit gel"
          : "Vegan sirovi kolač sa voćnim gelom",
    },
    wed: {
      titleSr: "Sreda",
      titleEn: "Wednesday",
      lunch:
        locale === "en"
          ? "Sea bass fillets from pizza oven"
          : "Fileti brancina iz pica peći",
      snack:
        locale === "en"
          ? "Cheesecake with forest fruit"
          : "Čizkejk sa šumskim voćem",
    },
    thu: {
      titleSr: "Četvrtak",
      titleEn: "Thursday",
      lunch:
        locale === "en"
          ? "Chicken in ratatouille sauce"
          : "Piletina u ratatui sosu",
      snack: locale === "en" ? "Fruit salad" : "Voćna salata",
    },
    fri: {
      titleSr: "Petak",
      titleEn: "Friday",
      lunch:
        locale === "en"
          ? "Beef sticks with pepper and cheese"
          : "Juneći štapići sa paprikom i sirom",
      snack:
        locale === "en"
          ? "Coconut bars with hazelnut"
          : "Kokos štangle sa lešnikom",
    },
  };

  const veganMenu: Record<DayKey, MenuDay> = {
    mon: {
      titleSr: "Ponedeljak",
      titleEn: "Monday",
      lunch: locale === "en" ? "Asian vegetables" : "Azijsko povrće",
      snack:
        locale === "en"
          ? "Protein bars with peanut butter"
          : "Proteinske štanglice sa kikiriki puterom",
    },
    tue: {
      titleSr: "Utorak",
      titleEn: "Tuesday",
      lunch: locale === "en" ? "Veg caprese burgers" : "Vege kapreze burgeri",
      snack:
        locale === "en"
          ? "Raw vegan cake with fruit gel"
          : "Vegan sirovi kolač sa voćnim gelom",
    },
    wed: {
      titleSr: "Sreda",
      titleEn: "Wednesday",
      lunch: locale === "en" ? "Sea bass fillets" : "Fileti brancina",
      snack:
        locale === "en"
          ? "Cheesecake with forest fruit"
          : "Čizkejk sa šumskim voćem",
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
      lunch:
        locale === "en"
          ? "Veg fritters with pepper and cheese"
          : "Vege uštipci sa paprikom i sirom",
      snack:
        locale === "en"
          ? "Coconut bars with hazelnut"
          : "Kokos štangle sa lešnikom",
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
      <motion.section
        className="relative py-14 md:py-20"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px", amount: 0.15 }}
        variants={staggerSlow}
      >
        <motion.div className="text-center mb-12" variants={stagger}>
          <motion.span
            variants={fadeUp}
            className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-white/60 mb-4"
          >
            {titleBadge}
          </motion.span>
          <motion.h2
            className="text-2xl md:text-3xl font-bold tracking-tight text-white"
            variants={fadeUp}
          >
            {titleLine}
          </motion.h2>
          <motion.p
            className="mt-2 text-sm text-white/70 font-light"
            variants={fadeUp}
          >
            {locale === "en" ? "Minimum 6 meals" : "Minimalno 6 obroka"}
          </motion.p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5"
          variants={staggerCards}
        >
          {daysOrder.map((dk) => {
            const item = menu[dk];
            const dayLabel = locale === "en" ? item.titleEn : item.titleSr;
            return (
              <motion.div
                key={dk}
                className="rounded-2xl overflow-hidden bg-white/[0.07] backdrop-blur-xl border border-white/10 shadow-xl shadow-black/10"
                variants={scaleIn}
                whileHover={{
                  y: -4,
                  scale: 1.01,
                  transition: { type: "spring", stiffness: 320, damping: 24 },
                }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
              >
                <Card className="rounded-2xl h-full border-0 bg-transparent shadow-none p-0 gap-0">
                  <CardContent className="p-5">
                    <h3 className="text-lg md:text-xl font-bold mb-3 text-white">
                      {dayLabel}
                    </h3>
                    <div className="space-y-4 text-sm leading-relaxed">
                      <div>
                        <p className="font-semibold tracking-wide text-white/90">
                          {locale === "en" ? "LUNCH" : "RUČAK"}
                        </p>
                        <p className="text-white/85">{item.lunch}</p>
                      </div>
                      <div>
                        <p className="font-semibold tracking-wide text-white/90">
                          {locale === "en" ? "SNACK" : "UŽINA"}
                        </p>
                        <p className="text-white/85">{item.snack}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>
    );
  }

  return (
    <motion.div
      className="min-h-screen text-white overflow-x-hidden antialiased"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
      }}
      style={{
        background:
          "linear-gradient(165deg, #0d9488 0%, #0f766e 28%, #115e59 50%, #134e4a 72%, #0f766e 100%)",
      }}
    >
      <div className="relative overflow-hidden">
        {/* Animated background orbs */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.45), rgba(255,255,255,0.12))",
          }}
          animate={{
            x: [0, 24, 0],
            y: [0, -16, 0],
            opacity: [0.28, 0.38, 0.28],
            scale: [1, 1.08, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full blur-3xl opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)",
          }}
          animate={{
            opacity: [0.15, 0.25, 0.15],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))",
          }}
          animate={{
            x: [0, -20, 0],
            y: [0, 14, 0],
            opacity: [0.24, 0.34, 0.24],
            scale: [1, 1.06, 1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4,
          }}
        />
        <div className="container mx-auto px-4 py-14 md:py-20 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.span
              variants={fadeUp}
              className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-white/60 mb-5"
            >
              B2B
            </motion.span>
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]"
              variants={fadeUp}
              style={{
                background:
                  "linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.88) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {locale === "en" ? "Employee Meals" : "Obroci za zaposlene"}
            </motion.h1>
            <motion.div
              variants={fadeUp}
              className="mt-5 h-px w-14 mx-auto rounded-full bg-white/35"
            />
            <motion.p
              className="mt-5 text-base md:text-lg text-white/90 max-w-xl mx-auto font-light"
              variants={fadeUp}
            >
              {locale === "en"
                ? "Flexible, reliable daily meal supply for your team. We tailor options to your company’s needs."
                : "Fleksibilna i pouzdana isporuka obroka za vaš tim."}
            </motion.p>
            <motion.p
              className="mt-3 text-sm md:text-base text-white/75 max-w-2xl mx-auto leading-relaxed font-light"
              variants={fadeUp}
            >
              {locale === "en"
                ? "Fresh, tasty, nutritionally balanced meals. Quality ingredients, variety, reliable delivery."
                : "Sveži, ukusni i izbalansirani obroci. Kvalitetne namirnice i pouzdana isporuka."}
            </motion.p>
            <motion.div
              className="mt-14 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto"
              variants={staggerSlow}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px", amount: 0.15 }}
            >
              {[
                {
                  src: "/employee-meals/food_crop_1.jpg",
                  altSr: "Piletina u kikiriki sosu",
                  altEn: "Chicken in peanut sauce",
                },
                {
                  src: "/employee-meals/food_crop_2.jpg",
                  altSr: "Airiš gulaš",
                  altEn: "Irish stew",
                },
                {
                  src: "/employee-meals/food_crop_3.jpg",
                  altSr: "Suvidirane pileće grudi sa dva pirea",
                  altEn: "Sous‑vide chicken with two purees",
                },
              ].map((img, i) => (
                <motion.div
                  key={img.src}
                  className="group relative aspect-square w-full overflow-hidden rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/20"
                  variants={scaleIn}
                  whileHover={{
                    scale: 1.02,
                    y: -6,
                    transition: { type: "spring", stiffness: 300, damping: 25 },
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  style={{
                    boxShadow:
                      "0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05)",
                  }}
                >
                  <Image
                    src={img.src}
                    alt={locale === "en" ? img.altEn : img.altSr}
                    fill
                    className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                    sizes="(min-width:1280px) 30vw, (min-width:768px) 45vw, 100vw"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Sections: smooth scroll-in, no hard edges */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <Section
          titleBadge={
            locale === "en"
              ? "WEEKLY MENU EXAMPLE"
              : "PRIMER NEDELJNOG JELOVNIKA"
          }
          titleLine={
            locale === "en" ? "- STANDARD MENU -" : "- STANDARD MENI -"
          }
          menu={standardMenu}
        />

        <Section
          titleBadge={
            locale === "en"
              ? "WEEKLY MENU EXAMPLE"
              : "PRIMER NEDELJNOG JELOVNIKA"
          }
          titleLine={locale === "en" ? "- VEGAN MENU -" : "- VEGAN MENI -"}
          menu={veganMenu}
        />

        <motion.div
          className="max-w-5xl mx-auto mt-24 grid md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px", amount: 0.2 }}
          variants={staggerCards}
        >
          {[
            {
              title: locale === "en" ? "Benefits" : "Prednosti",
              content: (
                <ul className="text-sm text-white/80 space-y-2 list-disc pl-4 font-light">
                  <li>
                    {locale === "en"
                      ? "Simple monthly invoicing"
                      : "Jednostavno mesečno fakturisanje"}
                  </li>
                  <li>
                    {locale === "en" ? "Reliable delivery" : "Pouzdana dostava"}
                  </li>
                  <li>
                    {locale === "en" ? "Custom menus" : "Prilagođeni jelovnici"}
                  </li>
                </ul>
              ),
            },
            {
              title: locale === "en" ? "How it works" : "Kako funkcioniše",
              content: (
                <ol className="text-sm text-white/80 space-y-2 list-decimal pl-4 font-light">
                  <li>
                    {locale === "en" ? "Contact us" : "Kontaktirajte nas"}
                  </li>
                  <li>
                    {locale === "en" ? "We prepare a plan" : "Pripremamo plan"}
                  </li>
                  <li>
                    {locale === "en"
                      ? "We deliver daily"
                      : "Isporuka svakog dana"}
                  </li>
                </ol>
              ),
            },
            {
              title: locale === "en" ? "Contact" : "Kontakt",
              content: (
                <p className="text-sm text-white/80 font-light leading-relaxed">
                  {locale === "en"
                    ? "360elitelogistic@gmail.com or contact page."
                    : "360elitelogistic@gmail.com ili stranica za kontakt."}
                </p>
              ),
            },
          ].map((block) => (
            <motion.div
              key={block.title}
              className="rounded-2xl overflow-hidden bg-white/[0.07] backdrop-blur-xl border border-white/10 shadow-xl shadow-black/10 h-full"
              variants={scaleIn}
              whileHover={{
                y: -4,
                scale: 1.01,
                transition: { type: "spring", stiffness: 320, damping: 24 },
              }}
            >
              <Card className="border-0 bg-transparent shadow-none h-full p-0 gap-0">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3 text-white tracking-tight">
                    {block.title}
                  </h3>
                  {block.content}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
