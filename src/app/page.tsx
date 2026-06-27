import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { StatusBadge } from "@/components/StatusBadge";

export const revalidate = 0;

export default async function HomePage() {
  // ดึง snapshot สำหรับโชว์ที่ home
  const [{ data: heats }, { data: groups }, { data: mission }] = await Promise.all([
    supabase.from("heats").select("*").order("heat_order"),
    supabase.from("groups").select("*").order("score", { ascending: false }).limit(3),
    supabase.from("mission_state").select("*").eq("id", 1).single(),
  ]);

  const finishedHeats = heats?.filter((h) => h.is_finished).length ?? 0;
  const totalHeats = heats?.length ?? 10;
  const missionLocked = mission?.is_locked ?? true;

  return (
    <div className="grid-bg -mx-5 px-5 pb-12 pt-6">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-navy-900 to-navy-950 p-8 md:p-12">
        <div className="font-mono text-[11px] tracking-[0.3em] text-teal-400">
          // SYSTEM_ONLINE · {new Date().toLocaleDateString("th-TH")}
        </div>
        <h1 className="mt-3 font-sans text-4xl font-bold leading-tight md:text-6xl">
          BASIC<span className="text-teal-400">.</span>ROBOT
          <span className="ml-3 font-mono text-2xl text-white/30 md:text-4xl">/26</span>
        </h1>
        <p className="mt-4 max-w-xl text-white/60">
          Basic Robot Camp 26 — เว็บไซต์สำหรับรวมการแข่งขัน คะแนน และภารกิจ
          ทุกอย่างอัปเดตแบบเรียลไทม์
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/sprint" className="rounded-md bg-teal-400 px-5 py-2.5 font-mono text-sm font-bold text-navy-950 transition hover:bg-teal-500">
            → ดูการแข่งขันวิ่งเร็ว
          </Link>
          <Link href="/scoreboard" className="rounded-md border border-white/15 px-5 py-2.5 font-mono text-sm text-white hover:border-teal-400 hover:text-teal-400">
            ตารางคะแนนกลุ่ม
          </Link>
        </div>
      </section>

      {/* TELEMETRY GRID */}
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Card
          eyebrow="01 / SPRINT"
          title="วิ่งเร็ว"
          status={finishedHeats === totalHeats ? "done" : finishedHeats > 0 ? "live" : "pending"}
          stat={`${finishedHeats}/${totalHeats}`}
          statLabel="รายการเสร็จ"
          href="/sprint"
        />
        <Card
          eyebrow="02 / MISSION"
          title="ภารกิจ"
          status={missionLocked ? "locked" : "live"}
          stat={missionLocked ? "—" : "OPEN"}
          statLabel={missionLocked ? "รอเปิด" : "กำลังแข่ง"}
          href="/mission"
        />
        <Card
          eyebrow="03 / SCOREBOARD"
          title="คะแนนกลุ่ม"
          status="live"
          stat={String(groups?.[0]?.score ?? 0)}
          statLabel={`นำโดย ${groups?.[0]?.name ?? "—"}`}
          href="/scoreboard"
        />
      </section>
    </div>
  );
}

function Card({
  eyebrow, title, status, stat, statLabel, href,
}: {
  eyebrow: string;
  title: string;
  status: "live" | "locked" | "done" | "pending";
  stat: string;
  statLabel: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-white/5 bg-navy-900/60 p-5 transition hover:border-teal-400/40 hover:shadow-glow"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.2em] text-white/40">
          {eyebrow}
        </span>
        <StatusBadge status={status} />
      </div>
      <div className="mt-4 text-lg font-semibold text-white">{title}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-3xl font-bold text-teal-400">{stat}</span>
        <span className="text-xs text-white/45">{statLabel}</span>
      </div>
      <div className="mt-4 font-mono text-[11px] text-white/30 transition group-hover:text-teal-400">
        → เข้าดู
      </div>
    </Link>
  );
}
