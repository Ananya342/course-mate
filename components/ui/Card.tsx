"use client";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
};

const paddingMap = { none: "", sm: "p-4", md: "p-5", lg: "p-6" };

export default function Card({
  className = "",
  hover,
  padding = "md",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] ${paddingMap[padding]} ${hover ? "transition-all duration-200 hover:border-[var(--muted)] hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
