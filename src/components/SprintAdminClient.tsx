"use client";
import { useState } from "react";
import type { Heat } from "@/lib/types";

type DraftHeat = Heat & { _dirty?: boolean; _saving?: boolean; _saved?: boolean };

function getTopTeams(heat: DraftHeat, n: number): (string | null)[] {
  const lanes = ([1, 2, 3, 4, 5, 6] as const).map((i) => ({
    team: heat[`lane${i}_team` as keyof Heat] as string | null,
    time: heat[`lane${i}_time` as keyof Heat] as number | null,
  }));
  return lanes
    .filter((l) => l.team && l.time != null)
    .sort((a, b) => a.time! - b.time!)
    .slice(0, n)
    .map((l) => l.team!);
}

export function SprintAdminClient({ initialHeats }: { initialHeats: Heat[] }) {
  const [heats, setHeats] = useState<DraftHeat[]>(initialHeats);
  const [filling, setFilling] = useState(false);
  const [fillMsg, setFillMsg] = useState<string | null>(null);

  function updateField(id: number, field: keyof Heat, value: string | boolean) {
    setHeats((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, [field]: value, _dirty: true, _saved: false } : h
      )
    );
  }

  async function save(id: number) {
    const heat = heats.find((h) => h.id === id);
    if (!heat) return;
    setHeats((p) => p.map((h) => (h.id === id ? { ...h, _saving: true } : h)));

    const payload = {
      id,
      lane1_team: heat.lane1_team ?? null,
      lane2_team: heat.lane2_team ?? null,
      lane3_team: heat.lane3_team ?? null,
      lane4_team: heat.lane4_team ?? null,
      lane5_team: heat.lane5_team ?? null,
      lane6_team: heat.lane6_team ?? null,
      lane1_time: toNum(heat.lane1_time),
      lane2_time: toNum(heat.lane2_time),
      lane3_time: toNum(heat.lane3_time),
      lane4_time: toNum(heat.lane4_time),
      lane5_time: toNum(heat.lane5_time),
      lane6_time: toNum(heat.lane6_time),
      is_finished: heat.is_finished,
    };
    const res = await fetch("/api/sprint", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const ok = res.ok;
    setHeats((p) =>
      p.map((h) =>
        h.id === id ? { ...h, _saving: false, _dirty: !ok, _saved: ok } : h
      )
    );
  }

  async function patchTeams(heatId: number, teams: (string | null)[]) {
    const payload: Record<string, unknown> = { id: heatId };
    [1, 2, 3, 4, 5, 6].forEach((n, i) => {
      payload[`lane${n}_team`] = teams[i] ?? null;
    });
    const res = await fetch("/api/sprint", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setHeats((prev) =>
        prev.map((h) => {
          if (h.id !== heatId) return h;
          return {
            ...h,
            lane1_team: teams[0] ?? null,
            lane2_team: teams[1] ?? null,
            lane3_team: teams[2] ?? null,
            lane4_team: teams[3] ?? null,
            lane5_team: teams[4] ?? null,
            lane6_team: teams[5] ?? null,
          };
        })
      );
    }
    return res.ok;
  }

  async function autoFillSF() {
    const qualifying = heats.filter((h) => h.heat_order <= 5);
    const missing = qualifying.filter((h) => !h.is_finished).map((h) => h.heat_label);
    if (missing.length > 0) {
      setFillMsg(`ยังไม่ได้มาร์ก Finished: ${missing.join(", ")}`);
      return;
    }

    const tops = qualifying.map((h) => getTopTeams(h, 2));
    // tops[sายIndex] = [อันดับ1, อันดับ2]
    // SF1: 1A, 2B, 1C, 2D, 1E
    const sf1 = [tops[0][0], tops[1][1], tops[2][0], tops[3][1], tops[4][0]];
    // SF2: 2A, 1B, 2C, 1D, 2E
    const sf2 = [tops[0][1], tops[1][0], tops[2][1], tops[3][0], tops[4][1]];

    setFilling(true);
    setFillMsg(null);
    const ok1 = await patchTeams(6, sf1);
    const ok2 = await patchTeams(7, sf2);
    setFilling(false);
    setFillMsg(ok1 && ok2 ? "✓ ใส่ Semi Finals เรียบร้อย" : "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
  }

  async function autoFillFinal() {
    const sf1 = heats.find((h) => h.heat_order === 6)!;
    const sf2 = heats.find((h) => h.heat_order === 7)!;
    if (!sf1.is_finished || !sf2.is_finished) {
      setFillMsg("ยังไม่ได้มาร์ก Finished: Semi Finals ยังไม่ครบ");
      return;
    }

    const tops1 = getTopTeams(sf1, 2);
    const tops2 = getTopTeams(sf2, 2);
    // Final: 1SF1, 2SF2, 1SF2, 2SF1
    const finalTeams = [tops1[0], tops2[1], tops2[0], tops1[1]];

    setFilling(true);
    setFillMsg(null);
    const ok = await patchTeams(8, finalTeams);
    setFilling(false);
    setFillMsg(ok ? "✓ ใส่ Final เรียบร้อย" : "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
  }

  const qualifyingDone = heats
    .filter((h) => h.heat_order <= 5)
    .every((h) => h.is_finished);
  const sfDone = heats
    .filter((h) => h.heat_order === 6 || h.heat_order === 7)
    .every((h) => h.is_finished);

  return (
    <div className="mt-6 space-y-4">
      {/* Auto-fill panel */}
      {(qualifyingDone || sfDone) && (
        <div className="rounded-xl border border-teal-400/20 bg-teal-400/5 p-4">
          <div className="font-mono text-[10px] tracking-[0.2em] text-teal-400">
            // AUTO_FILL
          </div>
          <p className="mt-1 text-xs text-white/50">
            เรียงตามเวลาแล้วใส่ชื่อทีมให้อัตโนมัติ · แก้ได้ภายหลัง
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {qualifyingDone && (
              <button
                onClick={autoFillSF}
                disabled={filling}
                className="rounded-md bg-teal-400 px-4 py-2 font-mono text-sm font-bold text-navy-950 transition hover:bg-teal-500 disabled:opacity-40"
              >
                {filling ? "กำลังใส่..." : "→ Auto-fill Semi Finals"}
              </button>
            )}
            {sfDone && (
              <button
                onClick={autoFillFinal}
                disabled={filling}
                className="rounded-md border border-gold-400/50 bg-gold-400/10 px-4 py-2 font-mono text-sm font-bold text-gold-400 transition hover:bg-gold-400/20 disabled:opacity-40"
              >
                {filling ? "กำลังใส่..." : "→ Auto-fill Final"}
              </button>
            )}
          </div>
          {fillMsg && (
            <p className={`mt-2 font-mono text-xs ${fillMsg.startsWith("✓") ? "text-teal-400" : "text-red-300"}`}>
              {fillMsg}
            </p>
          )}
        </div>
      )}

      {heats.map((h) => (
        <HeatEditor key={h.id} heat={h} onChange={updateField} onSave={save} />
      ))}
    </div>
  );
}

function HeatEditor({
  heat,
  onChange,
  onSave,
}: {
  heat: DraftHeat;
  onChange: (id: number, field: keyof Heat, value: string | boolean) => void;
  onSave: (id: number) => void;
}) {
  const isFinal = heat.heat_label === "Final";
  const isLater = heat.heat_order >= 6;

  return (
    <div
      className={`rounded-xl border bg-navy-900/60 p-5 ${
        isFinal ? "border-gold-400/40" : "border-white/5"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] tracking-[0.2em] text-white/40">
            HEAT_{String(heat.heat_order).padStart(2, "0")} · {heat.round_name}
          </span>
          <div className={`font-mono text-lg font-bold ${isFinal ? "text-gold-400" : "text-white"}`}>
            {heat.heat_label}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 font-mono text-xs text-white/60">
            <input
              type="checkbox"
              className="h-4 w-4 accent-teal-400"
              checked={heat.is_finished}
              onChange={(e) => onChange(heat.id, "is_finished", e.target.checked)}
            />
            FINISHED
          </label>
          <button
            onClick={() => onSave(heat.id)}
            disabled={heat._saving || (!heat._dirty && !heat._saved)}
            className={`rounded-md px-3 py-1.5 font-mono text-xs font-bold transition ${
              heat._dirty
                ? "bg-teal-400 text-navy-950 hover:bg-teal-500"
                : heat._saved
                  ? "bg-teal-400/20 text-teal-400"
                  : "bg-white/5 text-white/30"
            } disabled:cursor-not-allowed`}
          >
            {heat._saving ? "saving..." : heat._saved && !heat._dirty ? "✓ saved" : "save"}
          </button>
        </div>
      </div>

      <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((n) => {
          const teamField = `lane${n}_team` as keyof Heat;
          const timeField = `lane${n}_time` as keyof Heat;
          return (
            <div key={n} className="rounded-md border border-white/5 bg-navy-950/40 p-2.5">
              <div className="mb-1.5">
                <span className="font-mono text-[10px] tracking-widest text-white/40">LANE_{n}</span>
              </div>
              <input
                className="field"
                placeholder={isLater ? "เช่น 46-01" : "—"}
                value={(heat[teamField] as string | null) ?? ""}
                onChange={(e) => onChange(heat.id, teamField, e.target.value)}
                readOnly={!isLater}
                style={!isLater ? { opacity: 0.8 } : undefined}
              />
              <input
                className="field mt-1.5"
                type="number"
                step="0.001"
                placeholder="--.---"
                value={(heat[timeField] as number | null) ?? ""}
                onChange={(e) => onChange(heat.id, timeField, e.target.value)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function toNum(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}
