import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminToken, setAdminCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const hash = process.env.ADMIN_PASSWORD_BCRYPT;
  if (!hash) {
    return NextResponse.json(
      { error: "Admin login is not configured" },
      { status: 503 },
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const password = body.password;
  if (typeof password !== "string" || !password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  const ok = await bcrypt.compare(password, hash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createAdminToken();
  await setAdminCookie(token);

  return NextResponse.json({ ok: true });
}
