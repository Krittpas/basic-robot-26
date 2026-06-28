"use client";
import { useState } from "react";
import type { PingPong } from "@/lib/types";

type Draft = PingPong & { _dirty?: boolean; _saving?: boolean; _saved?: boolean };

async function patchGroup(id: number, fields: Partial<PingPong>) {
  return fetch("/api/mission", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...fields }),
  });
}

export function MissionAdminClient({ initialGroups }: { initialGroups: PingPong[] }) {
  const [groups, setGroups] = useState<Draft[]>(initialGroups);
  const [sfBusy, setSfBusy] = useState(false);

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
    const res = await patchGroup(id, {
      qualifying_score: g.qualifying_score,
      final_rank: g.final_rank,
    });
    const ok = res.ok;
    setGroups((p) =>
      p.map((x) => (x.id === id ? { ...x, _saving: false, _dirty: !ok, _saved: ok } : x))
    );
  }

  async function markSFWinner(winnerId: number, loserId: number) {
    setSfBusy(true);
    await Promise.all([
      patchGroup(winnerId, { sf_won: true }),
      patchGroup(loserId, { sf_won: false }),
    ]);
    setGroups((p) =>
      p.map((g) => {
        if (g.id === winnerId) return { ...g, sf_won: true };
        if (g.id === loserId) return { ...g, sf_won: false };
        return g;
      })
    );
    setSfBusy(false);
  }

  async function resetSF(id1: number, id2: number) {
    setSfBusy(true);
    await Promise.all([
      patchGroup(id1, { sf_won: null }),
      patchGroup(id2, { sf_won: null }),
    ]);
    setGroups((p) =>
      p.map((g) =>
        g.id === id1 || g.id === id2 ? { ...g, sf_won: null } : g
      )
    );
    setSfBusy(false);
  }

  const sorted = [...groups].sort((a, b) => {
    if (a.qualifying_score === null && b.qualifying_score === null) return a.id - b.id;
    if (a.qualifying_score === null) return 1;
    if (b.qualifying_score === null) return -1;
    return b.qualifying_score - a.qualifying_score;
  });

  const scored = sorted.filter((g) => g.qualifying_score !== null);
  const hasTie =
    scored.length >= 5 && scored[3].qualifying_score === scored[4].qualifying_score;
  const top4 = scored.slice(0, 4);
  const showBracket = top4.length === 4 && !hasTie;

  // SF pairs: sf1 = top4[0] vs top4[2], sf2 = top4[1] vs top4[3]
  const sf1 = showBracket ? [top4[0], top4[2]] : [];
  const sf2 = showBracket ? [top4[1], top4[3]] : [];
  const sf1Done = sf1.some((g) => g.sf_won === true);
  const sf2Done = sf2.some((g) => g.sf_won === true);
  const sf1Winner = sf1.find((g) => g.sf_won === true);
  const sf1Loser = sf1.find((g) => g.sf_won === false);
  const sf2Winner = sf2.find((g) => g.sf_won === true);
  const sf2Loser = sf2.find((g) => g.sf_won === false);
  const showFinalBracket = sf1Winner && sf2Winner && sf1Loser && sf2Loser;

  return (
    <div className="mt-6 space-y-6">
      {/* ========== Bracket section ========== */}
      {showBracket && (
        <div className="rounded-xl border border-teal-400/20 bg-teal-400/5 p-5">
          <div className="font-mono text-[10px] tracking-[0.3em] text-teal-400">// BRACKET</div>
          <h2 className="mt-1 text-base font-bold text-white">ตารางแข่ง</h2>
          <p className="mt-0.5 text-xs text-white/40">
            auto-fill จากอันดับคัดเลือก · กดเลือกผู้ชนะหลังแข่ง
          </p>

          {hasTie && (
            <div className="mt-3 rounded-lg border border-gold-400/30 bg-gold-400/5 px-3 py-2 font-mono text-xs text-gold-400">
              ⚠ คะแนนเท่ากันที่อันดับ 4 — แก้ไขก่อนใช้ bracket
            </div>
          )}

          {/* รอบรองชนะเลิศ */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { label: "สนาม 1", pair: sf1, sfDone: sf1Done },
              { label: "สนาม 2", pair: sf2, sfDone: sf2Done },
            ].map(({ label, pair, sfDone }, si) => {
              const [a, b] = pair;
              const winner = pair.find((g) => g.sf_won === true);
              return (
                <div
                  key={label}
                  className={`rounded-xl border p-4 ${sfDone ? "border-teal-400/40" : "border-white/10"} bg-navy-950/40`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-widest text-teal-400">{label}</span>
                    {sfDone && (
                      <button
                        onClick={() => resetSF(a.id, b.id)}
                        disabled={sfBusy}
                        className="font-mono text-[10px] text-white/30 hover:text-red-300 transition"
                      >
                        รีเซ็ต
                      </button>
                    )}
                  </div>

                  {/* Team rows */}
                  {[a, b].map((g, ti) => {
                    const rankLabel = si === 0
                      ? (ti === 0 ? "อันดับ 1" : "อันดับ 3")
                      : (ti === 0 ? "อันดับ 2" : "อันดับ 4");
                    const isWinner = g.sf_won === true;
                    const isLoser = g.sf_won === false;
                    return (
                      <div
                        key={g.id}
                        className={`mb-2 flex items-center gap-3 rounded-lg border px-3 py-2 ${
                          isWinner
                            ? "border-teal-400/50 bg-teal-400/10"
                            : isLoser
                              ? "border-white/5 opacity-50"
                              : "border-white/5"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-[10px] text-white/35">{rankLabel}</div>
                          <div className="font-mono text-sm font-bold text-white truncate">{g.name}</div>
                          <div className="font-mono text-[10px] text-white/40">{g.qualifying_score} ลูก</div>
                        </div>
                        {isWinner && (
                          <span className="font-mono text-xs text-teal-400">✓ ชนะ</span>
                        )}
                        {!sfDone && (
                          <button
                            onClick={() => {
                              const opponent = pair.find((x) => x.id !== g.id)!;
                              markSFWinner(g.id, opponent.id);
                            }}
                            disabled={sfBusy}
                            className="rounded-md bg-teal-400/20 px-2.5 py-1 font-mono text-xs text-teal-400 hover:bg-teal-400/30 transition disabled:opacity-40"
                          >
                            ผู้ชนะ
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* รอบชิง */}
          {showFinalBracket && (
            <div className="mt-4 space-y-3">
              <div className="font-mono text-[10px] tracking-widest text-gold-400">รอบชิงชนะเลิศ</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {/* ชิงอันดับ 1-2 */}
                <div className="rounded-xl border border-gold-400/30 bg-gold-400/5 p-4">
                  <div className="mb-2 font-mono text-[10px] text-gold-400">ชิงอันดับ 1-2</div>
                  <div className="flex items-center gap-2">
                    <TeamFinalCard g={sf1Winner!} groups={groups} onSet={(rank) => patchGroupLocal(sf1Winner!.id, rank)} />
                    <span className="font-mono text-xs text-white/30">VS</span>
                    <TeamFinalCard g={sf2Winner!} groups={groups} onSet={(rank) => patchGroupLocal(sf2Winner!.id, rank)} />
                  </div>
                </div>
                {/* ชิงอันดับ 3-4 */}
                <div className="rounded-xl border border-white/10 bg-white/3 p-4">
                  <div className="mb-2 font-mono text-[10px] text-white/40">ชิงอันดับ 3-4</div>
                  <div className="flex items-center gap-2">
                    <TeamFinalCard g={sf1Loser!} groups={groups} onSet={(rank) => patchGroupLocal(sf1Loser!.id, rank)} />
                    <span className="font-mono text-xs text-white/30">VS</span>
                    <TeamFinalCard g={sf2Loser!} groups={groups} onSet={(rank) => patchGroupLocal(sf2Loser!.id, rank)} />
                  </div>
                </div>
              </div>
              <p className="font-mono text-[10px] text-white/30">
                กด [อันดับ] ของแต่ละทีมในรอบชิงเพื่อบันทึกผล
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========== Qualifying table ========== */}
      <div>
        <div className="mb-2 font-mono text-[10px] tracking-[0.3em] text-white/30">// รอบคัดเลือก · {scored.length}/{groups.length} กลุ่ม</div>

        {hasTie && (
          <div className="mb-3 rounded-xl border border-gold-400/30 bg-gold-400/5 px-4 py-2.5 font-mono text-xs text-gold-400">
            ⚠ คะแนนเท่ากันที่อันดับ 4 — ต้องแข่งเพิ่ม 30 วินาที แล้วแก้คะแนนเอง
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-white/5 bg-navy-900/60">
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
                <span className={`font-mono text-xs ${isTopFour ? "font-bold text-teal-400" : "text-white/30"}`}>
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
    </div>
  );

  // helper: patch local state for final_rank after clicking rank button
  function patchGroupLocal(id: number, rank: number) {
    // fire and forget — state already has it from bracket display
    patchGroup(id, { final_rank: rank }).then(() => {
      setGroups((p) =>
        p.map((g) => (g.id === id ? { ...g, final_rank: rank } : g))
      );
    });
  }
}

function TeamFinalCard({
  g,
  groups,
  onSet,
}: {
  g: PingPong;
  groups: Draft[];
  onSet: (rank: number) => void;
}) {
  const current = groups.find((x) => x.id === g.id);
  const rank = current?.final_rank ?? g.final_rank;
  return (
    <div className="flex-1 text-center">
      <div className="font-mono text-sm font-bold text-white">{g.name}</div>
      {rank ? (
        <div className="mt-1 font-mono text-xs text-gold-400">อันดับ {rank}</div>
      ) : (
        <div className="mt-1 flex justify-center gap-1">
          {[1, 2, 3, 4].map((r) => (
            <button
              key={r}
              onClick={() => onSet(r)}
              className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/50 hover:bg-teal-400/20 hover:text-teal-400 transition"
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
