"use client";

import { forwardRef } from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none resize-y min-h-[100px] ${error ? "border-red-500/50" : ""} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
export default Textarea;
