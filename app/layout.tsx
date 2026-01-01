import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { LocaleProvider } from "@/lib/locale-context"
import PageTransition from "@/components/page-transition"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "360logistics - Online kupovina namirnica",
  description: "Kupujte namirnice online sa dostavom. Širok asortiman proizvoda po povoljnim cenama.",
  keywords: ["namirnice", "online kupovina", "dostava", "360logistics", "groceries"],
  authors: [{ name: "360logistics" }],
  creator: "360logistics",
  publisher: "360logistics",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "sr_RS",
    alternateLocale: ["en_US"],
    url: "https://360logistics.rs",
    siteName: "360logistics",
    title: "360logistics - Online kupovina namirnica",
    description: "Kupujte namirnice online sa dostavom. Širok asortiman proizvoda po povoljnim cenama.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "360logistics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "360logistics - Online kupovina namirnica",
    description: "Kupujte namirnice online sa dostavom",
    images: ["/og-image.png"],
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sr">
      <head>
        <link rel="alternate" hrefLang="sr" href="https://360logistics.rs" />
        <link rel="alternate" hrefLang="en" href="https://360logistics.rs/en" />
        <link rel="alternate" hrefLang="x-default" href="https://360logistics.rs" />
      </head>
      <body className={`font-sans antialiased flex flex-col min-h-screen`}>
        <LocaleProvider>
          <Header />
          <main className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <Toaster />
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  )
}
