import { NextResponse } from "next/server";
import {
  consumeVerifiedToken,
  isValidEmail,
  normalizeEmail,
} from "@/lib/server/authStore";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { validatePassword } from "@/lib/auth/passwordPolicy";

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
    const pwCheck = validatePassword(password);
    if (!pwCheck.ok) {
      return NextResponse.json(
        { error: pwCheck.errors.join(" ") },
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

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!url) {
      return NextResponse.json({ ok: true });
    }

    if (!serviceKey) {
      return NextResponse.json(
        {
          error:
            "NEXT_PUBLIC_SUPABASE_URL is set but SUPABASE_SERVICE_ROLE_KEY is missing. Add the service role key in .env.local.",
        },
        { status: 503 }
      );
    }

    const admin = createAdminSupabaseClient();
    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered")) {
        return NextResponse.json(
          { error: "An account with this email already exists. Try logging in." },
          { status: 409 }
        );
      }
      console.error("Supabase createUser:", error);
      return NextResponse.json(
        { error: "Could not create account. Check Supabase configuration." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to sign up:", error);
    return NextResponse.json({ error: "Could not create account. Please try again." }, { status: 500 });
  }
}
