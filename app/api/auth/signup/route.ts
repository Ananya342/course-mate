import { NextResponse } from "next/server";
import {
  consumeVerifiedToken,
  isValidEmail,
  normalizeEmail,
} from "@/lib/server/authStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawEmail = typeof body?.email === "string" ? body.email : "";
    const email = normalizeEmail(rawEmail);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const verificationToken =
      typeof body?.verificationToken === "string" ? body.verificationToken : "";

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Enter your name." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    if (!verificationToken) {
      return NextResponse.json({ error: "Email verification is required." }, { status: 400 });
    }

    const isTokenValid = consumeVerifiedToken(email, verificationToken);
    if (!isTokenValid) {
      return NextResponse.json(
        { error: "Verification expired. Please verify your email again." },
        { status: 401 }
      );
    }

    // Placeholder for real user persistence; currently returns success for demo app flow.
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to sign up:", error);
    return NextResponse.json({ error: "Could not create account. Please try again." }, { status: 500 });
  }
}
