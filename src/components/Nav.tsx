"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/",           label: "HOME",       code: "00" },
  { href: "/sprint",     label: "SPRINT",     code: "01" },
  { href: "/mission",    label: "MISSION",    code: "02" },
  { href: "/scoreboard", label: "SCOREBOARD", code: "03" },
];

export function Nav() {
  const path = usePathname();
  // ซ่อน Nav ในหน้า admin (มี Nav ของตัวเอง)
  if (path?.startsWith("/admin")) return null;

  return (
    <header className="border-b border-white/5 bg-navy-950/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md border border-teal-400/40 bg-navy-800 font-mono text-teal-400 text-sm">
            BR
          </span>
          <div className="leading-tight">
            <div className="font-mono text-[11px] tracking-[0.2em] text-teal-400">
              BASIC_ROBOT
            </div>
            <div className="font-mono text-sm font-bold text-white">
              26<span className="text-teal-400">.</span>console
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-1 font-mono text-xs">
          {links.map((l) => {
            const active = l.href === "/" ? path === "/" : path?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors ${
                  active
                    ? "bg-teal-400/10 text-teal-400"
                    : "text-white/55 hover:text-white"
                }`}
              >
                <span className="text-[10px] opacity-60">{l.code}</span>
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
