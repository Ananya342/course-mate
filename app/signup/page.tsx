"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input, Button } from "@/components/ui";

type SignupStep = "email" | "verify" | "profile";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<SignupStep>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setIsSendingCode(true);
    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Could not send verification code.");
        return;
      }

      setEmail(normalizedEmail);
      setStep("verify");
      setMessage(`We sent a verification code to ${normalizedEmail}.`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(codeInput.trim())) {
      setError("Enter a valid 6-digit code.");
      return;
    }

    setIsVerifyingCode(true);
    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: codeInput.trim() }),
      });
      const data = (await response.json()) as { error?: string; verificationToken?: string };

      if (!response.ok || !data.verificationToken) {
        setError(data.error ?? "Could not verify code.");
        return;
      }

      setVerificationToken(data.verificationToken);
      setStep("profile");
      setMessage("Email verified. Complete your account details.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("Enter your name.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!verificationToken) {
      setError("Please verify your email before creating your account.");
      setStep("verify");
      return;
    }

    setIsCreatingAccount(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name.trim(),
          password,
          verificationToken,
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Could not create account.");
        return;
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("signupName", name.trim());
        sessionStorage.setItem("signupEmail", email);
      }
      router.push("/dashboard?onboarding=1");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsCreatingAccount(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--bg)]">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-block font-bold text-xl text-[var(--accent)] mb-8">
          ← CourseMate
        </Link>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Sign up</h1>
          <p className="text-[var(--muted)] text-sm mb-2">
            {step === "email" && "Step 1 of 3: verify your email"}
            {step === "verify" && "Step 2 of 3: enter your verification code"}
            {step === "profile" && "Step 3 of 3: finish setting up your account"}
          </p>
          <p className="text-[var(--muted)] text-xs mb-6">We will email you a one-time verification code.</p>
          {message && <p className="mb-4 text-sm text-emerald-400">{message}</p>}
          {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" fullWidth size="lg" disabled={isSendingCode}>
                {isSendingCode ? "Sending..." : "Send verification code"}
              </Button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <Input label="Email" value={email} disabled />
              <Input
                label="Verification code"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  disabled={isVerifyingCode}
                  onClick={() => {
                    setStep("email");
                    setCodeInput("");
                    setVerificationToken("");
                    setError("");
                    setMessage("");
                  }}
                >
                  Change email
                </Button>
                <Button type="submit" className="flex-1" disabled={isVerifyingCode}>
                  {isVerifyingCode ? "Verifying..." : "Verify code"}
                </Button>
              </div>
            </form>
          )}

          {step === "profile" && (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <Input label="Email" value={email} disabled />
              <Input
                label="Name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" fullWidth size="lg" disabled={isCreatingAccount}>
                {isCreatingAccount ? "Creating account..." : "Create account"}
              </Button>
            </form>
          )}
          <p className="mt-4 text-center text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--accent)] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
