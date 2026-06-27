import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(req: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...fields } = body as { id: number; [k: string]: unknown };

  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  // เก็บเฉพาะ field ที่อนุญาต
  const allowed = [
    "lane1_team", "lane2_team", "lane3_team", "lane4_team", "lane5_team", "lane6_team",
    "lane1_time", "lane2_time", "lane3_time", "lane4_time", "lane5_time", "lane6_time",
    "is_finished",
  ];
  const update: Record<string, unknown> = {};
  for (const k of allowed) {
    if (k in fields) update[k] = fields[k] === "" ? null : fields[k];
  }
  update.updated_at = new Date().toISOString();

  const { error } = await supabaseAdmin().from("heats").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
