import { notFound } from "next/navigation";
import Link from "next/link";
import { isAdmin, verifySecretPath } from "@/lib/auth";
import { AdminLogin } from "@/components/AdminLogin";
import { LogoutButton } from "@/components/LogoutButton";

export default function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { secret: string };
}) {
  if (!verifySecretPath(params.secret)) {
    notFound();
  }

  if (!isAdmin()) {
    return <AdminLogin />;
  }

  const base = `/admin/${params.secret}`;

  return (
    <div className="grid-bg -mx-5 min-h-[calc(100vh-2rem)] px-5">
      <header className="mx-auto -mt-8 mb-8 flex max-w-6xl items-center justify-between border-b border-teal-400/20 bg-navy-950/80 py-3 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="font-mono text-[11px] tracking-[0.3em] text-teal-400">
            // ADMIN_MODE
          </div>
          <nav className="flex gap-1 font-mono text-xs">
            <Link href={base} className="rounded-md px-3 py-1.5 text-white/60 hover:text-teal-400">
              dashboard
            </Link>
            <Link href={`${base}/sprint`} className="rounded-md px-3 py-1.5 text-white/60 hover:text-teal-400">
              sprint
            </Link>
            <Link href={`${base}/scoreboard`} className="rounded-md px-3 py-1.5 text-white/60 hover:text-teal-400">
              scoreboard
            </Link>
          </nav>
        </div>
        <LogoutButton />
      </header>
      <div className="mx-auto max-w-6xl">{children}</div>
    </div>
  );
}
