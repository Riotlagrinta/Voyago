import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = ({ className, hoverable = false, children, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-white p-4 shadow-sm transition-all duration-300",
        hoverable && "hover:shadow-voyago hover:-translate-y-1 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
