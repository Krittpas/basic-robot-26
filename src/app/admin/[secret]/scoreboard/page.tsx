import { supabase } from "@/lib/supabase";
import { ScoreboardAdminClient } from "@/components/ScoreboardAdminClient";
import type { Group } from "@/lib/types";

export const revalidate = 0;

export default async function AdminScoreboardPage() {
  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .order("id", { ascending: true });

  return (
    <div>
      <div className="font-mono text-[11px] tracking-[0.3em] text-teal-400">
        // EDIT · SCOREBOARD
      </div>
      <h1 className="mt-2 text-3xl font-bold">ให้คะแนน 16 กลุ่ม</h1>
      <p className="mt-1 text-sm text-white/55">
        +/- คะแนนทันที หรือกดที่เลขคะแนนเพื่อกำหนดค่าเอง
      </p>
      <ScoreboardAdminClient initialGroups={(groups ?? []) as Group[]} />
    </div>
  );
}
