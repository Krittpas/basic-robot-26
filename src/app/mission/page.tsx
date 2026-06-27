import { supabase } from "@/lib/supabase";
import { StatusBadge } from "@/components/StatusBadge";

export const revalidate = 0;

export default async function MissionPage() {
  const { data: state } = await supabase
    .from("mission_state").select("*").eq("id", 1).single();

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
          <div className="font-mono text-[10px] tracking-[0.3em] text-white/30">
            // ACCESS_DENIED
          </div>
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

  // เมื่อปลดล็อก — ทำ placeholder เผื่อใส่เนื้อหาทีหลัง
  return (
    <div>
      <header className="mb-6 border-b border-white/5 pb-4">
        <div className="font-mono text-[11px] tracking-[0.3em] text-teal-400">
          // EVENT_02 · MISSION
        </div>
        <h1 className="mt-1 text-3xl font-bold">การแข่งขันภารกิจ</h1>
      </header>
      <div className="rounded-xl border border-white/5 bg-navy-900/60 p-6">
        <p className="text-white/70">เปิดแล้ว — รอเพิ่มเนื้อหา</p>
      </div>
    </div>
  );
}
