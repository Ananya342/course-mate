"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Card, Button, Input, Textarea } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { resolveEnrolledCourses } from "@/lib/coursesDisplay";
import {
  SKILL_LABELS,
  STUDY_STYLE_LABELS,
  LOCATION_LABELS,
  GOAL_LABELS,
  TIME_PREF_LABELS,
  formatAvailabilityLine,
} from "@/lib/profileLabels";
import type { SkillLevel } from "@/lib/types";

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
        <span className="text-xl" aria-hidden>
          {icon}
        </span>
        {title}
      </h2>
      {subtitle && <p className="text-sm text-[var(--muted)] mt-1">{subtitle}</p>}
    </div>
  );
}

function InfoChip({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "accent" | "mint" }) {
  const tones = {
    default: "bg-[var(--surface-hover)] text-[var(--text)] border-[var(--border)]",
    accent: "bg-[var(--accent)]/12 text-[var(--accent)] border-[var(--accent)]/25",
    mint: "bg-[var(--mint)]/15 text-[var(--text)] border-[var(--mint)]/30",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium border ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, courses, signOut, updateProfileBasics } = useApp();
  const myCourses = resolveEnrolledCourses(user, courses);
  const initials =
    (user.name || "?")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState(user.name);
  const [formMajor, setFormMajor] = useState(user.major ?? "");
  const [formYear, setFormYear] = useState(user.year ?? "");
  const [formUniversity, setFormUniversity] = useState(user.university ?? "");
  const [formFunFact, setFormFunFact] = useState(user.funFact ?? "");
  const [formIg, setFormIg] = useState(user.socials?.instagram ?? "");
  const [formTw, setFormTw] = useState(user.socials?.twitter ?? "");
  const [formLi, setFormLi] = useState(user.socials?.linkedin ?? "");
  const [formDc, setFormDc] = useState(user.socials?.discord ?? "");

  useEffect(() => {
    if (!editing) {
      setFormName(user.name);
      setFormMajor(user.major ?? "");
      setFormYear(user.year ?? "");
      setFormUniversity(user.university ?? "");
      setFormFunFact(user.funFact ?? "");
      setFormIg(user.socials?.instagram ?? "");
      setFormTw(user.socials?.twitter ?? "");
      setFormLi(user.socials?.linkedin ?? "");
      setFormDc(user.socials?.discord ?? "");
    }
  }, [user, editing]);

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await updateProfileBasics({
        name: formName.trim() || user.name,
        major: formMajor.trim() || undefined,
        year: formYear.trim() || undefined,
        university: formUniversity.trim() || undefined,
        funFact: formFunFact.trim() || undefined,
        socials: {
          ...(formIg.trim() && { instagram: formIg.trim() }),
          ...(formTw.trim() && { twitter: formTw.trim() }),
          ...(formLi.trim() && { linkedin: formLi.trim() }),
          ...(formDc.trim() && { discord: formDc.trim() }),
        },
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const studyStyles = user.studyStyle ?? [];
  const locations = user.studyLocation ?? [];
  const hasSocials =
    user.socials &&
    Object.values(user.socials).some((v) => v && String(v).trim().length > 0);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text)] tracking-tight">
            Your{" "}
            <span className="bg-gradient-to-r from-[var(--accent)] via-[var(--pink)] to-[var(--electric)] bg-clip-text text-transparent">
              profile
            </span>
          </h1>
          <p className="text-[var(--muted)] mt-2 text-base max-w-xl">
            Everything classmates see for matching — keep it fresh so study partners find you.
          </p>
        </div>
        {!editing ? (
          <Button
            type="button"
            onClick={() => setEditing(true)}
            className="gradient-bg border-0 text-white font-bold shadow-lg shadow-[var(--accent)]/20 shrink-0"
          >
            Edit profile
          </Button>
        ) : (
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button type="button" variant="secondary" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleSaveEdit()} disabled={saving} className="gradient-bg border-0 text-white font-bold">
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        )}
      </div>

      {/* Hero card — full width */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-[var(--accent)]/25 shadow-xl shadow-[var(--accent)]/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/20 via-[var(--pink)]/10 to-[var(--electric)]/15 pointer-events-none" />
        <div className="relative p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center gap-8">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-[var(--accent)] via-[var(--pink)] to-[var(--electric)] text-white flex items-center justify-center text-4xl sm:text-5xl font-extrabold shrink-0 shadow-lg ring-4 ring-white/30">
            {initials}
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            {editing ? (
              <Input label="Display name" value={formName} onChange={(e) => setFormName(e.target.value)} />
            ) : (
              <>
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">{user.name}</h2>
                <p className="text-[var(--muted)] text-base break-all">{user.email}</p>
              </>
            )}
            {!editing && user.university && (
              <p className="text-sm font-semibold text-[var(--accent)]">{user.university}</p>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <Card padding="lg" className="border-[var(--accent)]/20 bg-[var(--surface)]">
          <SectionTitle icon="✏️" title="Edit basics" subtitle="Name, school, and fun fact sync to your Supabase profile when signed in." />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Major" value={formMajor} onChange={(e) => setFormMajor(e.target.value)} placeholder="e.g. Computer Science" />
            <Input label="Year" value={formYear} onChange={(e) => setFormYear(e.target.value)} placeholder="e.g. Sophomore" />
            <Input
              label="University"
              className="sm:col-span-2"
              value={formUniversity}
              onChange={(e) => setFormUniversity(e.target.value)}
              placeholder="School name"
            />
            <div className="sm:col-span-2">
              <Textarea label="Fun fact" value={formFunFact} onChange={(e) => setFormFunFact(e.target.value)} rows={3} placeholder="Something memorable…" />
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <p className="text-sm font-semibold text-[var(--text)] mb-3">Social (optional)</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Instagram" value={formIg} onChange={(e) => setFormIg(e.target.value)} placeholder="@handle" />
              <Input label="Twitter / X" value={formTw} onChange={(e) => setFormTw(e.target.value)} placeholder="@handle" />
              <Input label="LinkedIn" value={formLi} onChange={(e) => setFormLi(e.target.value)} placeholder="Profile URL or username" />
              <Input label="Discord" value={formDc} onChange={(e) => setFormDc(e.target.value)} placeholder="username#0000" />
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Academic */}
        <Card padding="lg" className="border-[var(--border)] bg-[var(--surface)] h-full">
          <SectionTitle icon="🎓" title="Academic" subtitle="Courses and level per class" />
          {!editing && (
            <div className="space-y-3 mb-6">
              {user.major && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Major</p>
                  <p className="text-[var(--text)] font-semibold mt-0.5">{user.major}</p>
                </div>
              )}
              {user.year && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Year</p>
                  <p className="text-[var(--text)] font-semibold mt-0.5">{user.year}</p>
                </div>
              )}
              {user.university && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">University</p>
                  <p className="text-[var(--text)] font-semibold mt-0.5">{user.university}</p>
                </div>
              )}
            </div>
          )}
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3">Courses enrolled</p>
          {myCourses.length === 0 ? (
            <p className="text-sm text-[var(--muted)] py-4 rounded-xl bg-[var(--surface-hover)] px-4 border border-dashed border-[var(--border)]">
              No courses on file. Complete onboarding or add courses there — they’ll show here and in the sidebar.
            </p>
          ) : (
            <ul className="space-y-3">
              {myCourses.map((c) => {
                const level = user.skillLevel[c.id] as SkillLevel | undefined;
                return (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[var(--border)] bg-gradient-to-r from-[var(--surface-hover)]/80 to-transparent px-4 py-3"
                  >
                    <Link href={`/dashboard/qa?course=${c.id}`} className="min-w-0 group">
                      <span className="font-bold text-[var(--accent)] group-hover:underline">{c.code}</span>
                      <span className="block text-sm text-[var(--muted)] truncate">{c.name}</span>
                    </Link>
                    {level && <InfoChip tone="accent">{SKILL_LABELS[level]}</InfoChip>}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Study style & prefs */}
        <Card padding="lg" className="border-[var(--border)] bg-[var(--surface)] h-full">
          <SectionTitle icon="📚" title="Study preferences" subtitle="How and when you like to work" />
          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Styles</p>
              <div className="flex flex-wrap gap-2">
                {studyStyles.length === 0 ? (
                  <span className="text-sm text-[var(--muted)]">—</span>
                ) : (
                  studyStyles.map((s) => <InfoChip key={s}>{STUDY_STYLE_LABELS[s]}</InfoChip>)
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Locations</p>
              <div className="flex flex-wrap gap-2">
                {locations.length === 0 ? (
                  <span className="text-sm text-[var(--muted)]">—</span>
                ) : (
                  locations.map((loc) => <InfoChip key={loc} tone="mint">{LOCATION_LABELS[loc]}</InfoChip>)
                )}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Goal</p>
                <p className="text-[var(--text)] font-semibold">
                  {user.studyGoal ? GOAL_LABELS[user.studyGoal] : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Time preference</p>
                <p className="text-[var(--text)] font-semibold">
                  {user.studyTimePreference ? TIME_PREF_LABELS[user.studyTimePreference] : "—"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Availability</p>
              {user.availability?.length ? (
                <ul className="space-y-1.5">
                  {user.availability.map((b, i) => (
                    <li key={i} className="text-sm font-medium text-[var(--text)] pl-3 border-l-2 border-[var(--electric)]">
                      {formatAvailabilityLine(b.day, b.start, b.end)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--muted)]">—</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Fun fact & socials — read view */}
      {!editing && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card padding="lg" className="border-[var(--pink)]/30 bg-gradient-to-br from-[var(--pink)]/5 to-transparent">
            <SectionTitle icon="✨" title="Fun fact" />
            {user.funFact ? (
              <p className="text-lg text-[var(--text)] leading-relaxed font-medium italic border-l-4 border-[var(--pink)] pl-4">
                &ldquo;{user.funFact}&rdquo;
              </p>
            ) : (
              <p className="text-[var(--muted)]">Add a fun fact when you edit your profile.</p>
            )}
          </Card>
          <Card padding="lg" className="border-[var(--electric)]/30 bg-gradient-to-br from-[var(--electric)]/5 to-transparent">
            <SectionTitle icon="🔗" title="Social" />
            {hasSocials ? (
              <ul className="space-y-2 text-sm">
                {user.socials?.instagram && (
                  <li>
                    <span className="text-[var(--muted)] font-semibold">Instagram </span>
                    <span className="text-[var(--text)]">{user.socials.instagram}</span>
                  </li>
                )}
                {user.socials?.twitter && (
                  <li>
                    <span className="text-[var(--muted)] font-semibold">Twitter </span>
                    <span className="text-[var(--text)]">{user.socials.twitter}</span>
                  </li>
                )}
                {user.socials?.linkedin && (
                  <li>
                    <span className="text-[var(--muted)] font-semibold">LinkedIn </span>
                    <span className="text-[var(--text)]">{user.socials.linkedin}</span>
                  </li>
                )}
                {user.socials?.discord && (
                  <li>
                    <span className="text-[var(--muted)] font-semibold">Discord </span>
                    <span className="text-[var(--text)]">{user.socials.discord}</span>
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-[var(--muted)]">No socials added yet.</p>
            )}
          </Card>
        </div>
      )}

      {/* Settings */}
      <Card padding="lg" className="border-[var(--border)]">
        <SectionTitle icon="⚙️" title="Settings" subtitle="Toggles are local only for now" />
        <div className="space-y-4">
          {[
            { title: "Email notifications", desc: "New matches and messages" },
            { title: "Study reminders", desc: "Daily study nudge" },
            { title: "Profile visibility", desc: "Appear in campus search" },
            { title: "Anonymous Q&A", desc: "Post without your name on Q&A" },
          ].map((row) => (
            <div
              key={row.title}
              className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0 gap-4"
            >
              <div>
                <p className="font-semibold text-[var(--text)]">{row.title}</p>
                <p className="text-sm text-[var(--muted)]">{row.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-[var(--border)] rounded-full peer peer-checked:bg-[var(--accent)] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
              </label>
            </div>
          ))}
        </div>
      </Card>

      <Card padding="lg" className="border-red-500/20 bg-red-500/5">
        <Button
          variant="secondary"
          fullWidth
          className="border-red-500/30 text-red-700 hover:bg-red-500/10"
          onClick={async () => {
            await signOut();
            router.push(isSupabaseConfigured() ? "/login" : "/");
          }}
        >
          Log out
        </Button>
      </Card>
    </div>
  );
}
