import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div>
      <div className="font-mono text-[11px] tracking-[0.3em] text-teal-400">
        // CONTROL_ROOM
      </div>
      <h1 className="mt-2 text-3xl font-bold">แดชบอร์ดแอดมิน</h1>
      <p className="mt-1 text-sm text-white/55">เลือกหัวข้อที่ต้องการจัดการ</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/sprint"
          className="rounded-xl border border-white/5 bg-navy-900/60 p-6 transition hover:border-teal-400/40 hover:shadow-glow"
        >
          <div className="font-mono text-[10px] tracking-[0.2em] text-white/40">01 / SPRINT</div>
          <h2 className="mt-2 text-xl font-semibold">กรอกเวลาการแข่งวิ่ง</h2>
          <p className="mt-2 text-sm text-white/55">
            กรอกเวลาแต่ละเลน, มาร์ก heat ว่าเสร็จ, จัดทีมรอบรอง/ชิงชนะเลิศ
          </p>
        </Link>
        <Link
          href="/admin/scoreboard"
          className="rounded-xl border border-white/5 bg-navy-900/60 p-6 transition hover:border-teal-400/40 hover:shadow-glow"
        >
          <div className="font-mono text-[10px] tracking-[0.2em] text-white/40">02 / SCOREBOARD</div>
          <h2 className="mt-2 text-xl font-semibold">ให้คะแนน 13 กลุ่ม</h2>
          <p className="mt-2 text-sm text-white/55">
            +/- คะแนนแต่ละกลุ่ม หรือกำหนดค่าเอง
          </p>
        </Link>
      </div>
    </div>
  );
}
