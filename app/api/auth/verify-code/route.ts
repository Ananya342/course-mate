import { NextResponse } from "next/server";
import {
  isValidEmail,
  issueVerifiedToken,
  normalizeEmail,
  verifyCode,
} from "@/lib/server/authStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawEmail = typeof body?.email === "string" ? body.email : "";
    const email = normalizeEmail(rawEmail);
    const code = typeof body?.code === "string" ? body.code.trim() : "";

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Enter a valid 6-digit code." }, { status: 400 });
    }

    const isValidCode = verifyCode(email, code);
    if (!isValidCode) {
      return NextResponse.json(
        { error: "Incorrect or expired code. Please request a new one." },
        { status: 400 }
      );
    }

    const verificationToken = issueVerifiedToken(email);
    return NextResponse.json({ ok: true, verificationToken });
  } catch (error) {
    console.error("Failed to verify code:", error);
    return NextResponse.json({ error: "Could not verify code. Please try again." }, { status: 500 });
  }
}
