import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Link2, Loader2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { SuccessFlow } from "@/components/success-flow";
import heroCrowd from "@/assets/hero-crowd.png";
import cardChat from "@/assets/card-chat.png";
import cardSupport from "@/assets/card-support.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AlightPro — Premium Generator" },
      { name: "description", content: "Generate akun Alight Motion Premium 1 Tahun via magic link." },
      { property: "og:title", content: "AlightPro — Premium Generator" },
      { property: "og:description", content: "Generate akun Alight Motion Premium 1 Tahun via magic link." },
    ],
  }),
  component: Index,
});

type ApiResult = {
  success: boolean;
  email?: string;
  message?: string;
  premium?: boolean;
  duration?: string;
  instructions?: string[];
  error?: unknown;
  data?: unknown;
};

const NAV = ["Products", "Premium", "Features", "Live support", "Our plans"];

function Index() {
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");
  const [mode, setMode] = useState<"send" | "verify">("send");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/public/alight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, link: mode === "verify" ? link : undefined }),
      });
      setResult(await res.json());
    } catch (err) {
      setResult({ success: false, error: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(false);
    }
  }

  const verified = result?.success === true && mode === "verify";

  return (
    <div className="min-h-screen px-3 py-4 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl rounded-3xl border-2 border-foreground bg-surface px-4 py-5 sm:px-8 sm:py-8">
        {/* Header */}
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-foreground bg-brand-yellow">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="truncate text-lg font-bold tracking-tight sm:text-xl">AlightPro</span>
          </div>
          <nav className="hidden items-center gap-6 lg:flex">
            {NAV.map((n) => (
              <span key={n} className="cursor-default text-sm font-medium">
                {n}
              </span>
            ))}
          </nav>
          <span className="shrink-0 rounded-lg border-2 border-foreground bg-brand-yellow px-3 py-1.5 text-xs font-semibold sm:text-sm">
            SANN404
          </span>
        </header>

        {/* Hero */}
        <section className="mt-8 grid items-center gap-6 sm:mt-12 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
          <div>
            <h1 className="text-[34px] font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Premium across
              <br />
              the world
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Platform untuk mengaktifkan Alight Motion Premium 1 Tahun lewat magic
              link — kirim, salin, verifikasi.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setMode("send")}
                className={`rounded-xl border-2 border-foreground px-5 py-2.5 text-sm font-semibold transition ${
                  mode === "send" ? "bg-brand-yellow" : "bg-surface"
                }`}
              >
                Get started today
              </button>
              <button
                onClick={() => setMode("verify")}
                className={`rounded-xl border-2 border-foreground px-5 py-2.5 text-sm font-semibold transition ${
                  mode === "verify" ? "bg-brand-yellow" : "bg-surface"
                }`}
              >
                Verify link
              </button>
            </div>
          </div>
          <img
            src={heroCrowd}
            alt="Ilustrasi sekelompok orang mengangkat tangan"
            width={1024}
            height={912}
            className="mx-auto w-full max-w-md lg:max-w-none"
          />
        </section>

        {/* Form panel */}
        <section className="mt-8 rounded-2xl border-2 border-foreground bg-brand-pink p-4 sm:p-6">
          <h2 className="text-xl font-bold sm:text-2xl">
            {mode === "send" ? "Kirim magic link" : "Verifikasi & aktivasi"}
          </h2>
          <form onSubmit={submit} className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold">
                <Mail className="h-3.5 w-3.5" /> Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@gmail.com"
                className="w-full rounded-xl border-2 border-foreground bg-surface px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-foreground/20"
              />
            </label>

            {mode === "verify" && (
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold">
                  <Link2 className="h-3.5 w-3.5" /> Magic Link
                </span>
                <textarea
                  required
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  rows={3}
                  placeholder="https://alight..."
                  className="w-full rounded-xl border-2 border-foreground bg-surface px-4 py-3 font-mono text-[13px] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-foreground/20"
                />
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-foreground bg-brand-yellow px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                </>
              ) : mode === "send" ? (
                <>Send Magic Link</>
              ) : (
                <>Verify &amp; Activate Premium</>
              )}
            </button>
          </form>

          {result && !verified && (
            <div
              className="mt-5 rounded-xl border-2 border-foreground bg-surface p-4 text-sm"
              style={{ animation: "step-in 0.4s ease-out both" }}
            >
              <div className="flex items-center gap-2 font-semibold">
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                {result.message || (result.success ? "Success" : "Failed")}
              </div>
              {result.instructions && (
                <ol className="mt-2 list-inside list-decimal space-y-1 text-[13px] text-muted-foreground">
                  {result.instructions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              )}
              {result.error != null && (
                <pre className="mt-2 overflow-auto rounded-lg border-2 border-foreground bg-surface-2 p-2 font-mono text-xs">
                  {typeof result.error === "string"
                    ? result.error
                    : JSON.stringify(result.error, null, 2)}
                </pre>
              )}
            </div>
          )}
        </section>

        {verified && (
          <SuccessFlow
            {...(result?.email ? { email: result.email } : {})}
            {...(result?.duration ? { duration: result.duration } : {})}
          />
        )}

        {/* Feature cards */}
        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border-2 border-foreground bg-brand-pink p-5 sm:p-6">
            <div className="grid items-center gap-4 sm:grid-cols-[1fr_1.1fr]">
              <img
                src={cardChat}
                alt="Ilustrasi dua orang berbagi layar ponsel"
                loading="lazy"
                width={912}
                height={736}
                className="mx-auto w-40 sm:w-full"
              />
              <div>
                <h3 className="text-lg font-bold sm:text-xl">Community insights</h3>
                <p className="mt-2 text-[13px] leading-relaxed">
                  Semua proses login memakai magic link terenkripsi — tanpa password,
                  tanpa data yang disimpan.
                </p>
                <span className="mt-3 inline-block border-b-2 border-foreground text-[13px] font-semibold">
                  Check the community
                </span>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border-2 border-foreground bg-brand-yellow p-5 sm:p-6">
            <div className="grid items-center gap-4 sm:grid-cols-[1fr_1.1fr]">
              <img
                src={cardSupport}
                alt="Ilustrasi agen dukungan dengan headset"
                loading="lazy"
                width={912}
                height={736}
                className="mx-auto w-40 sm:w-full"
              />
              <div>
                <h3 className="text-lg font-bold sm:text-xl">Free live support</h3>
                <p className="mt-2 text-[13px] leading-relaxed">
                  Ada kendala aktivasi premium? Tim SANN404 siap membantu kapan saja
                  lewat forum group.
                </p>
                <span className="mt-3 inline-block border-b-2 border-foreground text-[13px] font-semibold">
                  Compare plans
                </span>
              </div>
            </div>
          </article>
        </section>

        {/* Footer */}
        <footer className="mt-8 flex flex-col gap-3 border-t-2 border-foreground pt-5 text-[13px] font-medium sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Other projects</span>
            <span>Help center</span>
          </div>
          <span className="text-muted-foreground">
            Dev: <span className="text-foreground">SANN404 FORUM GROUP</span>
          </span>
        </footer>
      </div>
    </div>
  );
}
