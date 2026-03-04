"use client";

import { forwardRef } from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", fullWidth, children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-medium rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
    const variants = {
      primary:
        "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40",
      secondary:
        "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-hover)] hover:border-[var(--muted)]",
      ghost:
        "bg-transparent text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
      danger:
        "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm gap-1.5",
      md: "px-5 py-2.5 text-sm gap-2",
      lg: "px-6 py-3 text-base gap-2",
    };
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
