"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Group } from "@/lib/types";

function sorted(groups: Group[]) {
  return [...groups].sort((a, b) => b.score - a.score || a.id - b.id);
}

export function ScoreboardLive({ initialGroups }: { initialGroups: Group[] }) {
  const [groups, setGroups] = useState<Group[]>(sorted(initialGroups));
  const [flash, setFlash] = useState<number | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel("groups-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "groups" },
        (payload) => {
          const updated = payload.new as Group;
          setGroups((prev) => sorted(prev.map((g) => (g.id === updated.id ? updated : g))));
          setFlash(updated.id);
          setTimeout(() => setFlash(null), 1000);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const max = Math.max(groups[0]?.score ?? 1, 1);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((g, idx) => (
        <div
          key={g.id}
          className={`relative overflow-hidden rounded-xl border bg-navy-900/60 p-4 transition-all duration-500 ${
            flash === g.id
              ? "border-teal-400/70 shadow-glow"
              : idx === 0
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
                {["อันดับ 1", "อันดับ 2", "อันดับ 3"][idx]}
              </span>
            )}
          </div>
          <div className="mt-1 text-base font-semibold text-white">{g.name}</div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span
              className={`font-mono text-3xl font-bold tabular-nums transition-all duration-300 ${
                flash === g.id ? "scale-110 text-white" : idx === 0 ? "text-gold-400" : "text-teal-400"
              }`}
            >
              {g.score}
            </span>
            <span className="font-mono text-xs text-white/40">คะแนน</span>
          </div>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className={`h-full transition-all duration-500 ${idx === 0 ? "bg-gold-400" : "bg-teal-400"}`}
              style={{ width: `${Math.max(2, (g.score / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
