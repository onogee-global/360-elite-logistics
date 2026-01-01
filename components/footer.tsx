"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { motion } from "framer-motion"

export function Footer() {
  const { t } = useLocale()

  return (
    <footer className="border-t bg-muted/30 mt-auto relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-[120%] bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 blur-3xl" />
      <div className="container mx-auto px-4 py-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="font-bold text-lg mb-4">{t("about")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  {t("aboutUs")}
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Customer Service */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}>
            <h3 className="font-bold text-lg mb-4">{t("contact")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  {t("contactUs")}
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-foreground">
                  {t("deliveryInfo")}
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Shop */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <h3 className="font-bold text-lg mb-4">{t("shop")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/products" className="hover:text-foreground">
                  {t("allProducts")}
                </Link>
              </li>
              <li>
                <Link href="/products?discount=true" className="hover:text-foreground">
                  {t("discounts")}
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
            <h3 className="font-bold text-lg mb-4">{t("contact")}</h3>
            <div className="flex gap-4">
              <motion.div whileHover={{ y: -2 }}>
                <Link href="https://facebook.com" className="text-muted-foreground hover:text-foreground">
                  <Facebook className="h-5 w-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }}>
                <Link href="https://instagram.com" className="text-muted-foreground hover:text-foreground">
                  <Instagram className="h-5 w-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }}>
                <Link href="https://twitter.com" className="text-muted-foreground hover:text-foreground">
                  <Twitter className="h-5 w-5" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2025 360logistics. {t("allRightsReserved")}.</p>
        </div>
      </div>
    </footer>
  )
}
