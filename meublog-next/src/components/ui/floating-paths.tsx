"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function FloatingPathsBackground({
  position,
  children,
  className,
}: {
  position: number;
  className?: string;
  children: React.ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();

  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className={cn("relative w-full", className)}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <svg
          className="h-full w-full text-accent2"
          viewBox="0 0 696 316"
          fill="none"
          aria-hidden="true"
        >
          {paths.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="currentColor"
              strokeWidth={path.width}
              strokeOpacity={0.08 + path.id * 0.015}
              initial={{ pathLength: 0.3, opacity: 0.5 }}
              animate={
                shouldReduceMotion
                  ? { pathLength: 1, opacity: 0.4 }
                  : {
                      pathLength: 1,
                      opacity: [0.25, 0.5, 0.25],
                      pathOffset: [0, 1, 0],
                    }
              }
              transition={{
                duration: 20 + (path.id % 6) * 3,
                repeat: shouldReduceMotion ? 0 : Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          ))}
        </svg>
      </div>
      {children}
    </div>
  );
}
