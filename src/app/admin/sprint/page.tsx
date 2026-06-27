import { supabase } from "@/lib/supabase";
import { SprintAdminClient } from "@/components/SprintAdminClient";
import type { Heat } from "@/lib/types";

export const revalidate = 0;

export default async function AdminSprintPage() {
  const { data: heats } = await supabase
    .from("heats")
    .select("*")
    .order("heat_order");

  return (
    <div>
      <div className="font-mono text-[11px] tracking-[0.3em] text-teal-400">
        // EDIT · SPRINT
      </div>
      <h1 className="mt-2 text-3xl font-bold">กรอกเวลาการแข่งวิ่งเร็ว</h1>
      <p className="mt-1 text-sm text-white/55">
        กรอกเวลา (วินาที ทศนิยม 3 ตำแหน่ง) · กดปุ่มบันทึกเพื่อบันทึก
      </p>
      <SprintAdminClient initialHeats={(heats ?? []) as Heat[]} />
    </div>
  );
}
