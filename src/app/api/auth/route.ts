import { NextRequest, NextResponse } from "next/server";
import { setAdminCookie, clearAdminCookie, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password, action } = await req.json();

  if (action === "logout") {
    clearAdminCookie();
    return NextResponse.json({ ok: true });
  }

  if (!verifyPassword(password ?? "")) {
    return NextResponse.json(
      { ok: false, error: "รหัสผ่านไม่ถูกต้อง" },
      { status: 401 }
    );
  }

  setAdminCookie();
  return NextResponse.json({ ok: true });
}
