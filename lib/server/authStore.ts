import { randomInt, randomUUID } from "node:crypto";

const OTP_TTL_MS = 10 * 60 * 1000;
const VERIFIED_TOKEN_TTL_MS = 15 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

type OTPRecord = {
  code: string;
  expiresAt: number;
};

type VerifiedRecord = {
  token: string;
  expiresAt: number;
};

const otpStore = new Map<string, OTPRecord>();
const verifiedStore = new Map<string, VerifiedRecord>();
const resendCooldownStore = new Map<string, number>();

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function createVerificationCode(): string {
  return String(randomInt(100000, 1000000));
}

export function canRequestCode(email: string): boolean {
  const nextAllowedAt = resendCooldownStore.get(email);
  if (!nextAllowedAt) return true;
  return Date.now() >= nextAllowedAt;
}

export function cooldownSecondsRemaining(email: string): number {
  const nextAllowedAt = resendCooldownStore.get(email) ?? 0;
  const remainingMs = nextAllowedAt - Date.now();
  return Math.max(0, Math.ceil(remainingMs / 1000));
}

export function saveVerificationCode(email: string, code: string): void {
  otpStore.set(email, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
  });
  resendCooldownStore.set(email, Date.now() + RESEND_COOLDOWN_MS);
}

export function verifyCode(email: string, code: string): boolean {
  const record = otpStore.get(email);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return false;
  }
  if (record.code !== code.trim()) return false;

  otpStore.delete(email);
  return true;
}

export function issueVerifiedToken(email: string): string {
  const token = randomUUID();
  verifiedStore.set(email, {
    token,
    expiresAt: Date.now() + VERIFIED_TOKEN_TTL_MS,
  });
  return token;
}

export function consumeVerifiedToken(email: string, token: string): boolean {
  const record = verifiedStore.get(email);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    verifiedStore.delete(email);
    return false;
  }
  if (record.token !== token) return false;

  verifiedStore.delete(email);
  return true;
}
