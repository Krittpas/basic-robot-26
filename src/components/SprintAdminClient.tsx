"use client";
import { useState } from "react";
import type { Heat } from "@/lib/types";

type DraftHeat = Heat & { _dirty?: boolean; _saving?: boolean; _saved?: boolean };

export function SprintAdminClient({ initialHeats }: { initialHeats: Heat[] }) {
  const [heats, setHeats] = useState<DraftHeat[]>(initialHeats);

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
        h.id === id
          ? { ...h, _saving: false, _dirty: !ok, _saved: ok }
          : h
      )
    );
  }

  return (
    <div className="mt-6 space-y-4">
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
              <div className="mb-1.5 flex items-center justify-between">
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
