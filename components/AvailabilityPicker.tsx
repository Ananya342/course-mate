"use client";

import { useMemo } from "react";
import type { TimeBlock } from "@/lib/types";

const DAYS = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
];

const SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];

type AvailabilityPickerProps = {
  value: TimeBlock[];
  onChange: (blocks: TimeBlock[]) => void;
};

function slotToKey(day: string, start: string): string {
  return `${day}-${start}`;
}

export default function AvailabilityPicker({ value, onChange }: AvailabilityPickerProps) {
  const selectedSet = useMemo(() => {
    const set = new Set<string>();
    for (const b of value) {
      set.add(slotToKey(b.day, b.start));
    }
    return set;
  }, [value]);

  const toggle = (day: string, start: string) => {
    const key = slotToKey(day, start);
    const idx = SLOTS.indexOf(start);
    const end = idx < SLOTS.length - 1 ? SLOTS[idx + 1] : "19:00";
    if (selectedSet.has(key)) {
      onChange(value.filter((b) => !(b.day === day && b.start === start)));
    } else {
      onChange([...value, { day, start, end }]);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--muted)]">
        Tap blocks to add or remove. Selected = your available times.
      </p>
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-2 min-w-full">
          {DAYS.map((day) => (
            <div key={day.id} className="flex items-center gap-2">
              <span className="w-10 flex-shrink-0 text-xs font-medium text-[var(--muted)]">
                {day.label}
              </span>
              <div className="flex gap-1 flex-wrap">
                {SLOTS.map((start) => {
                  const key = slotToKey(day.id, start);
                  const isSelected = selectedSet.has(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggle(day.id, start)}
                      className={`w-9 h-8 rounded-lg text-xs font-medium transition-all duration-150 active:scale-95 ${
                        isSelected
                          ? "bg-[var(--accent)] text-white shadow-md"
                          : "bg-[var(--surface-hover)] text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      {start.slice(0, 2)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
