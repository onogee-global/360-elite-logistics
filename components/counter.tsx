"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useLocale } from "@/lib/locale-context";

type CounterProps = {
  to: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

export default function Counter({
  to,
  durationMs = 1500,
  prefix = "",
  suffix = "",
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { locale } = useLocale();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let rafId = 0;
    const start = performance.now();
    const from = 0;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      const next = from + (to - from) * ease(p);
      setVal(next);
      if (p < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [inView, to, durationMs]);

  const formatter = new Intl.NumberFormat(locale === "en" ? "en-US" : "sr-RS");
  const display = `${prefix}${formatter.format(Math.round(val))}${suffix}`;

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}


