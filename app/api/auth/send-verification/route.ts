import { NextResponse } from "next/server";
import {
  canRequestCode,
  cooldownSecondsRemaining,
  createVerificationCode,
  isValidEmail,
  normalizeEmail,
  saveVerificationCode,
} from "@/lib/server/authStore";
import { sendVerificationEmail } from "@/lib/server/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawEmail = typeof body?.email === "string" ? body.email : "";
    const email = normalizeEmail(rawEmail);

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (!canRequestCode(email)) {
      const seconds = cooldownSecondsRemaining(email);
      return NextResponse.json(
        { error: `Please wait ${seconds} seconds before requesting another code.` },
        { status: 429 }
      );
    }

    const code = createVerificationCode();
    await sendVerificationEmail(email, code);
    saveVerificationCode(email, code);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to send verification code:", error);
    return NextResponse.json(
      { error: "Could not send verification email. Please try again." },
      { status: 500 }
    );
  }
}
