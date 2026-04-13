import { NextRequest, NextResponse } from "next/server";

type EarlyAccessPayload = {
  name?: string;
  email?: string;
  website?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;

function sanitizeForSheets(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^[=+\-@\t\r]/.test(trimmed) ? `'${trimmed}` : trimmed;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as EarlyAccessPayload;

    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const website = (body.website || "").trim();

    if (website) {
      return NextResponse.json({ ok: true });
    }

    if (!name || !email) {
      return NextResponse.json(
        { ok: false, error: "Name and email are required." },
        { status: 400 }
      );
    }

    if (name.length > MAX_NAME_LENGTH || email.length > MAX_EMAIL_LENGTH) {
      return NextResponse.json(
        { ok: false, error: "Submitted fields are too long." },
        { status: 400 }
      );
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const scriptUrl = process.env.EARLY_ACCESS_SCRIPT_URL;
    const secret = process.env.EARLY_ACCESS_SCRIPT_SECRET;

    if (!scriptUrl || !secret) {
      return NextResponse.json(
        { ok: false, error: "Server is not configured." },
        { status: 500 }
      );
    }

    const forwardRes = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret,
        name: sanitizeForSheets(name),
        email: sanitizeForSheets(email),
      }),
      cache: "no-store",
    });

    const result = await forwardRes.json().catch(() => null);

    if (!forwardRes.ok || !result?.ok) {
      return NextResponse.json(
        { ok: false, error: "Failed to save submission." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 }
    );
  }
}
