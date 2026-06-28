"use client";
import { useState } from "react";
import type { PingPong } from "@/lib/types";

type Draft = PingPong & { _dirty?: boolean; _saving?: boolean; _saved?: boolean };

export function MissionAdminClient({ initialGroups }: { initialGroups: PingPong[] }) {
  const [groups, setGroups] = useState<Draft[]>(initialGroups);

  function update(id: number, field: "qualifying_score" | "final_rank", value: string) {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, [field]: value === "" ? null : Number(value), _dirty: true, _saved: false }
          : g
      )
    );
  }

  async function save(id: number) {
    const g = groups.find((g) => g.id === id);
    if (!g) return;
    setGroups((p) => p.map((x) => (x.id === id ? { ...x, _saving: true } : x)));
    const res = await fetch("/api/mission", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, qualifying_score: g.qualifying_score, final_rank: g.final_rank }),
    });
    const ok = res.ok;
    setGroups((p) =>
      p.map((x) => (x.id === id ? { ...x, _saving: false, _dirty: !ok, _saved: ok } : x))
    );
  }

  const sorted = [...groups].sort((a, b) => {
    if (b.qualifying_score === null && a.qualifying_score === null) return a.id - b.id;
    if (b.qualifying_score === null) return -1;
    if (a.qualifying_score === null) return 1;
    return b.qualifying_score - a.qualifying_score;
  });

  // Detect tie at rank 4/5
  const scored = sorted.filter((g) => g.qualifying_score !== null);
  const hasTie = scored.length >= 5 && scored[3].qualifying_score === scored[4].qualifying_score;

  return (
    <div className="mt-6 space-y-3">
      {hasTie && (
        <div className="rounded-xl border border-gold-400/40 bg-gold-400/5 px-4 py-3 font-mono text-xs text-gold-400">
          ⚠ มีคะแนนเท่ากันที่อันดับ 4 — ต้องจับแข่งเพิ่ม 30 วินาที แล้วบันทึกผลแก้ไขเอง
        </div>
      )}

      <div className="rounded-xl border border-white/5 bg-navy-900/60 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[2rem_1fr_9rem_7rem_6rem] gap-3 border-b border-white/5 px-4 py-2 font-mono text-[10px] tracking-widest text-white/30">
          <span>#</span>
          <span>กลุ่ม</span>
          <span>ลูกปิงปอง (รอบแรก)</span>
          <span>อันดับรอบชิง</span>
          <span></span>
        </div>

        {sorted.map((g, idx) => {
          const hasScore = g.qualifying_score !== null;
          const isTopFour = hasScore && idx < 4;
          return (
            <div
              key={g.id}
              className={`grid grid-cols-[2rem_1fr_9rem_7rem_6rem] items-center gap-3 border-b border-white/5 px-4 py-2.5 last:border-0 ${
                isTopFour ? "bg-teal-400/5" : ""
              }`}
            >
              <span
                className={`font-mono text-xs ${
                  isTopFour ? "font-bold text-teal-400" : "text-white/30"
                }`}
              >
                {hasScore ? idx + 1 : "—"}
              </span>
              <span className={`font-mono text-sm ${isTopFour ? "text-white" : "text-white/70"}`}>
                {g.name}
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  className="field w-20"
                  placeholder="0"
                  value={g.qualifying_score ?? ""}
                  onChange={(e) => update(g.id, "qualifying_score", e.target.value)}
                />
                <span className="font-mono text-[10px] text-white/30">ลูก</span>
              </div>
              <input
                type="number"
                min="1"
                max="4"
                className="field w-14"
                placeholder="—"
                value={g.final_rank ?? ""}
                onChange={(e) => update(g.id, "final_rank", e.target.value)}
              />
              <button
                onClick={() => save(g.id)}
                disabled={g._saving || (!g._dirty && !g._saved)}
                className={`rounded-md px-2.5 py-1.5 font-mono text-xs font-bold transition ${
                  g._dirty
                    ? "bg-teal-400 text-navy-950 hover:bg-teal-500"
                    : g._saved
                      ? "bg-teal-400/20 text-teal-400"
                      : "bg-white/5 text-white/30"
                } disabled:cursor-not-allowed`}
              >
                {g._saving ? "..." : g._saved && !g._dirty ? "✓" : "บันทึก"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
