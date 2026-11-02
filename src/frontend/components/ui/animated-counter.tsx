"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 2,
  className,
}: {
  value: string;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState("0");

  // Extract numeric part and any suffix from the value string
  const numericMatch = value.match(/^(\d+)/);
  const numericValue = numericMatch ? parseInt(numericMatch[1], 10) : 0;
  const valueSuffix = value.replace(/^\d+/, ""); // e.g., "+" from "500+"

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, numericValue, {
      duration,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate(latest) {
        setDisplayValue(Math.round(latest).toLocaleString());
      },
    });

    return () => controls.stop();
  }, [isInView, numericValue, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {isInView ? displayValue : "0"}
      {valueSuffix}
      {suffix}
    </span>
  );
}
