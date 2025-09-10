"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  label?: string;
  showValue?: boolean;
  color?: "blue" | "green" | "purple" | "indigo" | "cyan" | "orange";
  size?: "sm" | "md" | "lg";
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  max = 100,
  className,
  label,
  showValue = true,
  color = "blue",
  size = "md",
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 200);
    return () => clearTimeout(timer);
  }, [value]);

  const percentage = Math.max(0, Math.min(100, (animatedValue / max) * 100));

  const colorClasses = {
    blue: "from-blue-500 to-cyan-400",
    green: "from-green-500 to-emerald-400",
    purple: "from-purple-500 to-violet-400",
    indigo: "from-indigo-500 to-blue-400",
    cyan: "from-cyan-500 to-teal-400",
    orange: "from-orange-500 to-amber-400",
  };

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {showValue && (
            <span className="text-sm text-muted-foreground">
              {Math.round(animatedValue)}
              {max === 100 ? "%" : `/${max}`}
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          "relative overflow-hidden rounded-full bg-secondary",
          sizeClasses[size]
        )}
      >
        <motion.div
          className={cn(
            "h-full rounded-full bg-gradient-to-r",
            colorClasses[color]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 1.2,
            ease: [0.4, 0, 0.2, 1],
            delay: 0.1,
          }}
        />

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            duration: 2,
            ease: "linear",
            delay: 0.5,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />
      </div>
    </div>
  );
};
