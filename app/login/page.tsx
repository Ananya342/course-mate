"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input, Button } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No backend - just go to dashboard and "log in" for demo
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
          <p className="text-[var(--muted)] text-sm mb-6">Welcome back! (Demo: any input works)</p>
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
            <Button type="submit" fullWidth size="lg">
              Log in
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
