"use client";

export function LogoutButton() {
  async function logout() {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    window.location.href = "/";
  }
  return (
    <button
      onClick={logout}
      className="rounded-md border border-white/10 px-3 py-1.5 font-mono text-xs text-white/60 hover:border-red-400/40 hover:text-red-400"
    >
      logout
    </button>
  );
}
