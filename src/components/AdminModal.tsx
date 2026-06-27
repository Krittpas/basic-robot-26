"use client";
import { useState, useEffect } from "react";

export function AdminModal() {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === "i") {
        e.preventDefault();
        setOpen(true);
        setErr(null);
        setPw("");
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
    setOpen(false);
    window.location.href = "/admin";
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-teal-400/20 bg-navy-900/95 p-7 shadow-glow"
      >
        <div className="font-mono text-[10px] tracking-[0.3em] text-teal-400">
          // ADMIN_AUTH
        </div>
        <h2 className="mt-2 text-xl font-bold">เข้าสู่ระบบแอดมิน</h2>
        <p className="mt-1 text-sm text-white/55">กรอกรหัสผ่านเพื่อปลดล็อกหน้าควบคุม</p>

        <label className="mt-5 block">
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
        <p className="mt-3 text-center font-mono text-[10px] text-white/30">
          ESC เพื่อปิด
        </p>
      </form>
    </div>
  );
}
