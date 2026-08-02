import { createFileRoute } from "@tanstack/react-router";
import { createHash } from "crypto";

const BASE_URL = "https://www.alightpro.my.id";
const SECRET = "amprem-human-v3-secret-2026";
const UA =
  "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36";
const TIMEOUT = 45000;
const MIN_HUMAN_DELAY_MS = 2300;

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

type SessionData = {
  status?: boolean;
  token?: string;
  nonce?: string;
  sessionId?: string;
  timestamp?: string;
  difficulty?: string;
  msg?: string;
};

function baseHeaders(): Record<string, string> {
  return {
    "User-Agent": UA,
    Accept: "application/json",
    "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
    Origin: BASE_URL,
    Referer: `${BASE_URL}/`,
  };
}

function makeJar() {
  const store = new Map<string, string>();
  return {
    absorb(res: Response) {
      const h = res.headers as Headers & { getSetCookie?: () => string[] };
      const list =
        typeof h.getSetCookie === "function"
          ? h.getSetCookie()
          : (res.headers.get("set-cookie") || "").split(/,(?=\s*[A-Za-z_][\w.-]*=)/);
      for (const c of list) {
        const pair = c.split(";")[0]?.trim();
        if (!pair) continue;
        const idx = pair.indexOf("=");
        if (idx > 0) store.set(pair.slice(0, idx), pair.slice(idx + 1));
      }
    },
    header() {
      return [...store.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
    },
  };
}

async function fetchWithTimeout(url: string, init: RequestInit) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

async function primeHome(jar: ReturnType<typeof makeJar>) {
  const res = await fetchWithTimeout(`${BASE_URL}/`, {
    headers: {
      ...baseHeaders(),
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Dest": "document",
    },
  });
  jar.absorb(res);
}

async function getSession(jar: ReturnType<typeof makeJar>): Promise<SessionData> {
  const res = await fetchWithTimeout(`${BASE_URL}/api/session`, {
    headers: {
      ...baseHeaders(),
      "X-Requested-With": "XMLHttpRequest",
      "Cache-Control": "no-store",
      ...(jar.header() ? { Cookie: jar.header() } : {}),
    },
  });
  jar.absorb(res);
  if (!res.ok) throw new Error(`Session endpoint HTTP ${res.status}`);
  const data = (await res.json().catch(() => ({}))) as SessionData;
  if (!data.status || !data.token || !data.nonce) {
    throw new Error(data.msg || "Session token/nonce tidak valid dari server");
  }
  return data;
}

function solvePow(params: {
  sessionId: string;
  nonce: string;
  timestamp: string;
  email: string;
  action: "send" | "verify";
  humanProof: string;
  difficulty: string;
}): string {
  const base = `${params.sessionId}:${params.nonce}:${params.timestamp}:${params.email.toLowerCase()}:${params.action}:${params.humanProof}:`;
  for (let i = 0; i < 500000; i++) {
    if (sha256(base + i).startsWith(params.difficulty)) return String(i);
  }
  return String(Date.now());
}

async function callAlight(body: { action: "send" | "verify"; email: string; link?: string }) {
  const jar = makeJar();
  await primeHome(jar);
  const s = await getSession(jar);

  const ts = parseInt(s.timestamp || "0", 10);
  const delay = MIN_HUMAN_DELAY_MS - (Date.now() - ts);
  if (delay > 0) await new Promise((r) => setTimeout(r, delay));

  const humanProof = sha256(
    `human:${s.sessionId}:${s.nonce}:${s.timestamp}:${body.email.toLowerCase()}:5:${SECRET}`,
  );
  const pow = solvePow({
    sessionId: s.sessionId || "",
    nonce: s.nonce || "",
    timestamp: s.timestamp || "",
    email: body.email,
    action: body.action,
    humanProof,
    difficulty: s.difficulty || "0000",
  });

  const res = await fetchWithTimeout(`${BASE_URL}/api/alight-motion`, {
    method: "POST",
    headers: {
      ...baseHeaders(),
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "X-Amprem-Token": s.token!,
      "X-Amprem-Nonce": s.nonce!,
      "X-Amprem-Pow": pow,
      "X-Amprem-Human-Proof": humanProof,
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Dest": "empty",
      ...(jar.header() ? { Cookie: jar.header() } : {}),
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: { status?: boolean; msg?: string; data?: unknown } = {};
  try {
    data = JSON.parse(text);
  } catch {
    data = { status: false, msg: `non-json ${res.status}` };
  }
  return { http: res.status, data };
}

async function handle(email: string, link: string | null) {
  if (!email) return { success: false, error: "Email wajib diisi" };

  if (!link) {
    const { http, data } = await callAlight({ action: "send", email });
    const sent = !!data.status;
    return {
      success: sent,
      email,
      message:
        data.msg || (sent ? "Link berhasil dikirim" : `Gagal mengirim link (HTTP ${http})`),
      instructions: [
        "Buka inbox email (cek folder Spam juga)",
        'Cari email dari "Alight Motion" / "Alight Creative"',
        'Tekan-tahan tombol "Login ke Alight Creative", pilih "Salin URL"',
        "Jangan klik langsung — copy link doang",
        "Paste link tersebut ke form Verify di halaman ini",
      ],
    };
  }

  const { http, data } = await callAlight({ action: "verify", email, link: link.trim() });
  const verified = !!data.status && !!data.data;
  return {
    success: verified,
    email,
    message:
      data.msg || (verified ? "Account verified successfully" : `Verifikasi gagal (HTTP ${http})`),
    premium: verified,
    duration: "1 Tahun",
    data: data.data ?? null,
  };
}

export const Route = createFileRoute("/api/public/alight")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { email?: string; link?: string };
          const result = await handle(body.email || "", body.link || null);
          return Response.json(result);
        } catch (e) {
          return Response.json(
            { success: false, error: e instanceof Error ? e.message : String(e) },
            { status: 500 },
          );
        }
      },
    },
  },
});
