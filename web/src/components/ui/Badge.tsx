import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info";
}

export const Badge = ({ className, variant = "default", children, ...props }: BadgeProps) => {
  const variants = {
    default: "bg-surface text-foreground/70",
    success: "bg-success/10 text-success-dark",
    warning: "bg-accent/10 text-accent-dark",
    error: "bg-red-100 text-red-700",
    info: "bg-primary-light text-primary",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
