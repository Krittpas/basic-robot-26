import { supabase } from "@/lib/supabase";
import { ScoreboardLive } from "@/components/ScoreboardLive";

export const revalidate = 0;

export default async function ScoreboardPage() {
  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .order("score", { ascending: false })
    .order("id", { ascending: true });

  return (
    <div>
      <header className="mb-6 flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <div className="font-mono text-[11px] tracking-[0.3em] text-teal-400">
            // EVENT_03 · SCOREBOARD
          </div>
          <h1 className="mt-1 text-3xl font-bold">ตารางคะแนน 13 กลุ่ม</h1>
          <p className="mt-1 text-sm text-white/55">13 กลุ่ม · เรียงจากคะแนนสูงสุด · อัปเดตแบบเรียลไทม์</p>
        </div>
        <div className="text-right font-mono text-xs text-white/40">
          13_GROUPS / LIVE
        </div>
      </header>

      <ScoreboardLive initialGroups={groups ?? []} />
    </div>
  );
}
