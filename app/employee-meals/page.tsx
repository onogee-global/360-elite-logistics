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
        className="relative py-16"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px", amount: 0.2 }}
        variants={staggerSlow}
      >
        <motion.div className="text-center mb-10" variants={stagger}>
          <motion.div
            className="inline-block rounded-full px-6 py-2.5 bg-white/15 text-white text-sm font-semibold shadow-lg ring-1 ring-white/25"
            variants={fadeUp}
          >
            {titleBadge}
          </motion.div>
          <motion.h2
            className="mt-6 text-3xl md:text-4xl font-bold tracking-wide text-white drop-shadow-sm"
            variants={fadeUp}
          >
            {titleLine}
          </motion.h2>
          <motion.p className="mt-2 text-sm text-white/80" variants={fadeUp}>
            {locale === "en"
              ? "Minimum order size 6 meals"
              : "Minimalan broj obroka 6"}
          </motion.p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5"
          variants={staggerCards}
        >
          {daysOrder.map((dk) => {
            const item = menu[dk];
            const dayLabel = locale === "en" ? item.titleEn : item.titleSr;
            return (
              <motion.div
                key={dk}
                className="rounded-2xl p-[1px] bg-gradient-to-br from-white/20 via-white/10 to-white/5"
                variants={scaleIn}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 260, damping: 20 },
                }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
              >
                <Card className="rounded-2xl h-full border-white/20 bg-white/5 backdrop-blur-md shadow-xl shadow-black/10">
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-700 via-teal-700 to-cyan-800 text-white overflow-x-hidden">
      {/* Intro with white text and images */}
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
            className="max-w-5xl mx-auto text-center text-white"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.h1
              className="text-4xl md:text-6xl font-bold tracking-tight"
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
            <motion.p
              className="mt-5 text-base md:text-lg/7 text-white/92 max-w-2xl mx-auto"
              variants={fadeUp}
            >
              {locale === "en"
                ? "Flexible, reliable daily meal supply for your team. We tailor options to your company’s needs."
                : "Fleksibilna i pouzdana isporuka obroka za vaš tim. Prilagođavamo ponudu potrebama vaše kompanije."}
            </motion.p>
            <motion.p
              className="mt-4 text-sm md:text-base/7 text-white/88 max-w-3xl mx-auto leading-relaxed"
              variants={fadeUp}
            >
              {locale === "en"
                ? "We provide employees with fresh, tasty, and nutritionally balanced meals adapted to everyday work demands. Our meals are prepared with quality ingredients, paying attention to variety and proper nutrition. Regular and reliable delivery enables companies to provide their teams with a quality meal and more energy throughout the workday."
                : "Zaposlenima obezbeđujemo sveže, ukusne i nutritivno izbalansirane obroke prilagođene svakodnevnim radnim obavezama. Naši obroci se pripremaju od kvalitetnih namirnica, uz pažnju na raznovrsnost i pravilnu ishranu. Redovna i pouzdana isporuka omogućava firmama da svojim timovima obezbede kvalitetan obrok i veću energiju tokom radnog dana."}
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
              ].map((img) => (
                <motion.div
                  key={img.src}
                  className="group relative aspect-square w-full overflow-hidden rounded-[28px] ring-2 ring-white/20 bg-white/5 backdrop-blur-sm shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)]"
                  variants={scaleIn}
                  whileHover={{
                    scale: 1.03,
                    y: -8,
                    transition: { type: "spring", stiffness: 260, damping: 22 },
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 20 }}
                >
                  <Image
                    src={img.src}
                    alt={locale === "en" ? img.altEn : img.altSr}
                    fill
                    className="object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(min-width:1280px) 30vw, (min-width:768px) 45vw, 100vw"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-500" />
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)",
                      backgroundSize: "200% 100%",
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
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
          className="max-w-5xl mx-auto mt-20 grid md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px", amount: 0.2 }}
          variants={staggerCards}
        >
          {[
            {
              title: locale === "en" ? "Benefits" : "Prednosti",
              content: (
                <ul className="text-sm text-white/85 space-y-1 list-disc pl-4">
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
                <ol className="text-sm text-white/85 space-y-1 list-decimal pl-4">
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
                <p className="text-sm text-white/85">
                  {locale === "en"
                    ? "Write to 360elitelogistic@gmail.com or use the contact page."
                    : "Pišite na 360elitelogistic@gmail.com ili koristite stranicu za kontakt."}
                </p>
              ),
            },
          ].map((block) => (
            <motion.div
              key={block.title}
              variants={scaleIn}
              whileHover={{
                y: -4,
                transition: { type: "spring", stiffness: 260, damping: 22 },
              }}
            >
              <Card className="border-white/20 bg-white/5 backdrop-blur-md shadow-xl shadow-black/10 h-full transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/15">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 text-white">
                    {block.title}
                  </h3>
                  {block.content}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
