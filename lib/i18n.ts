import type { Locale } from "./locale" // Assuming Locale is defined in another file

export const locales: Locale[] = [
  { code: "sr", name: "Srpski" },
  { code: "en", name: "English" },
]

export const defaultLocale: Locale["code"] = "sr"

export const translations = {
  sr: {
    // Navigation
    home: "Početna",
    shop: "Prodavnica",
    about: "O nama",
    delivery: "Dostava",
    contact: "Kontakt",
    cart: "Korpa",
    login: "Prijava",
    register: "Registracija",
    logout: "Odjava",
    account: "Nalog",
    admin: "Admin",

    // Hero section translations
    "hero.badge": "Brza dostava širom Srbije",
    "hero.title": "Kupujte namirnice online",
    "hero.subtitle": "Sveže, kvalitetno i uvek na vreme. Uživajte u brzoj dostavi direktno na vašu adresu.",
    "hero.cta": "Počni kupovinu",
    "hero.ctaSecondary": "Pogledaj akcije",

    // Category section translations
    "categories.title": "Kategorije proizvoda",
    "categories.subtitle": "Pronađite sve što vam je potrebno",
    "categories.subcategories": "potkategorija",

    // Featured section translations
    "featured.title": "Akcijska ponuda",
    "featured.subtitle": "Najbolje cene samo za vas",
    "featured.viewAll": "Vidi sve",

    // Common
    search: "Pretraži proizvode...",
    addToCart: "Dodaj u korpu",
    viewDetails: "Pogledaj detalje",
    price: "Cena",
    total: "Ukupno",
    subtotal: "Međuzbir",
    quantity: "Količina",
    remove: "Ukloni",
    checkout: "Naruči",
    placeOrder: "Potvrdi narudžbinu",

    searchResults: "Rezultati pretrage",
    searchFor: "Pretraga za",
    found: "Pronađeno",
    product: "proizvod",
    products: "proizvoda",
    noResults: "Nema rezultata za vašu pretragu",
    tryDifferentKeywords: "Pokušajte sa drugim ključnim rečima",

    allProducts: "Svi proizvodi",
    filters: "Filteri",
    discounts: "Akcije",
    onlyDiscounted: "Samo proizvodi na akciji",
    clearFilters: "Obriši filtere",
    showing: "Prikazano",
    nameAZ: "Naziv (A-Z)",
    noProductsMatch: "Nema proizvoda koji odgovaraju vašim filterima",

    // Cart translations
    "cart.title": "Korpa",
    "cart.items": "Proizvodi u korpi",
    "cart.emptyCart": "Isprazni korpu",
    "cart.continueShopping": "Nastavi kupovinu",
    "cart.viewCart": "Pregledaj korpu",
    "cart.allProducts": "Svi proizvodi",
    "cart.deliveryFee": "Troškovi isporuke",
    "cart.free": "Besplatno",
    "cart.freeShippingNote": "Besplatna dostava za porudžbine preko 3.000 RSD",
    "cart.promoCode": "Dodaj promo kod",
    "cart.promoCodePlaceholder": "Unesi kod",
    "cart.applyPromo": "Dodaj",
    "cart.orderDetails": "Detalji kupovine",
    "cart.selectAddress": "Odaberite adresu",
    "cart.deliveryDetails": "Detalji preuzimanja",
    "cart.delivery": "Isporuka",
    "cart.confirmTime": "Potvrda termina",

    // Cart
    emptyCart: "Vaša korpa je prazna",
    startShopping: "Započni kupovinu",
    cartSummary: "Pregled korpe",

    // Product card translations
    "product.addedToCart": "Dodato u korpu",
    "product.addedMessage": "je dodat u vašu korpu",

    // Checkout
    checkoutTitle: "Završi narudžbinu",
    phoneNumber: "Broj telefona",
    phoneRequired: "Broj telefona je obavezan",
    orderNote: "Napomena (opciono)",
    orderNotePlaceholder: "Dodatne napomene za narudžbinu...",
    loginToOrder: "Morate biti prijavljeni da biste naručili",

    // Product
    inStock: "Na stanju",
    outOfStock: "Nema na stanju",
    discount: "Popust",

    // Filters
    categories: "Kategorije",
    subcategories: "Potkategorije",
    allCategories: "Sve kategorije",
    sortBy: "Sortiraj po",
    priceAsc: "Cena: rastuće",
    priceDesc: "Cena: opadajuće",

    // Auth
    email: "Email",
    password: "Lozinka",
    name: "Ime",
    loginTitle: "Prijavi se",
    registerTitle: "Registruj se",
    alreadyHaveAccount: "Već imate nalog?",
    dontHaveAccount: "Nemate nalog?",

    // Order
    orderSuccess: "Narudžbina uspešno poslata!",
    orderSuccessMessage: "Vaša narudžbina je primljena. Kontaktiraćemo vas uskoro.",
    orderNumber: "Broj narudžbine",

    // Footer
    aboutUs: "O nama",
    deliveryInfo: "Informacije o dostavi",
    contactUs: "Kontaktirajte nas",
    allRightsReserved: "Sva prava zadržana",

    // About page
    "about.title": "O nama",
    "about.subtitle": "360logistics je vaš pouzdan partner za online kupovinu namirnica i brzu dostavu širom Srbije.",
    "about.stat1": "Proizvoda",
    "about.stat2": "Zadovoljnih kupaca",
    "about.stat3": "Dostava dnevno",
    "about.storyTitle": "Naša priča",
    "about.story1":
      "360logistics je osnovan sa vizijom da revolucionira način na koji ljudi kupuju namirnice. Verujemo da kupovina treba da bude jednostavna, brza i pristupačna svima.",
    "about.story2":
      "Naš tim stručnjaka radi svakodnevno kako bi vam pružio najbolje iskustvo online kupovine. Od pažljivo odabranih proizvoda do brze dostave, sve što radimo je fokusirano na vaše zadovoljstvo.",
    "about.story3":
      "Danas smo ponosni što služimo hiljade zadovoljnih kupaca širom Srbije, dostavljajući sveže i kvalitetne proizvode direktno na njihova vrata.",
    "about.valuesTitle": "Naše vrednosti",
    "about.value1.title": "Kvalitet",
    "about.value1.desc":
      "Biramo samo najbolje proizvode od proverenih dobavljača kako bismo garantovali vrhunski kvalitet.",
    "about.value2.title": "Pouzdanost",
    "about.value2.desc": "Dostavljamo na vreme, svaki put. Vaše poverenje je naša najveća vrednost.",
    "about.value3.title": "Zadovoljstvo kupaca",
    "about.value3.desc": "Vaše zadovoljstvo je naš prioritet. Tu smo da vam pomognemo u svakom trenutku.",

    // Delivery page
    "delivery.title": "Dostava",
    "delivery.subtitle": "Brza i pouzdana dostava direktno na vašu adresu. Saznajte više o našem procesu dostave.",
    "delivery.processTitle": "Kako funkcioniše dostava",
    "delivery.step": "Korak",
    "delivery.step1.title": "Naručite online",
    "delivery.step1.desc": "Izaberite proizvode i završite narudžbinu na našem sajtu.",
    "delivery.step2.title": "Potvrdimo narudžbinu",
    "delivery.step2.desc": "Proveravamo dostupnost i kontaktiramo vas za potvrdu.",
    "delivery.step3.title": "Pakujemo pažljivo",
    "delivery.step3.desc": "Naš tim pažljivo pakuje vaše proizvode za transport.",
    "delivery.step4.title": "Dostavljamo na vrata",
    "delivery.step4.desc": "Dostavljamo u dogovoreno vreme direktno na vašu adresu.",
    "delivery.zonesTitle": "Zone dostave",
    "delivery.zone1.name": "Beograd - centar",
    "delivery.zone1.time": "Dostava u roku od 2-4 sata",
    "delivery.zone1.fee": "Besplatno",
    "delivery.zone2.name": "Beograd - okolina",
    "delivery.zone2.time": "Dostava u roku od 4-6 sati",
    "delivery.zone2.fee": "300 RSD",
    "delivery.zone3.name": "Ostale lokacije",
    "delivery.zone3.time": "Dostava narednog dana",
    "delivery.zone3.fee": "500 RSD",
    "delivery.infoTitle": "Važne informacije",
    "delivery.info1": "Besplatna dostava za narudžbine preko 3.000 RSD u centru Beograda",
    "delivery.info2": "Možete izabrati željeno vreme dostave prilikom naručivanja",
    "delivery.info3": "Naš tim će vas kontaktirati telefonom pre dostave",
    "delivery.info4": "Prihvatamo gotovinu i kartice prilikom dostave",

    // Contact page
    "contact.title": "Kontaktirajte nas",
    "contact.subtitle": "Imате pitanja? Tu smo da vam pomognemo. Kontaktirajte nas putem forme ili direktno.",
    "contact.formTitle": "Pošaljite nam poruku",
    "contact.name": "Ime i prezime",
    "contact.emailLabel": "Email adresa",
    "contact.phoneLabel": "Broj telefona",
    "contact.message": "Poruka",
    "contact.send": "Pošalji poruku",
    "contact.infoTitle": "Kontakt informacije",
    "contact.phone": "Telefon",
    "contact.email": "Email",
    "contact.address": "Adresa",
    "contact.addressValue": "Bulevar kralja Aleksandra 123, Beograd",
    "contact.hours": "Radno vreme",
    "contact.hoursValue": "Ponedeljak - Nedelja: 08:00 - 22:00",
    "contact.location": "Naša lokacija",
  },
  en: {
    // Navigation
    home: "Home",
    shop: "Shop",
    about: "About",
    delivery: "Delivery",
    contact: "Contact",
    cart: "Cart",
    login: "Login",
    register: "Register",
    logout: "Logout",
    account: "Account",
    admin: "Admin",

    // Hero section translations
    "hero.badge": "Fast delivery across Serbia",
    "hero.title": "Shop groceries online",
    "hero.subtitle": "Fresh, quality products delivered on time. Enjoy fast delivery straight to your door.",
    "hero.cta": "Start shopping",
    "hero.ctaSecondary": "View deals",

    // Category section translations
    "categories.title": "Product categories",
    "categories.subtitle": "Find everything you need",
    "categories.subcategories": "subcategories",

    // Featured section translations
    "featured.title": "Special offers",
    "featured.subtitle": "Best prices just for you",
    "featured.viewAll": "View all",

    // Common
    search: "Search products...",
    addToCart: "Add to cart",
    viewDetails: "View details",
    price: "Price",
    total: "Total",
    subtotal: "Subtotal",
    quantity: "Quantity",
    remove: "Remove",
    checkout: "Checkout",
    placeOrder: "Place order",

    searchResults: "Search results",
    searchFor: "Search for",
    found: "Found",
    product: "product",
    products: "products",
    noResults: "No results for your search",
    tryDifferentKeywords: "Try different keywords",

    allProducts: "All products",
    filters: "Filters",
    discounts: "Discounts",
    onlyDiscounted: "Only discounted products",
    clearFilters: "Clear filters",
    showing: "Showing",
    nameAZ: "Name (A-Z)",
    noProductsMatch: "No products match your filters",

    // Cart translations
    "cart.title": "Cart",
    "cart.items": "Cart items",
    "cart.emptyCart": "Empty cart",
    "cart.continueShopping": "Continue shopping",
    "cart.viewCart": "View cart",
    "cart.allProducts": "All products",
    "cart.deliveryFee": "Delivery fee",
    "cart.free": "Free",
    "cart.freeShippingNote": "Free shipping for orders over 3,000 RSD",
    "cart.promoCode": "Add promo code",
    "cart.promoCodePlaceholder": "Enter code",
    "cart.applyPromo": "Apply",
    "cart.orderDetails": "Order details",
    "cart.selectAddress": "Select address",
    "cart.deliveryDetails": "Delivery details",
    "cart.delivery": "Delivery",
    "cart.confirmTime": "Time confirmation",

    // Cart
    emptyCart: "Your cart is empty",
    startShopping: "Start shopping",
    cartSummary: "Cart summary",

    // Product card translations
    "product.addedToCart": "Added to cart",
    "product.addedMessage": "has been added to your cart",

    // Checkout
    checkoutTitle: "Complete your order",
    phoneNumber: "Phone number",
    phoneRequired: "Phone number is required",
    orderNote: "Note (optional)",
    orderNotePlaceholder: "Additional notes for your order...",
    loginToOrder: "You must be logged in to place an order",

    // Product
    inStock: "In stock",
    outOfStock: "Out of stock",
    discount: "Discount",

    // Filters
    categories: "Categories",
    subcategories: "Subcategories",
    allCategories: "All categories",
    sortBy: "Sort by",
    priceAsc: "Price: low to high",
    priceDesc: "Price: high to low",

    // Auth
    email: "Email",
    password: "Password",
    name: "Name",
    loginTitle: "Log in",
    registerTitle: "Sign up",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",

    // Order
    orderSuccess: "Order placed successfully!",
    orderSuccessMessage: "Your order has been received. We will contact you soon.",
    orderNumber: "Order number",

    // Footer
    aboutUs: "About us",
    deliveryInfo: "Delivery information",
    contactUs: "Contact us",
    allRightsReserved: "All rights reserved",

    // About page
    "about.title": "About Us",
    "about.subtitle":
      "360logistics is your trusted partner for online grocery shopping and fast delivery across Serbia.",
    "about.stat1": "Products",
    "about.stat2": "Happy Customers",
    "about.stat3": "Daily Deliveries",
    "about.storyTitle": "Our Story",
    "about.story1":
      "360logistics was founded with a vision to revolutionize the way people shop for groceries. We believe shopping should be simple, fast, and accessible to everyone.",
    "about.story2":
      "Our team of experts works daily to provide you with the best online shopping experience. From carefully selected products to fast delivery, everything we do is focused on your satisfaction.",
    "about.story3":
      "Today we are proud to serve thousands of satisfied customers across Serbia, delivering fresh and quality products directly to their doors.",
    "about.valuesTitle": "Our Values",
    "about.value1.title": "Quality",
    "about.value1.desc": "We select only the best products from verified suppliers to guarantee top quality.",
    "about.value2.title": "Reliability",
    "about.value2.desc": "We deliver on time, every time. Your trust is our greatest value.",
    "about.value3.title": "Customer Satisfaction",
    "about.value3.desc": "Your satisfaction is our priority. We're here to help you at any time.",

    // Delivery page
    "delivery.title": "Delivery",
    "delivery.subtitle": "Fast and reliable delivery directly to your address. Learn more about our delivery process.",
    "delivery.processTitle": "How Delivery Works",
    "delivery.step": "Step",
    "delivery.step1.title": "Order Online",
    "delivery.step1.desc": "Select products and complete your order on our website.",
    "delivery.step2.title": "We Confirm",
    "delivery.step2.desc": "We check availability and contact you for confirmation.",
    "delivery.step3.title": "We Pack Carefully",
    "delivery.step3.desc": "Our team carefully packs your products for transport.",
    "delivery.step4.title": "Deliver to Your Door",
    "delivery.step4.desc": "We deliver at the agreed time directly to your address.",
    "delivery.zonesTitle": "Delivery Zones",
    "delivery.zone1.name": "Belgrade - Center",
    "delivery.zone1.time": "Delivery within 2-4 hours",
    "delivery.zone1.fee": "Free",
    "delivery.zone2.name": "Belgrade - Suburbs",
    "delivery.zone2.time": "Delivery within 4-6 hours",
    "delivery.zone2.fee": "300 RSD",
    "delivery.zone3.name": "Other Locations",
    "delivery.zone3.time": "Next day delivery",
    "delivery.zone3.fee": "500 RSD",
    "delivery.infoTitle": "Important Information",
    "delivery.info1": "Free delivery for orders over 3,000 RSD in Belgrade center",
    "delivery.info2": "You can choose your preferred delivery time when ordering",
    "delivery.info3": "Our team will contact you by phone before delivery",
    "delivery.info4": "We accept cash and cards upon delivery",

    // Contact page
    "contact.title": "Contact Us",
    "contact.subtitle": "Have questions? We're here to help. Contact us via the form or directly.",
    "contact.formTitle": "Send Us a Message",
    "contact.name": "Full Name",
    "contact.emailLabel": "Email Address",
    "contact.phoneLabel": "Phone Number",
    "contact.message": "Message",
    "contact.send": "Send Message",
    "contact.infoTitle": "Contact Information",
    "contact.phone": "Phone",
    "contact.email": "Email",
    "contact.address": "Address",
    "contact.addressValue": "Bulevar kralja Aleksandra 123, Belgrade",
    "contact.hours": "Working Hours",
    "contact.hoursValue": "Monday - Sunday: 08:00 - 22:00",
    "contact.location": "Our Location",
  },
} as const

export type TranslationKey = keyof typeof translations.sr

export function getTranslation(locale: Locale["code"], key: TranslationKey): string {
  return translations[locale][key] || translations[defaultLocale][key]
}
