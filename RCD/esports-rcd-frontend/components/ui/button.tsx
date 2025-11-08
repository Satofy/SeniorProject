"use client";

import * as React from "react";
import { clsx } from "clsx";

type Variant = "default" | "outline" | "ghost" | "gradient";
type Size = "sm" | "md" | "lg" | "icon";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  className?: string;
};

const base =
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
const variants: Record<Variant, string> = {
  default: "bg-primary text-white hover:brightness-110",
  outline: "border border-border text-foreground hover:bg-accent hover:text-accent-foreground",
  ghost: "text-foreground/80 hover:bg-accent/40 hover:text-foreground",
  gradient: "bg-gradient-to-r from-primary to-purple-600 text-white shadow-sm hover:shadow-md",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
  icon: "h-9 w-9 p-0 flex items-center justify-center",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "default", size = "md", asChild, className, children, ...props }, ref) {
    const classes = clsx(base, variants[variant], sizes[size], className);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: clsx((children as any).props?.className, classes),
      });
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

// Utility to mirror shadcn style API used by some components (e.g., alert-dialog)
export function buttonVariants({ variant = "default", size = "md", className }: { variant?: Variant; size?: Size; className?: string } = {}) {
  return clsx(base, variants[variant], sizes[size], className);
}
