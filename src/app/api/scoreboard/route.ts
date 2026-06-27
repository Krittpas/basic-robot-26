import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// POST: adjust score by delta  { id: number, delta: number }
// PUT:  set score absolute    { id: number, score: number }
export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id, delta } = await req.json();
  if (typeof id !== "number" || typeof delta !== "number") {
    return NextResponse.json({ error: "bad input" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data: current, error: e1 } = await sb
    .from("groups").select("score").eq("id", id).single();
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  const newScore = (current?.score ?? 0) + delta;
  const { error: e2 } = await sb
    .from("groups")
    .update({ score: newScore, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

  return NextResponse.json({ ok: true, score: newScore });
}

export async function PUT(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id, score } = await req.json();
  if (typeof id !== "number" || typeof score !== "number") {
    return NextResponse.json({ error: "bad input" }, { status: 400 });
  }
  const { error } = await supabaseAdmin()
    .from("groups")
    .update({ score, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
