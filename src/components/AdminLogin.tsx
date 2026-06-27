"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error ?? "เข้าระบบไม่สำเร็จ");
      return;
    }
    router.refresh();
  }

  return (
    <div className="grid min-h-[70vh] place-items-center">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-teal-400/20 bg-navy-900/80 p-7 shadow-glow"
      >
        <div className="font-mono text-[10px] tracking-[0.3em] text-teal-400">
          // ADMIN_AUTH_REQUIRED
        </div>
        <h1 className="mt-2 text-2xl font-bold">เข้าสู่ระบบแอดมิน</h1>
        <p className="mt-1 text-sm text-white/55">
          กรอกรหัสผ่านเพื่อปลดล็อกหน้าควบคุม
        </p>

        <label className="mt-6 block">
          <span className="font-mono text-[10px] tracking-widest text-white/40">PASSWORD</span>
          <input
            type="password"
            autoFocus
            className="field mt-1.5"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="•••••••••"
          />
        </label>

        {err && (
          <div className="mt-3 rounded-md border border-red-400/30 bg-red-400/10 px-3 py-2 font-mono text-xs text-red-300">
            {err}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !pw}
          className="mt-5 w-full rounded-md bg-teal-400 px-4 py-2.5 font-mono text-sm font-bold text-navy-950 transition hover:bg-teal-500 disabled:opacity-40"
        >
          {loading ? "กำลังตรวจสอบ..." : "→ ปลดล็อก"}
        </button>
      </form>
    </div>
  );
}
