import { supabase } from "@/lib/supabase";
import { StatusBadge } from "@/components/StatusBadge";
import type { PingPong } from "@/lib/types";

export const revalidate = 0;

export default async function MissionPage() {
  const { data: state } = await supabase
    .from("mission_state")
    .select("*")
    .eq("id", 1)
    .single();

  const locked = state?.is_locked ?? true;

  if (locked) {
    return (
      <div>
        <header className="mb-8 flex items-end justify-between border-b border-white/5 pb-4">
          <div>
            <div className="font-mono text-[11px] tracking-[0.3em] text-teal-400">
              // EVENT_02 · MISSION
            </div>
            <h1 className="mt-1 text-3xl font-bold">การแข่งขันภารกิจ</h1>
          </div>
          <StatusBadge status="locked" />
        </header>
        <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 bg-navy-900/40 px-6 py-20 text-center">
          <div className="font-mono text-[10px] tracking-[0.3em] text-white/30">// ACCESS_DENIED</div>
          <div className="mt-4 grid h-16 w-16 place-items-center rounded-full border border-white/15">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-white/60">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 1 1 8 0v3" />
            </svg>
          </div>
          <h2 className="mt-6 text-xl font-semibold text-white">เนื้อหายังถูกล็อค</h2>
          <p className="mt-2 max-w-md text-sm text-white/55">
            {state?.message ?? "ภารกิจจะเปิดให้เข้าถึงในวันแข่งขัน"}
          </p>
        </div>
      </div>
    );
  }

  const { data: raw } = await supabase.from("ping_pong").select("*").order("id");
  const groups: PingPong[] = raw ?? [];

  const ranked = [...groups].sort((a, b) => {
    if (a.qualifying_score === null && b.qualifying_score === null) return a.id - b.id;
    if (a.qualifying_score === null) return 1;
    if (b.qualifying_score === null) return -1;
    return b.qualifying_score - a.qualifying_score;
  });

  const scored = ranked.filter((g) => g.qualifying_score !== null);
  const hasTie = scored.length >= 5 && scored[3].qualifying_score === scored[4].qualifying_score;
  const top4 = scored.slice(0, 4);
  const showBracket = top4.length === 4 && !hasTie;

  // SF pairings
  const sf1 = showBracket ? [top4[0], top4[2]] : [];
  const sf2 = showBracket ? [top4[1], top4[3]] : [];
  const sf1Winner = sf1.find((g) => g.sf_won === true);
  const sf1Loser = sf1.find((g) => g.sf_won === false);
  const sf2Winner = sf2.find((g) => g.sf_won === true);
  const sf2Loser = sf2.find((g) => g.sf_won === false);
  const showFinalBracket = sf1Winner && sf2Winner && sf1Loser && sf2Loser;

  const finalists = groups
    .filter((g) => g.final_rank !== null)
    .sort((a, b) => a.final_rank! - b.final_rank!);

  const MEDALS = ["🥇", "🥈", "🥉", "4️⃣"];
  const RANK_LABELS = ["อันดับ 1", "อันดับ 2", "อันดับ 3", "อันดับ 4"];

  return (
    <div>
      <header className="mb-6 flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <div className="font-mono text-[11px] tracking-[0.3em] text-teal-400">
            // EVENT_02 · MISSION
          </div>
          <h1 className="mt-1 text-3xl font-bold">ภารกิจเก็บลูกปิงปอง</h1>
          <p className="mt-1 text-sm text-white/55">
            25 กลุ่ม · 2 สนาม · 2 นาที · คะแนนจากจำนวนลูกที่เก็บได้
          </p>
        </div>
        <div className="text-right font-mono text-xs text-white/40">25_TEAMS / LIVE</div>
      </header>

      {/* ผลรอบชิงชนะเลิศ */}
      {finalists.length > 0 && (
        <div className="mb-6 rounded-xl border border-gold-400/40 bg-gold-400/5 p-5 shadow-[0_0_32px_-8px_rgba(243,156,18,0.3)]">
          <div className="font-mono text-[10px] tracking-[0.3em] text-gold-400">// MISSION · FINAL RESULTS</div>
          <h2 className="mt-1 text-lg font-bold text-gold-400">ผลการแข่งรอบชิงชนะเลิศ</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {finalists.map((g) => {
              const i = g.final_rank! - 1;
              const isFirst = g.final_rank === 1;
              return (
                <div
                  key={g.id}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                    isFirst ? "border-gold-400/50 bg-gold-400/10" : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="text-3xl">{MEDALS[i] ?? "—"}</div>
                  <div>
                    <div className={`font-mono text-[10px] tracking-widest ${isFirst ? "text-gold-400" : "text-white/40"}`}>
                      {RANK_LABELS[i] ?? `อันดับ ${g.final_rank}`}
                    </div>
                    <div className="mt-0.5 text-base font-bold text-white">{g.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bracket: รอบรอง + รอบชิง */}
      {showBracket && (
        <div className="mb-6 space-y-4">
          {/* รอบรองชนะเลิศ */}
          <div className="rounded-xl border border-white/10 bg-navy-900/60 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="font-mono text-[10px] tracking-[0.3em] text-teal-400">// รอบรองชนะเลิศ · 2 สนาม</div>
              <span className="h-px flex-1 bg-white/5" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "สนาม 1", pair: sf1, rankLabels: ["อันดับ 1", "อันดับ 3"] },
                { label: "สนาม 2", pair: sf2, rankLabels: ["อันดับ 2", "อันดับ 4"] },
              ].map(({ label, pair, rankLabels }) => {
                const winner = pair.find((g) => g.sf_won === true);
                return (
                  <div key={label}>
                    <div className="mb-2 font-mono text-[10px] tracking-widest text-teal-400">{label}</div>
                    <div className="space-y-1.5">
                      {pair.map((g, ti) => {
                        const isWinner = g.sf_won === true;
                        const isLoser = g.sf_won === false;
                        return (
                          <div
                            key={g.id}
                            className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all ${
                              isWinner
                                ? "border-teal-400/50 bg-teal-400/10"
                                : isLoser
                                  ? "border-white/5 opacity-40"
                                  : "border-white/5 bg-navy-950/40"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-mono text-[10px] text-white/35">{rankLabels[ti]}</div>
                              <div className="font-mono text-sm font-bold text-white">{g.name}</div>
                              <div className="font-mono text-[10px] text-white/40">{g.qualifying_score} ลูก</div>
                            </div>
                            {isWinner && (
                              <span className="rounded-full bg-teal-400/20 px-2 py-0.5 font-mono text-[10px] text-teal-400">
                                ✓ ผ่าน
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {winner && (
                      <div className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-teal-400">
                        <span>→</span>
                        <span className="font-bold">{winner.name}</span>
                        <span className="text-white/30">เข้ารอบชิง</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* รอบชิง */}
          {showFinalBracket && (
            <div className="rounded-xl border border-gold-400/20 bg-navy-900/60 p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="font-mono text-[10px] tracking-[0.3em] text-gold-400">// รอบชิงชนะเลิศ</div>
                <span className="h-px flex-1 bg-white/5" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "ชิงอันดับ 1-2", a: sf1Winner!, b: sf2Winner!, gold: true },
                  { label: "ชิงอันดับ 3-4", a: sf1Loser!, b: sf2Loser!, gold: false },
                ].map(({ label, a, b, gold }) => (
                  <div key={label}>
                    <div className={`mb-2 font-mono text-[10px] tracking-widest ${gold ? "text-gold-400" : "text-white/40"}`}>
                      {label}
                    </div>
                    <div className="flex items-center gap-3">
                      {[a, b].map((g, ti) => {
                        const fr = g.final_rank;
                        const isChamp = fr === 1;
                        return (
                          <div key={g.id} className="flex-1 text-center">
                            <div
                              className={`rounded-lg border px-3 py-2.5 ${
                                isChamp
                                  ? "border-gold-400/50 bg-gold-400/10"
                                  : fr
                                    ? "border-white/10 bg-white/5"
                                    : gold
                                      ? "border-gold-400/20 bg-gold-400/5"
                                      : "border-white/5 bg-navy-950/40"
                              }`}
                            >
                              <div className="font-mono text-sm font-bold text-white">{g.name}</div>
                              {fr && (
                                <div className={`mt-1 font-mono text-xs ${isChamp ? "text-gold-400" : "text-white/40"}`}>
                                  {RANK_LABELS[fr - 1]}
                                </div>
                              )}
                            </div>
                            {ti === 0 && (
                              <div className="my-1 font-mono text-xs text-white/20">VS</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ผลรอบคัดเลือก */}
      <section>
        <div className="mb-3 flex items-center gap-3 font-mono text-xs text-white/45">
          <span className="tracking-[0.2em]">ผลรอบคัดเลือก</span>
          <span className="h-px flex-1 bg-white/5" />
          {scored.length > 0 && <span>{scored.length}/{groups.length} กลุ่ม</span>}
        </div>

        {scored.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-navy-900/40 px-6 py-12 text-center">
            <p className="font-mono text-sm text-white/40">รอผลการแข่งรอบคัดเลือก…</p>
          </div>
        ) : (
          <>
            {hasTie && (
              <div className="mb-3 rounded-xl border border-gold-400/30 bg-gold-400/5 px-4 py-2.5 font-mono text-xs text-gold-400">
                ⚠ มีคะแนนเท่ากันที่อันดับ 4 — รอผลแข่งเพิ่ม 30 วินาที
              </div>
            )}
            <div className="overflow-hidden rounded-xl border border-white/5 bg-navy-900/60">
              <div className="grid grid-cols-[3rem_1fr_5rem] gap-3 border-b border-white/5 px-4 py-2 font-mono text-[10px] tracking-widest text-white/30">
                <span>อันดับ</span>
                <span>กลุ่ม</span>
                <span className="text-right">ลูกปิงปอง</span>
              </div>
              {ranked.map((g, idx) => {
                const isTopFour = g.qualifying_score !== null && idx < 4;
                return (
                  <div
                    key={g.id}
                    className={`grid grid-cols-[3rem_1fr_5rem] items-center gap-3 border-b border-white/5 px-4 py-2.5 last:border-0 ${
                      isTopFour ? "bg-teal-400/5" : ""
                    }`}
                  >
                    <span className={`font-mono text-sm font-bold ${isTopFour ? "text-teal-400" : "text-white/25"}`}>
                      {g.qualifying_score !== null ? `#${idx + 1}` : "—"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-sm ${isTopFour ? "text-white" : "text-white/60"}`}>
                        {g.name}
                      </span>
                      {isTopFour && (
                        <span className="rounded-full bg-teal-400/15 px-2 py-0.5 font-mono text-[10px] text-teal-400">
                          เข้ารอบ
                        </span>
                      )}
                    </div>
                    <span className={`text-right font-mono text-sm tabular-nums ${isTopFour ? "font-bold text-white" : "text-white/50"}`}>
                      {g.qualifying_score !== null ? g.qualifying_score : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* รูปแบบการแข่ง */}
      <div className="mt-8 rounded-xl border border-white/5 bg-navy-900/60 p-5">
        <div className="font-mono text-[10px] tracking-[0.3em] text-white/30">// รูปแบบการแข่งขัน</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            { step: "01", title: "รอบคัดเลือก", desc: "25 กลุ่ม แข่งเป็นคู่ 2 สนาม พร้อมกัน ใช้เวลา 2 นาที นับลูกปิงปองที่เก็บได้" },
            { step: "02", title: "คัดเลือก 4 ทีม", desc: "จัดอันดับจากคะแนนสูงสุด หากเท่ากันแข่งเพิ่ม 30 วินาที ใครเก็บได้ก่อนผ่าน" },
            { step: "03", title: "รอบชิงชนะเลิศ", desc: "อันดับ 1 เจออันดับ 3 · อันดับ 2 เจออันดับ 4 · ผู้ชนะทั้งสองชิงแชมป์" },
          ].map((item) => (
            <div key={item.step} className="rounded-lg bg-white/3 p-3">
              <div className="font-mono text-[10px] text-teal-400">ROUND_{item.step}</div>
              <div className="mt-1 text-sm font-semibold text-white">{item.title}</div>
              <div className="mt-1 text-xs text-white/50">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
