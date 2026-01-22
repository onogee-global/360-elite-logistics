"use client";

import { useLocale } from "@/lib/locale-context";

export default function TermsContent() {
  const { locale } = useLocale();
  const en = locale === "en";
  return (
    <div className="prose prose-neutral dark:prose-invert">
      <h1>{en ? "Terms of Use" : "Uslovi korišćenja"}</h1>
      <p>
        {en
          ? "Welcome to our store. Please read these Terms carefully. By using our services, you agree to these Terms."
          : "Dobrodošli u našu prodavnicu. Molimo vas da pažljivo pročitate ove Uslove. Korišćenjem naših usluga prihvatate ove Uslove."}
      </p>
      <ul>
        <li>{en ? "Transparent pricing and delivery fees." : "Transparentne cene i troškovi dostave."}</li>
        <li>{en ? "Secure checkout and data protection." : "Sigurna kupovina i zaštita podataka."}</li>
        <li>{en ? "Customer-first support and resolutions." : "Podrška kupcima i brzo rešavanje problema."}</li>
      </ul>
      <h2>{en ? "Orders and Delivery" : "Porudžbine i dostava"}</h2>
      <p>
        {en
          ? "All orders are subject to availability. Delivery fees and free-shipping thresholds are shown at checkout."
          : "Sve porudžbine su uslovljene dostupnošću. Troškovi dostave i prag za besplatnu dostavu prikazuju se pri završetku kupovine."}
      </p>
      <h2>{en ? "Returns" : "Povraćaj robe"}</h2>
      <p>
        {en
          ? "If an item arrives damaged or incorrect, please contact us as soon as possible."
          : "Ukoliko artikal stigne oštećen ili pogrešan, kontaktirajte nas što je pre moguće."}
      </p>
      <h2>{en ? "Changes to Terms" : "Izmene uslova"}</h2>
      <p>
        {en
          ? "We may update these Terms periodically. Continued use of the site constitutes acceptance of changes."
          : "Ove Uslove možemo periodično ažurirati. Nastavak korišćenja sajta podrazumeva prihvatanje izmena."}
      </p>
    </div>
  );
}


