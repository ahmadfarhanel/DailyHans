# PRD: DailyHans — Vibecoding Automation System

**Version:** 1.0  
**Date:** 2026-08-03  
**Project:** DailyHans  
**Location:** `E:\Code\BOT\DailyHans`

---

## 1. Overview

Sistem automation vibecoding end-to-end: dari prompt bahasa natural → AI generate code → git push → auto deploy → live app. Dengan knowledge base (Obsidian) dan feedback loop (cron jobs).

**Goal:** Developer ketik prompt → sistem generate, deploy, dan maintain app secara otomatis.

---

## 2. Komponen Sistem (dari diagram Vibecoding Automation)

### 2.1 Developer Layer
| Item | Detail |
|------|--------|
| Input | Natural language prompt |
| Channel input | Desktop app (Hermes), CLI, VS Code (file browser) |
| Output | Instruksi ke AI tools via 9Router |
| Interaksi | Chat (Hermes desktop/CLI), VS Code (edit/view), Web (v0.dev) |
| Flow | Prompt → Hermes → 9Router → AI provider → generate code |
| VS Code setup | Tanpa AI extension — pakai sebagai editor, Hermes direct (terminal + chat + file tools) |

### 2.2 Knowledge Base — Obsidian
| Item | Detail |
|------|--------|
| Fungsi | Simpan prompt template, code snippets, lesson learned, project specs |
| Integrasi | Hermes skill `obsidian` (baca/tulis note dari chat) |
| Storage | Local markdown files |
| Fitur | `[[linking]]`, tags, graph view, search |

### 2.3 AI Routing Layer — 9Router

| Item | Detail |
|------|--------|
| Fungsi | Smart gateway antara AI tools dan 60+ provider LLM |
| Endpoint | `http://localhost:20128/v1` (OpenAI-compatible) |
| Fallback | 3-tier: Subscription → Cheap → FREE |
| Tier 1 — Subscription | Claude Code, Codex, Gemini, Copilot |
| Tier 2 — Cheap | GLM $0.60, MiniMax $0.20, Kimi $9/mo |
| Tier 3 — FREE | iFlow, Qwen, Kiro, OpenCode unlimited |
| Service Kinds | Chat/LLM, Embeddings, TTS, STT, Image Gen, Vision, Video Gen, Web Search, Web Fetch |
| Fitur | Smart Combos (round-robin), Multi-account, Format Translator, RTK token saver (−20-40%), Caveman mode (−65%) |
| Integrasi | Semua AI tools (Cursor, Claude Code, Codex, Hermes, Cline, dll) point ke `localhost:20128/v1` |
| Install | `npm install -g 9router` → `9router` |
| Dashboard | `localhost:20128/dashboard` |

### 2.4 AI Tools Layer

| Tool | Fungsi | Output |
|------|--------|--------|
| v0.dev | Generate UI komponen | React + Tailwind + shadcn/ui |
| Cursor | AI IDE, edit multi-file | Full code edits di repo |
| Claude Code | CLI agent, terminal ops | Agentic code changes, run command |
| Hermes Agent | Orchestrator + cron | Delegate task, schedule, automation loop |

> Semua AI tools di atas connect ke 9Router (`localhost:20128/v1`) sebagai single endpoint → 9Router route ke 60+ provider dengan 3-tier fallback.

### 2.5 Code Output Layer
| Komponen | Stack |
|----------|-------|
| UI Components | React + Tailwind CSS + shadcn/ui |
| App Framework | Next.js atau Vite + React + TypeScript |
| Animasi | Framer Motion |
| Backend | Supabase (Postgres + Auth + Storage + Realtime) |

### 2.6 Version Control & CI/CD
| Item | Detail |
|------|--------|
| Repo | GitHub (`gh CLI`) |
| Trigger | `git push` → auto trigger CI/CD |
| Pipeline | Build → test → deploy |
| Branch strategy | `main` = production, `dev` = staging |

### 2.7 Deploy Layer
| Platform | Fungsi |
|----------|--------|
| Vercel | Edge deploy, preview URL per PR, auto deploy dari git push |

### 2.8 Live App
| Item | Detail |
|------|--------|
| Output | Production URL (app.vercel.app) |
| Monitoring | Uptime, error tracking |
| Domain | Custom domain opsional |

### 2.9 Automation Loop — Cron Jobs
| Item | Detail |
|------|--------|
| Engine | Hermes cron jobs |
| Fungsi | Auto re-run task, monitor, update, redeploy |
| Schedule | Configurable (interval/cron expression) |
| Feedback | Hasil cron → inject ke session berikutnya |

---

## 3. Alur Sistem

```
Developer (Desktop / CLI / VS Code)
    + Obsidian (knowledge)
    ↓ prompt (natural language)
Hermes (desktop / CLI / VS Code ACP)
    ↓ route to
9Router (localhost:20128/v1 → 3-tier fallback: Subscription → Cheap → FREE)
    ↓ route to 60+ providers
AI Tools (v0.dev / VS Code ACP / Claude Code / Hermes)
    ↓ generate code
Code Output (React + Tailwind + Next.js/Vite + Supabase)
    ↓ git push
GitHub Repo
    ↓ trigger
CI/CD Pipeline (build + test)
    ↓ deploy
Vercel
    ↓
Live App (app.vercel.app)
    ↑ feedback loop
Cron Jobs (Hermes auto re-run → desktop notification)
```

---

## 4. Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18+ / Next.js 14+ / Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Animasi | Framer Motion |
| Backend | Supabase (Postgres + Auth + Storage + Realtime) |
| Language | TypeScript |
| Version Control | Git + GitHub (`gh CLI`) |
| Deploy | Vercel (auto deploy dari git push, preview per PR) |
| AI Router | 9Router (`localhost:20128/v1`) — 60+ provider, 3-tier fallback |
| AI Tools | v0.dev, VS Code (ACP Client), Claude Code, Hermes Agent |
| Knowledge Base | Obsidian |
| Automation | Hermes cron jobs |
| Messaging | WhatsApp (Hermes gateway, Baileys bridge) — *future, saat butuh remote input* |

---

## 5. Fase Pengembangan

### Fase 1: Foundation (MVP)
- [x] Setup repo GitHub `DailyHans` → https://github.com/ahmadfarhanel/DailyHans
- [x] Inisialisasi Vite + React + TypeScript + Tailwind
- [x] Setup Supabase project (URL: https://lgarhndeiudtsibfovhu.supabase.co)
- [x] Env vars (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) di .env
- [x] Supabase client (`src/lib/supabase.ts`)
- [x] 9Router running di localhost:20128/v1
- [x] Obsidian vault di E:\Code\BOT\Obsidian
- [x] VS Code setup — editor saja, AI via Hermes direct
- [x] Path alias `@/*` di tsconfig + vite.config
- [x] Landing page DailyHans (hero, stats, stack, flow, roadmap)
- [x] Build verification pass (`npm run build`)
- [x] GitHub auth (web device flow) + gh CLI v2.97.0
- [ ] Install & konfigurasi shadcn/ui (manual: `npx shadcn@latest init`)
- [ ] Setup Vercel deploy
- [ ] CI/CD pipeline (GitHub Actions; Fase 4)

### Fase 2: AI Pipeline
- [ ] Integrate v0.dev workflow (UI generation)
- [ ] Konfigurasi VS Code + ACP Client → connect Hermes Agent
- [ ] Setup Claude Code CLI → point ke 9Router
- [ ] Hermes orchestration (delegate_task antar tool)

### Fase 3: CI/CD & Deploy
- [ ] GitHub Actions workflow (build + test)
- [ ] Connect Vercel (auto deploy dari `main`)
- [ ] Preview deploy per PR
- [ ] Environment variables setup (Vercel dashboard)

### Fase 4: Automation & Feedback Loop
- [ ] Hermes cron jobs (monitoring, auto-update)
- [ ] Feedback loop: cron result → session context
- [ ] Desktop notification (deploy status, error alert)
- [ ] Obsidian auto-log (lesson learned, deploy history)
- [ ] *Future: WhatsApp gateway (saat butuh remote input dari HP)*

### Fase 5: Polish
- [ ] Custom domain
- [ ] Error tracking (Sentry opsional)
- [ ] Documentation (README, wiki)
- [ ] Prompt template library di Obsidian

---

## 6. Struktur Folder (target)

```
E:\Code\BOT\DailyHans\
├── src/
│   ├── components/       # UI components (shadcn/ui)
│   ├── pages/            # Next.js routes / Vite pages
│   ├── lib/              # Utilities, Supabase client
│   ├── styles/           # Tailwind config, globals
│   └── types/            # TypeScript types
├── public/               # Static assets
├── .github/
│   └── workflows/        # CI/CD pipeline
├── docs/                 # Documentation
│   └── PRD.md            # This file
├── .env.example          # Env template (VITE_SUPABASE_URL, dll)
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vercel.json           # SPA rewrite / deploy config
└── README.md
```

---

## 7. Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# GitHub
GH_TOKEN=xxx

# 9Router (AI gateway)
ROUTER_ENDPOINT=http://localhost:20128/v1
ROUTER_API_KEY=xxx

# Hermes (jika perlu)
HERMES_API_KEY=xxx

# Vercel (CI/CD)
VERCEL_TOKEN=xxx
```

---

## 8. Acceptance Criteria

1. **Developer prompt → AI generate code** berfungsi (minimal 1 tool: Hermes)
2. **9Router aktif** — `localhost:20128/v1` merespons, 3-tier fallback berfungsi
3. **Code ter-deploy otomatis** ke Vercel setelah `git push`
4. **Live app accessible** di URL Vercel
5. **Obsidian vault** ter-connect ke Hermes (bisa baca/tulis dari chat)
6. **Cron job** minimal 1 berjalan (monitoring atau daily summary)
7. **CI/CD pipeline** pass (build + deploy tanpa error)

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| WhatsApp ban (Baileys) | Gunakan nomor sekunder, jangan spam |
| AI generate code bug | Review sebelum merge, PR workflow |
| Supabase free tier limit | Monitor usage, upgrade saat perlu |
| Vercel deploy fail | Fallback Netlify, vercel.json correct |
| Hermes PTY issue di Windows | Gunakan `pty=true`, winpty |

---

## 10. Referensi

- Diagram: `C:\Users\Hans\vibecoding-automation.html`
- Hermes docs: https://hermes-agent.nousresearch.com/docs/
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- 9Router: https://9router.com
- Obsidian: https://obsidian.md
