"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input, Button } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { friendlySignInError } from "@/lib/auth/loginErrors";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }

    if (isSupabaseConfigured()) {
      setLoading(true);
      try {
        const supabase = createBrowserSupabaseClient();
        const { error: signErr } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (signErr) {
          setError(friendlySignInError(signErr.message));
          return;
        }
        router.push("/dashboard");
        router.refresh();
      } catch {
        setError("Could not sign in. Check your Supabase environment variables.");
      } finally {
        setLoading(false);
      }
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--bg)]">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-block font-bold text-xl text-[var(--accent)] mb-8">
          ← CourseMate
        </Link>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Log in</h1>
          <p className="text-[var(--muted)] text-sm mb-6">
            {isSupabaseConfigured()
              ? "Sign in with the email and password you used at sign up. One account per email."
              : "Demo mode: any email/password continues to the dashboard."}
          </p>
          {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? "Signing in…" : "Log in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-[var(--muted)]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[var(--accent)] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
