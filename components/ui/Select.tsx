"use client";

import { forwardRef } from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: { value: string; label: string }[];
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", label, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none appearance-none bg-no-repeat bg-[length:1.25rem] bg-[right_0.75rem_center] pr-10 ${className}`}
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")" }}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);
Select.displayName = "Select";
export default Select;
