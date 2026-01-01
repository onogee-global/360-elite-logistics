"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import type { PropsWithChildren } from "react";

export default function PageTransition({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();
  // Gentle fade-in on enter only (no exit) to avoid blink
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: prefersReduced ? 0.25 : 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ willChange: "opacity" }}
    >
      {children}
    </motion.div>
  );
}


