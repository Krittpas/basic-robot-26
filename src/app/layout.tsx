import "./globals.css";
import type { Metadata } from "next";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Basic Robot 26 — Control Console",
  description: "ค่าย Basic Robot รุ่นที่ 26",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen font-sans antialiased">
        <Nav />
        <main className="mx-auto max-w-6xl px-5 pb-20 pt-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-5 pb-10 text-xs text-white/40 font-mono">
          // basic_robot_26 · control_console · v1.0
        </footer>
      </body>
    </html>
  );
}
