import { supabase } from "@/lib/supabase";
import { StatusBadge } from "@/components/StatusBadge";
import type { Heat } from "@/lib/types";

export const revalidate = 0;

export default async function SprintPage() {
  const { data: heats } = await supabase
    .from("heats")
    .select("*")
    .order("heat_order");

  return (
    <div>
      <header className="mb-6 flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <div className="font-mono text-[11px] tracking-[0.3em] text-teal-400">
            // EVENT_01 · SPRINT
          </div>
          <h1 className="mt-1 text-3xl font-bold">การแข่งขันวิ่งเร็ว</h1>
          <p className="mt-1 text-sm text-white/55">
            26 ทีม · 6 เลน · แบ่งกลุ่ม + จับเวลา
          </p>
        </div>
        <div className="text-right font-mono text-xs text-white/40">
          26_TEAMS / 8_HEATS
        </div>
      </header>

      <div className="space-y-6">
        {groupHeatsByRound(heats ?? []).map((section) => (
          <section key={section.round}>
            <div className="mb-3 flex items-center gap-3 font-mono text-xs text-white/45">
              <span className="tracking-[0.2em]">{section.round.toUpperCase()}</span>
              <span className="h-px flex-1 bg-white/5" />
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {section.heats.map((h) => (
                <HeatCard key={h.id} heat={h} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function HeatCard({ heat }: { heat: Heat }) {
  const lanes = [
    { team: heat.lane1_team, time: heat.lane1_time, n: 1 },
    { team: heat.lane2_team, time: heat.lane2_time, n: 2 },
    { team: heat.lane3_team, time: heat.lane3_time, n: 3 },
    { team: heat.lane4_team, time: heat.lane4_time, n: 4 },
    { team: heat.lane5_team, time: heat.lane5_time, n: 5 },
    { team: heat.lane6_team, time: heat.lane6_time, n: 6 },
  ];

  // จัดอันดับเฉพาะเลนที่มีทีม + มีเวลา
  const ranked = [...lanes]
    .filter((l) => l.team && l.time != null)
    .sort((a, b) => (a.time! - b.time!))
    .map((l, i) => ({ ...l, rank: i + 1 }));
  const rankByLane = new Map(ranked.map((r) => [r.n, r.rank]));

  const status = heat.is_finished ? "done" : ranked.length > 0 ? "live" : "pending";
  const isFinal = heat.heat_label === "Final";

  return (
    <div
      className={`rounded-xl border bg-navy-900/60 p-4 ${
        isFinal ? "border-gold-400/50 shadow-[0_0_24px_-8px_rgba(243,156,18,0.4)]" : "border-white/5"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] tracking-[0.2em] text-white/35">
            HEAT_{String(heat.heat_order).padStart(2, "0")}
          </div>
          <div className={`mt-0.5 font-mono text-lg font-bold ${isFinal ? "text-gold-400" : "text-white"}`}>
            {heat.heat_label}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-3 space-y-1.5">
        {lanes.map((l) => {
          const rank = rankByLane.get(l.n);
          return (
            <div
              key={l.n}
              className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 ${
                !l.team
                  ? "border-dashed border-white/5 bg-transparent opacity-40"
                  : rank === 1
                    ? "border-teal-400/40 bg-teal-400/5"
                    : "border-white/5 bg-navy-950/40"
              }`}
            >
              <span className="w-4 text-center font-mono text-[10px] text-white/35">L{l.n}</span>
              <span className="flex-1 font-mono text-sm">{l.team ?? "—"}</span>
              {rank && (
                <span className={`font-mono text-[10px] ${rank === 1 ? "text-teal-400" : "text-white/40"}`}>
                  #{rank}
                </span>
              )}
              <span className="w-16 text-right font-mono text-sm tabular-nums">
                {l.time != null ? l.time.toFixed(3) : <span className="text-white/25">--.---</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function groupHeatsByRound(heats: Heat[]) {
  const order = ["แบ่งกลุ่ม", "รอบรองชนะเลิศ", "รอบชิงชนะเลิศ"];
  const grouped: Record<string, Heat[]> = {};
  for (const h of heats) {
    grouped[h.round_name] = grouped[h.round_name] ?? [];
    grouped[h.round_name].push(h);
  }
  return order
    .filter((r) => grouped[r])
    .map((r) => ({ round: r, heats: grouped[r] }));
}
