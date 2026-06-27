type Status = "live" | "locked" | "done" | "pending";

const map: Record<Status, { label: string; dot: string; text: string; ring: string }> = {
  live:    { label: "LIVE",      dot: "bg-teal-400",  text: "text-teal-400",  ring: "ring-teal-400/30" },
  locked:  { label: "LOCKED",    dot: "bg-white/40",  text: "text-white/60",  ring: "ring-white/20" },
  done:    { label: "FINISHED",  dot: "bg-gold-400",  text: "text-gold-400",  ring: "ring-gold-400/30" },
  pending: { label: "PENDING",   dot: "bg-white/40",  text: "text-white/55",  ring: "ring-white/15" },
};

export function StatusBadge({ status }: { status: Status }) {
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-navy-950/60 px-2.5 py-0.5 font-mono text-[10px] tracking-widest ring-1 ${s.ring} ${s.text}`}
    >
      <span className={`pulse-dot inline-block h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
