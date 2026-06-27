"use client";
import { useState } from "react";
import type { Group } from "@/lib/types";

const PRESETS = [1, 5, 10];

export function ScoreboardAdminClient({ initialGroups }: { initialGroups: Group[] }) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [busy, setBusy] = useState<Record<number, boolean>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  async function adjust(id: number, delta: number) {
    setBusy((b) => ({ ...b, [id]: true }));
    const res = await fetch("/api/scoreboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, delta }),
    });
    if (res.ok) {
      const data = await res.json();
      setGroups((gs) => gs.map((g) => (g.id === id ? { ...g, score: data.score } : g)));
    }
    setBusy((b) => ({ ...b, [id]: false }));
  }

  async function setAbsolute(id: number, value: number) {
    setBusy((b) => ({ ...b, [id]: true }));
    const res = await fetch("/api/scoreboard", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, score: value }),
    });
    if (res.ok) {
      setGroups((gs) => gs.map((g) => (g.id === id ? { ...g, score: value } : g)));
    }
    setBusy((b) => ({ ...b, [id]: false }));
    setEditingId(null);
  }

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((g) => (
        <div key={g.id} className="rounded-xl border border-white/5 bg-navy-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-[0.2em] text-white/40">
              GROUP_{String(g.id).padStart(2, "0")}
            </span>
          </div>
          <div className="mt-0.5 text-base font-semibold">{g.name}</div>

          {editingId === g.id ? (
            <div className="mt-3 flex items-center gap-2">
              <input
                className="field"
                type="number"
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setAbsolute(g.id, Number(editValue) || 0);
                  if (e.key === "Escape") setEditingId(null);
                }}
              />
              <button
                onClick={() => setAbsolute(g.id, Number(editValue) || 0)}
                className="rounded-md bg-teal-400 px-2.5 py-1.5 font-mono text-[11px] font-bold text-navy-950"
              >
                ตั้งค่า
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditingId(g.id);
                setEditValue(String(g.score));
              }}
              className="mt-3 block font-mono text-3xl font-bold text-teal-400 tabular-nums transition hover:text-teal-500"
              title="กดเพื่อกำหนดค่าเอง"
            >
              {g.score}
              <span className="ml-1 font-mono text-xs text-white/40">pts</span>
            </button>
          )}

          {/* +/- buttons */}
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {PRESETS.map((n) => (
              <button
                key={`m${n}`}
                onClick={() => adjust(g.id, -n)}
                disabled={busy[g.id]}
                className="rounded-md border border-white/10 bg-navy-950/40 px-2 py-1.5 font-mono text-xs text-red-300 transition hover:border-red-400/40 hover:bg-red-400/10 disabled:opacity-40"
              >
                −{n}
              </button>
            ))}
            {PRESETS.map((n) => (
              <button
                key={`p${n}`}
                onClick={() => adjust(g.id, n)}
                disabled={busy[g.id]}
                className="rounded-md border border-teal-400/20 bg-teal-400/5 px-2 py-1.5 font-mono text-xs text-teal-400 transition hover:border-teal-400/50 hover:bg-teal-400/10 disabled:opacity-40"
              >
                +{n}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
