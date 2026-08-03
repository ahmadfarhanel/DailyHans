export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">Daily<span className="text-emerald-400">Hans</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#stack" className="hover:text-zinc-100 transition">Stack</a>
            <a href="#flow" className="hover:text-zinc-100 transition">Flow</a>
            <a href="#roadmap" className="hover:text-zinc-100 transition">Roadmap</a>
          </nav>
          <a href="#roadmap" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition">
            Get Started
          </a>
        </div>
      </header>

      {/* Hero */}
      <main className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[600px] rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Vibecoding Automation System
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Your Daily<span className="text-emerald-400"> AI</span> Workflow
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
            Natural language prompt → Hermes → 9Router → AI provider → generate code → deploy. Semua happend otomatis.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a href="#flow" className="rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition">Lihat Flow</a>
            <a href="#stack" className="rounded-lg border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-200 hover:border-zinc-500 transition">Tech Stack</a>
          </div>
        </div>
      </main>

      {/* Stats */}
      <section className="border-y border-zinc-800/60 bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            ['60+', 'AI Providers'],
            ['3', 'Tier Fallback'],
            ['24/7', 'Pipeline'],
            ['0', 'Manual Steps'],
          ].map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="text-3xl font-bold text-emerald-400">{n}</div>
              <div className="mt-1 text-sm text-zinc-400">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Stack */}
      <section id="stack" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-2xl font-bold text-center">Tech Stack</h2>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Hermes Agent', 'Orchestrator — skills, cron, memory, delegate', 'emerald'],
            ['9Router', 'AI gateway — 60+ providers, 3-tier routing', 'sky'],
            ['Supabase', 'Postgres + Auth + Storage backend', 'violet'],
            ['Vite + React', 'Frontend, fast HMR', 'cyan'],
            ['Obsidian', 'Knowledge base, prompt templates', 'amber'],
            ['Vercel', 'Deploy dari git push', 'zinc'],
          ].map(([name, desc, color]) => (
            <div key={name} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-700 transition">
              <div className={`h-2 w-2 rounded-full bg-${color}-400 mb-3`} />
              <h3 className="font-semibold">{name}</h3>
              <p className="mt-1 text-sm text-zinc-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Flow */}
      <section id="flow" className="border-t border-zinc-800/60 bg-zinc-900/40">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-2xl font-bold text-center">Pipeline Flow</h2>
          <div className="mt-10 space-y-0">
            {['Developer prompt', 'Hermes Agent', '9Router (3-tier)', 'AI Provider', 'Generate code', 'Git push', 'Vercel deploy'].map((s, i) => (
              <div key={s} className="flex items-center gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400">{i + 1}</div>
                <div className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 font-medium">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-2xl font-bold text-center">Roadmap</h2>
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            ['Fase 1 · Foundation', 'Project setup, Supabase, 9Router, GitHub', '✓ Done'],
            ['Fase 2 · AI Pipeline', 'v0.dev, Claude Code, Hermes orchestration', 'In progress'],
            ['Fase 3 · Automation', 'Cron jobs, feedback loop, deploy pipeline', 'Next'],
          ].map(([phase, desc, status]) => (
            <div key={phase} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h3 className="font-semibold">{phase}</h3>
              <p className="mt-1 text-sm text-zinc-400">{desc}</p>
              <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs ${status === '✓ Done' ? 'bg-emerald-500/15 text-emerald-300' : status === 'In progress' ? 'bg-sky-500/15 text-sky-300' : 'bg-zinc-700/50 text-zinc-300'}`}>{status}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 py-8 text-center text-sm text-zinc-500">
        Daily<span className="text-emerald-400">Hans</span> · Vibecoding Automation
      </footer>
    </div>
  )
}
