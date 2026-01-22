import React from "react";

export default function Landing({ onOpenConsole }: { onOpenConsole: () => void }) {
  return (
    <div style={styles.page}>
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      {/* Navbar */}
      <header style={styles.nav}>
        <div style={styles.brand}>
          <div style={styles.logo}>🧠</div>
          <div>
            <div style={styles.brandName}>Patrick AI</div>
            <div style={styles.brandTag}>Multi-Agent Platform</div>
          </div>
        </div>

        <nav style={styles.navLinks}>
          <a style={styles.navLink} href="#features">Features</a>
          <a style={styles.navLink} href="#usecases">Use cases</a>
          <a style={styles.navLink} href="#workflow">Workflow</a>
          <a style={styles.navLink} href="#faq">FAQ</a>
        </nav>

        <div style={styles.navActions}>
          <button style={styles.btnGhost} onClick={onOpenConsole}>
            Open Console
          </button>
          <button style={styles.btnPrimary} onClick={onOpenConsole}>
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroLeft}>
          <div style={styles.pill}>
            <span style={styles.pillDot} />
            AI Agents • FastAPI • Secure Sessions
          </div>

          <h1 style={styles.h1}>
            Build smarter workflows with <span style={styles.gradText}>AI Agents</span>
            <br /> that feel human and ship faster.
          </h1>

          <p style={styles.lead}>
            A clean platform to authenticate, generate, continue conversations, and orchestrate
            multi-agent tasks — designed for real products, not demos.
          </p>

          <div style={styles.heroCtas}>
            <button style={styles.btnPrimaryBig} onClick={onOpenConsole}>
              Launch Console
            </button>
            <button style={styles.btnSoft}>
              View Docs
            </button>
          </div>

          <div style={styles.miniStats}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>Fast</div>
              <div style={styles.statLabel}>Low-latency responses</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>Secure</div>
              <div style={styles.statLabel}>Token-based sessions</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>Scalable</div>
              <div style={styles.statLabel}>Modular API endpoints</div>
            </div>
          </div>
        </div>

        <div style={styles.heroRight}>
          <div style={styles.heroMock}>
            <div style={styles.mockTop}>
              <div style={styles.mockDots}>
                <span style={styles.dot} />
                <span style={styles.dot} />
                <span style={styles.dot} />
              </div>
              <div style={styles.mockTitle}>Agent Console Preview</div>
              <div style={styles.mockChip}>LIVE</div>
            </div>

            <div style={styles.mockBody}>
              <div style={styles.chatLineUser}>
                <div style={styles.avatarUser}>P</div>
                <div style={styles.bubbleUser}>
                  Generate a short intro for my project in French.
                </div>
              </div>

              <div style={styles.chatLineBot}>
                <div style={styles.avatarBot}>AI</div>
                <div style={styles.bubbleBot}>
                  Bien sûr. Voici une introduction claire et professionnelle pour ton projet…
                </div>
              </div>

              <div style={styles.mockFooter}>
                <div style={styles.fakeInput}>Type a prompt…</div>
                <button style={styles.sendBtn}>↵</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.h2}>A platform designed for production</h2>
          <p style={styles.sectionText}>
            Everything you need to run an AI agent with authentication, continuity and clean UX.
          </p>
        </div>

        <div style={styles.cardsGrid}>
          <FeatureCard
            title="Session Continuity"
            text="Keep context across prompts using a session_id, without messy hacks."
            icon="🧩"
          />
          <FeatureCard
            title="Token Security"
            text="Bearer token flow with clear UI state (logged in/out, session status)."
            icon="🔐"
          />
          <FeatureCard
            title="FastAPI Ready"
            text="Simple endpoints: /login, /generate, /continue — easy to extend."
            icon="⚡"
          />
          <FeatureCard
            title="Clean UI System"
            text="Responsive layout, accessible components, and consistent spacing."
            icon="🎛️"
          />
        </div>
      </section>

      {/* Use cases */}
      <section id="usecases" style={styles.sectionAlt}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.h2}>Use cases that match real work</h2>
          <p style={styles.sectionText}>
            Your agent can help with writing, summarizing, coding, planning, or internal automation.
          </p>
        </div>

        <div style={styles.useGrid}>
          <UseCase
            title="Content & Communication"
            text="Draft emails, proposals, reports, and professional messages."
            tag="Writing"
          />
          <UseCase
            title="Data & Insights"
            text="Generate structured outputs, analysis summaries, and quick interpretations."
            tag="Analytics"
          />
          <UseCase
            title="Developer Assistant"
            text="Explain errors, suggest fixes, and keep your workflow moving."
            tag="Dev"
          />
          <UseCase
            title="Operations Support"
            text="Templates, checklists, and repeatable tasks for teams."
            tag="Ops"
          />
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.h2}>How it works</h2>
          <p style={styles.sectionText}>
            Simple flow. No confusion. Clear steps from login to generation.
          </p>
        </div>

        <div style={styles.timeline}>
          <Step n="01" title="Login" text="Authenticate and receive your access token." />
          <Step n="02" title="Generate" text="Send a prompt and get a structured response." />
          <Step n="03" title="Continue" text="Continue the same session to keep context." />
        </div>

        <div style={styles.centerCta}>
          <button style={styles.btnPrimaryBig} onClick={onOpenConsole}>
            Open Agent Console
          </button>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={styles.sectionAlt}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.h2}>FAQ</h2>
          <p style={styles.sectionText}>
            Quick answers to common questions when deploying your agent.
          </p>
        </div>

        <div style={styles.faqGrid}>
          <Faq
            q="Is this design unique?"
            a="Yes. It’s inspired by modern SaaS patterns, but the layout, colors, spacing and copy are original."
          />
          <Faq
            q="Can I add multi-agent routing?"
            a="Yes. You can add an orchestrator endpoint and route prompts to different agents."
          />
          <Faq
            q="Can I deploy it?"
            a="Yes. You can deploy the frontend on Vercel/Netlify and the API on Render/Railway."
          />
          <Faq
            q="Can I add chat history?"
            a="Yes. We can store messages in SQLite or Postgres and show them in the UI."
          />
          </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerBrand}>
            <div style={styles.logo}>🧠</div>
            <div>
              <div style={styles.brandName}>Patrick AI</div>
              <div style={styles.brandTag}>Custom Agent Console</div>
            </div>
          </div>

          <div style={styles.footerLinks}>
            <div>
              <div style={styles.footerTitle}>Product</div>
              <a style={styles.footerLink} href="#features">Features</a>
              <a style={styles.footerLink} href="#workflow">Workflow</a>
              <a style={styles.footerLink} href="#faq">FAQ</a>
            </div>
            <div>
              <div style={styles.footerTitle}>Console</div>
              <button style={styles.footerBtn} onClick={onOpenConsole}>Open Console</button>
              <button style={styles.footerBtnSoft} onClick={onOpenConsole}>Get Started</button>
            </div>
          </div>
        </div>

        <div style={styles.footerBottom}>
          © {new Date().getFullYear()} Patrick AI • Built with Vite + React + FastAPI
        </div>
      </footer>
    </div>
  );
}

/* Components */
function FeatureCard({ title, text, icon }: { title: string; text: string; icon: string }) {
  return (
    <div style={styles.featureCard}>
      <div style={styles.featureIcon}>{icon}</div>
      <div style={styles.featureTitle}>{title}</div>
      <div style={styles.featureText}>{text}</div>
    </div>
  );
}

function UseCase({ title, text, tag }: { title: string; text: string; tag: string }) {
  return (
    <div style={styles.useCard}>
      <div style={styles.useTop}>
        <span style={styles.useTag}>{tag}</span>
      </div>
      <div style={styles.useTitle}>{title}</div>
      <div style={styles.useText}>{text}</div>
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div style={styles.stepCard}>
      <div style={styles.stepNum}>{n}</div>
      <div>
        <div style={styles.stepTitle}>{title}</div>
        <div style={styles.stepText}>{text}</div>
      </div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div style={styles.faqCard}>
      <div style={styles.faqQ}>{q}</div>
      <div style={styles.faqA}>{a}</div>
    </div>
  );
}

/* Styles (inline, no Tailwind needed) */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background:
      "radial-gradient(900px 500px at 20% 0%, rgba(99,102,241,0.22) 0%, transparent 60%)," +
      "radial-gradient(900px 500px at 80% 10%, rgba(34,211,238,0.12) 0%, transparent 60%)," +
      "linear-gradient(180deg, #060814 0%, #070a12 60%, #05060f 100%)",
    color: "#E5E7EB",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
    position: "relative",
    overflowX: "hidden",
  },

  bgGlow1: {
    position: "absolute",
    top: -120,
    left: -120,
    width: 420,
    height: 420,
    background: "rgba(124,58,237,0.20)",
    filter: "blur(70px)",
    borderRadius: 999,
    pointerEvents: "none",
  },
  bgGlow2: {
    position: "absolute",
    bottom: -140,
    right: -120,
    width: 520,
    height: 520,
    background: "rgba(34,211,238,0.14)",
    filter: "blur(80px)",
    borderRadius: 999,
    pointerEvents: "none",
  },

  nav: {
    width: "min(1200px, calc(100% - 32px))",
    margin: "18px auto 0 auto",
    padding: "14px 16px",
    borderRadius: 18,
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(2,6,23,0.55)",
    backdropFilter: "blur(14px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    position: "sticky",
    top: 12,
    zIndex: 50,
  },

  brand: { display: "flex", alignItems: "center", gap: 12 },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "rgba(99,102,241,0.18)",
    border: "1px solid rgba(99,102,241,0.25)",
  },
  brandName: { fontWeight: 900, fontSize: 14, letterSpacing: 0.2 },
  brandTag: { fontSize: 12, color: "rgba(229,231,235,0.65)" },

  navLinks: { display: "flex", gap: 14, flexWrap: "wrap" },
  navLink: {
    fontSize: 12,
    color: "rgba(229,231,235,0.72)",
    textDecoration: "none",
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(148,163,184,0.14)",
    background: "rgba(2,6,23,0.35)",
  },

  navActions: { display: "flex", gap: 10, alignItems: "center" },
  btnGhost: {
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(148,163,184,0.18)",
    background: "transparent",
    color: "#E5E7EB",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 12,
  },
  btnPrimary: {
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(99,102,241,0.35)",
    background: "rgba(99,102,241,0.95)",
    color: "white",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 12,
  },

  hero: {
    width: "min(1200px, calc(100% - 32px))",
    margin: "22px auto 0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
    gap: 18,
    alignItems: "center",
    paddingBottom: 10,
  },

  heroLeft: { padding: "10px 6px" },

  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(2,6,23,0.55)",
    fontSize: 12,
    color: "rgba(229,231,235,0.78)",
    marginBottom: 14,
  },
  pillDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "rgba(34,211,238,0.9)",
    boxShadow: "0 0 18px rgba(34,211,238,0.35)",
  },

  h1: {
    fontSize: 44,
    lineHeight: 1.05,
    margin: 0,
    letterSpacing: -1,
    fontWeight: 950,
  },
  gradText: {
    background: "linear-gradient(90deg, rgba(99,102,241,1), rgba(34,211,238,1))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  lead: {
    marginTop: 14,
    marginBottom: 18,
    color: "rgba(229,231,235,0.68)",
    fontSize: 14,
    lineHeight: 1.6,
    maxWidth: 560,
  },

  heroCtas: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 },
  btnPrimaryBig: {
    padding: "12px 16px",
    borderRadius: 16,
    border: "1px solid rgba(99,102,241,0.35)",
    background: "rgba(99,102,241,0.95)",
    color: "white",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
  },
  btnSoft: {
    padding: "12px 16px",
    borderRadius: 16,
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(2,6,23,0.55)",
    color: "#E5E7EB",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
  },

  miniStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 12,
  },
  statCard: {
    borderRadius: 18,
    border: "1px solid rgba(148,163,184,0.16)",
    background: "rgba(2,6,23,0.55)",
    padding: 14,
  },
  statValue: { fontWeight: 950, marginBottom: 6 },
  statLabel: { fontSize: 12, color: "rgba(229,231,235,0.65)" },

  heroRight: { display: "flex", justifyContent: "center" },
  heroMock: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 22,
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(2,6,23,0.55)",
    boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
    overflow: "hidden",
  },
  mockTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderBottom: "1px solid rgba(148,163,184,0.14)",
  },
  mockDots: { display: "flex", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 999, background: "rgba(148,163,184,0.45)" },
  mockTitle: { fontSize: 12, color: "rgba(229,231,235,0.7)", fontWeight: 800 },
  mockChip: {
    fontSize: 11,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(34,211,238,0.25)",
    background: "rgba(34,211,238,0.10)",
    color: "rgba(34,211,238,0.95)",
  },mockBody: { padding: 14, display: "flex", flexDirection: "column", gap: 12 },

  chatLineUser: { display: "flex", gap: 10, justifyContent: "flex-end" },
  chatLineBot: { display: "flex", gap: 10, justifyContent: "flex-start" },

  avatarUser: {
    width: 34,
    height: 34,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "rgba(99,102,241,0.25)",
    border: "1px solid rgba(99,102,241,0.25)",
    fontWeight: 900,
    order: 2,
  },
  avatarBot: {
    width: 34,
    height: 34,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "rgba(34,211,238,0.20)",
    border: "1px solid rgba(34,211,238,0.20)",
    fontWeight: 900,
  },

  bubbleUser: {
    maxWidth: "78%",
    padding: "12px 12px",
    borderRadius: 16,
    background: "rgba(99,102,241,0.18)",
    border: "1px solid rgba(99,102,241,0.22)",
    color: "rgba(229,231,235,0.92)",
    fontSize: 13,
    lineHeight: 1.5,
  },
  bubbleBot: {
    maxWidth: "78%",
    padding: "12px 12px",
    borderRadius: 16,
    background: "rgba(2,6,23,0.60)",
    border: "1px solid rgba(148,163,184,0.14)",
    color: "rgba(229,231,235,0.92)",
    fontSize: 13,
    lineHeight: 1.5,
  },

  mockFooter: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    marginTop: 6,
    paddingTop: 12,
    borderTop: "1px solid rgba(148,163,184,0.12)",
  },
  fakeInput: {
    flex: 1,
    padding: "12px 12px",
    borderRadius: 16,
    border: "1px solid rgba(148,163,184,0.14)",
    background: "rgba(2,6,23,0.55)",
    color: "rgba(229,231,235,0.55)",
    fontSize: 12,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    border: "1px solid rgba(34,211,238,0.22)",
    background: "rgba(34,211,238,0.12)",
    color: "rgba(34,211,238,0.95)",
    cursor: "pointer",
    fontWeight: 900,
  },

  section: {
    width: "min(1200px, calc(100% - 32px))",
    margin: "34px auto 0 auto",
    padding: "26px 0",
  },
  sectionAlt: {
    width: "min(1200px, calc(100% - 32px))",
    margin: "0 auto",
    padding: "26px 0",
  },

  sectionHeader: { marginBottom: 16 },
  h2: { margin: 0, fontSize: 26, fontWeight: 950, letterSpacing: -0.5 },
  sectionText: { marginTop: 8, color: "rgba(229,231,235,0.68)", fontSize: 13, lineHeight: 1.6 },

  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14,
  },

  featureCard: {
    borderRadius: 18,
    border: "1px solid rgba(148,163,184,0.16)",
    background: "rgba(2,6,23,0.55)",
    padding: 16,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    display: "grid",
    placeItems: "center",
    background: "rgba(99,102,241,0.15)",
    border: "1px solid rgba(99,102,241,0.18)",
    marginBottom: 10,
  },
  featureTitle: { fontWeight: 950, marginBottom: 6 },
  featureText: { fontSize: 12, color: "rgba(229,231,235,0.65)", lineHeight: 1.6 },

  useGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14,
  },
  useCard: {
    borderRadius: 18,
    border: "1px solid rgba(148,163,184,0.16)",
    background: "linear-gradient(180deg, rgba(2,6,23,0.55), rgba(2,6,23,0.35))",
    padding: 16,
  },
  useTop: { display: "flex", justifyContent: "space-between", marginBottom: 10 },
  useTag: {
    fontSize: 11,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(34,211,238,0.18)",
    background: "rgba(34,211,238,0.08)",
    color: "rgba(34,211,238,0.95)",
  },
  useTitle: { fontWeight: 950, marginBottom: 6 },
  useText: { fontSize: 12, color: "rgba(229,231,235,0.65)", lineHeight: 1.6 },

  timeline: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
    marginTop: 12,
  },
  stepCard: {
    borderRadius: 18,
    border: "1px solid rgba(148,163,184,0.16)",
    background: "rgba(2,6,23,0.55)",
    padding: 16,
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },
  stepNum: {
    width: 44,
    height: 44,
    borderRadius: 16,
    display: "grid",placeItems: "center",
    fontWeight: 950,
    background: "rgba(99,102,241,0.16)",
    border: "1px solid rgba(99,102,241,0.20)",
  },
  stepTitle: { fontWeight: 950, marginBottom: 6 },
  stepText: { fontSize: 12, color: "rgba(229,231,235,0.65)", lineHeight: 1.6 },

  centerCta: { display: "flex", justifyContent: "center", marginTop: 18 },

  faqGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
  },
  faqCard: {
    borderRadius: 18,
    border: "1px solid rgba(148,163,184,0.16)",
    background: "rgba(2,6,23,0.55)",
    padding: 16,
  },
  faqQ: { fontWeight: 950, marginBottom: 8 },
  faqA: { fontSize: 12, color: "rgba(229,231,235,0.65)", lineHeight: 1.6 },

  footer: {
    marginTop: 30,
    borderTop: "1px solid rgba(148,163,184,0.12)",
    padding: "26px 0",
  },
  footerInner: {
    width: "min(1200px, calc(100% - 32px))",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 18,
    flexWrap: "wrap",
  },
  footerBrand: { display: "flex", gap: 12, alignItems: "center" },

  footerLinks: { display: "flex", gap: 40, flexWrap: "wrap" },
  footerTitle: { fontWeight: 950, marginBottom: 10, fontSize: 12, color: "rgba(229,231,235,0.85)" },
  footerLink: {
    display: "block",
    color: "rgba(229,231,235,0.65)",
    textDecoration: "none",
    fontSize: 12,
    marginBottom: 8,
  },
  footerBtn: {
    display: "block",
    width: "100%",
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(99,102,241,0.35)",
    background: "rgba(99,102,241,0.95)",
    color: "white",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 12,
    marginBottom: 10,
  },
  footerBtnSoft: {
    display: "block",
    width: "100%",
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(2,6,23,0.55)",
    color: "#E5E7EB",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 12,
  },
  footerBottom: {
    width: "min(1200px, calc(100% - 32px))",
    margin: "16px auto 0 auto",
    color: "rgba(229,231,235,0.55)",
    fontSize: 12,
    textAlign: "center",
  },
};