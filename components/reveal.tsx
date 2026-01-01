"use client";

import type { PropsWithChildren } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type RevealProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
}>;

export default function Reveal({
  children,
  className,
  delay = 0,
  y = 14,
  duration = 0.45,
}: RevealProps) {
  const prefersReduced = useReducedMotion();
  const initial = prefersReduced ? { opacity: 0 } : { opacity: 0, y };
  const animate = prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 };
  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: prefersReduced ? 0.2 : duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(className)}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}


