import { supabase } from "@/lib/supabase";
import { MissionAdminClient } from "@/components/MissionAdminClient";
import type { PingPong } from "@/lib/types";

export const revalidate = 0;

export default async function AdminMissionPage() {
  const { data: groups } = await supabase.from("ping_pong").select("*").order("id");

  return (
    <div>
      <div className="font-mono text-[11px] tracking-[0.3em] text-teal-400">
        // EDIT · MISSION
      </div>
      <h1 className="mt-2 text-3xl font-bold">ภารกิจเก็บลูกปิงปอง</h1>
      <p className="mt-1 text-sm text-white/55">
        กรอกจำนวนลูกรอบคัดเลือก · ระบุ อันดับรอบชิง (1-4) เมื่อแข่งรอบชิงเสร็จ
      </p>
      <MissionAdminClient initialGroups={(groups ?? []) as PingPong[]} />
    </div>
  );
}
