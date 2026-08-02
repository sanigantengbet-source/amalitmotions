import { useEffect, useState } from "react";
import { Check, Mail, KeyRound, ShieldCheck, Crown, Clock } from "lucide-react";

type Step = {
  icon: typeof Mail;
  title: string;
  detail: string;
  tone: string;
};

const STEPS: Step[] = [
  {
    icon: KeyRound,
    title: "Sesi & token diverifikasi",
    detail: "Session ID, nonce dan Proof-of-Work berhasil dicocokkan dengan server.",
    tone: "text-brand-blue",
  },
  {
    icon: Mail,
    title: "Magic link divalidasi",
    detail: "Link dari inbox kamu dibaca dan diterima sebagai kredensial login yang sah.",
    tone: "text-brand-purple",
  },
  {
    icon: ShieldCheck,
    title: "Akun terautentikasi",
    detail: "Login ke Alight Creative selesai tanpa password.",
    tone: "text-brand-teal",
  },
  {
    icon: Crown,
    title: "Premium diaktifkan",
    detail: "Alight Motion Premium aktif penuh — semua efek, tanpa watermark.",
    tone: "text-brand-amber",
  },
];

export function SuccessFlow({ email, duration }: { email?: string; duration?: string }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setActive((prev) => Math.max(prev, i + 1)), 350 + i * 550),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const done = active >= STEPS.length;

  return (
    <div className="glass mt-6 overflow-hidden rounded-2xl p-6">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
          <span
            className="absolute inset-0 rounded-full bg-brand-green/30"
            style={{ animation: "ring-pulse 1.8s ease-out infinite" }}
          />
          <span
            className="absolute inset-0 rounded-full bg-brand-green/20"
            style={{ animation: "ring-pulse 1.8s ease-out infinite 0.6s" }}
          />
          <span
            className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-green text-background"
            style={{ animation: "pop-check 0.6s cubic-bezier(0.34,1.56,0.64,1) both" }}
          >
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor">
              <path
                d="M4 12.5l5 5L20 7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 30,
                  strokeDashoffset: 30,
                  animation: "draw-check 0.5s ease-out 0.35s forwards",
                }}
              />
            </svg>
          </span>
        </div>
        <h2 className="text-lg font-semibold tracking-tight">Verifikasi berhasil</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Premium sudah aktif di akun{" "}
          <span className="font-medium text-foreground">{email ?? "kamu"}</span>
        </p>
      </div>

      <div className="mt-7 space-y-0">
        {STEPS.map((s, i) => {
          const reached = i < active;
          const Icon = s.icon;
          return (
            <div key={s.title} className="relative flex gap-3.5 pb-5 last:pb-0">
              {i < STEPS.length - 1 && (
                <span className="absolute left-[17px] top-9 h-[calc(100%-1.5rem)] w-px bg-border">
                  <span
                    className="block h-full w-px origin-top bg-brand-green/70"
                    style={
                      reached
                        ? { animation: "line-grow 0.5s ease-out both" }
                        : { transform: "scaleY(0)" }
                    }
                  />
                </span>
              )}
              <span
                className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
                  reached
                    ? "border-brand-green/40 bg-brand-green/15 text-brand-green"
                    : "border-border bg-surface-2 text-muted-foreground"
                }`}
              >
                {reached ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <div
                className="min-w-0 pt-1 transition-opacity duration-500"
                style={
                  reached
                    ? { animation: "step-in 0.45s ease-out both" }
                    : { opacity: 0.45 }
                }
              >
                <p className="text-sm font-medium">{s.title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                  {s.detail}
                </p>
                {!reached && (
                  <p className={`mt-1 text-[11px] font-medium ${s.tone}`}>Memproses…</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {done && (
        <div
          className="glass-soft mt-2 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3"
          style={{ animation: "step-in 0.5s ease-out both" }}
        >
          <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Durasi langganan
          </span>
          <span className="rounded-full bg-brand-amber/15 px-3 py-1 text-[13px] font-medium text-brand-amber">
            {duration ?? "1 Tahun"}
          </span>
        </div>
      )}
    </div>
  );
}
