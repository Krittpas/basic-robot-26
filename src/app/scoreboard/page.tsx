import { supabase } from "@/lib/supabase";

export const revalidate = 0;

export default async function ScoreboardPage() {
  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .order("score", { ascending: false })
    .order("id", { ascending: true });

  const top = groups?.[0]?.score ?? 0;
  const max = Math.max(top, 1);

  return (
    <div>
      <header className="mb-6 flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <div className="font-mono text-[11px] tracking-[0.3em] text-teal-400">
            // EVENT_03 · SCOREBOARD
          </div>
          <h1 className="mt-1 text-3xl font-bold">ตารางคะแนน 13 กลุ่ม</h1>
          <p className="mt-1 text-sm text-white/55">13 กลุ่ม · เรียงจากคะแนนสูงสุด · อัปเดตเรียลไทม์</p>
        </div>
        <div className="text-right font-mono text-xs text-white/40">
          13_GROUPS / LIVE
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {groups?.map((g, idx) => (
          <div
            key={g.id}
            className={`relative overflow-hidden rounded-xl border bg-navy-900/60 p-4 ${
              idx === 0
                ? "border-gold-400/50 shadow-[0_0_24px_-8px_rgba(243,156,18,0.4)]"
                : idx === 1
                  ? "border-teal-400/30"
                  : "border-white/5"
            }`}
          >
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] tracking-[0.2em] text-white/40">
                RANK_{String(idx + 1).padStart(2, "0")}
              </span>
              {idx < 3 && (
                <span
                  className={`font-mono text-[10px] ${
                    idx === 0 ? "text-gold-400" : idx === 1 ? "text-teal-400" : "text-white/55"
                  }`}
                >
                  {["GOLD", "SILVER", "BRONZE"][idx]}
                </span>
              )}
            </div>
            <div className="mt-1 text-base font-semibold text-white">{g.name}</div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span
                className={`font-mono text-3xl font-bold tabular-nums ${
                  idx === 0 ? "text-gold-400" : "text-teal-400"
                }`}
              >
                {g.score}
              </span>
              <span className="font-mono text-xs text-white/40">pts</span>
            </div>
            {/* แถบสัดส่วน */}
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full ${idx === 0 ? "bg-gold-400" : "bg-teal-400"}`}
                style={{ width: `${Math.max(2, (g.score / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
