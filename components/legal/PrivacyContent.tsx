"use client";

import { useLocale } from "@/lib/locale-context";

export default function PrivacyContent() {
  const { locale } = useLocale();
  const en = locale === "en";
  return (
    <div className="prose prose-neutral dark:prose-invert">
      <h1>{en ? "Privacy Policy" : "Politika privatnosti"}</h1>
      <p>
        {en
          ? "We respect your privacy and are committed to protecting your personal data."
          : "Poštujemo vašu privatnost i posvećeni smo zaštiti vaših ličnih podataka."}
      </p>
      <ul>
        <li>{en ? "We never sell your data." : "Nikada ne prodajemo vaše podatke."}</li>
        <li>{en ? "We use encryption and access controls." : "Koristimo enkripciju i kontrolu pristupa."}</li>
        <li>{en ? "You can request deletion at any time." : "Možete zatražiti brisanje u bilo kom trenutku."}</li>
      </ul>
      <h2>{en ? "Data We Collect" : "Podaci koje prikupljamo"}</h2>
      <p>
        {en
          ? "We collect information necessary to provide our services, such as contact details and order history."
          : "Prikupljamo informacije neophodne za pružanje usluga, kao što su kontakt podaci i istorija porudžbina."}
      </p>
      <h2>{en ? "How We Use Data" : "Kako koristimo podate"}</h2>
      <p>
        {en
          ? "We use your data to process orders, provide support and improve our services. We do not sell your data."
          : "Vaše podatke koristimo za obradu porudžbina, pružanje podrške i unapređenje usluga. Ne prodajemo vaše podatke."}
      </p>
      <h2>{en ? "Your Rights" : "Vaša prava"}</h2>
      <p>
        {en
          ? "You can request access, correction or deletion of your personal data by contacting us."
          : "Možete zatražiti pristup, ispravku ili brisanje ličnih podataka tako što ćete nas kontaktirati."}
      </p>
    </div>
  );
}


