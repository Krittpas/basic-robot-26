import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAdmin()) redirect("/");

  return (
    <div className="grid-bg -mx-5 min-h-[calc(100vh-2rem)] px-5">
      <header className="mx-auto -mt-8 mb-8 flex max-w-6xl items-center justify-between border-b border-teal-400/20 bg-navy-950/80 py-3 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="font-mono text-[11px] tracking-[0.3em] text-teal-400">
            // ADMIN_MODE
          </div>
          <nav className="flex gap-1 font-mono text-xs">
            <Link href="/admin" className="rounded-md px-3 py-1.5 text-white/60 hover:text-teal-400">
              แดชบอร์ด
            </Link>
            <Link href="/admin/sprint" className="rounded-md px-3 py-1.5 text-white/60 hover:text-teal-400">
              สปรินต์
            </Link>
            <Link href="/admin/mission" className="rounded-md px-3 py-1.5 text-white/60 hover:text-teal-400">
              ภารกิจ
            </Link>
            <Link href="/admin/scoreboard" className="rounded-md px-3 py-1.5 text-white/60 hover:text-teal-400">
              ตารางคะแนน
            </Link>
          </nav>
        </div>
        <LogoutButton />
      </header>
      <div className="mx-auto max-w-6xl">{children}</div>
    </div>
  );
}
