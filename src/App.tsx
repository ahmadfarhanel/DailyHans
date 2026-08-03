import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { useAuth } from './lib/useAuth'
import { getBillAlerts, type BillAlert } from './lib/notifications'
import Dashboard from './components/Dashboard'
import Expenses from './components/Expenses'
import Income from './components/Income'
import Chores from './components/Chores'
import Shopping from './components/Shopping'
import Bills from './components/Bills'
import Plans from './components/Plans'
import Notifications, { AlertBanner } from './components/Notifications'
import Profile from './components/Profile'

type Tab = 'dashboard' | 'expenses' | 'income' | 'chores' | 'shopping' | 'bills' | 'plans'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'expenses', label: 'Pengeluaran', icon: '💰' },
  { id: 'income', label: 'Pemasukan', icon: '📈' },
  { id: 'chores', label: 'Tugas', icon: '✅' },
  { id: 'shopping', label: 'Belanja', icon: '🛒' },
  { id: 'bills', label: 'Tagihan', icon: '📋' },
  { id: 'plans', label: 'Rencana', icon: '🗺️' },
]

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    const { error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    if (error) setErr(error.message)
    setLoading(false)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-6">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-forest/8 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-[400px] w-[400px] rounded-full bg-gold/12 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-forest to-forest-light shadow-lg shadow-forest/30">
            <svg className="h-8 w-8 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Daily<span className="bg-gradient-to-r from-forest to-gold bg-clip-text text-transparent">KaoAyy</span>
          </h1>
          <p className="mt-2 text-sm text-forest/50">Monitoring rumah tangga yang simpel</p>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-forest/10 bg-white/80 p-7 backdrop-blur-xl shadow-2xl shadow-forest/8">
          <div className="mb-5 flex rounded-lg bg-forest/5 p-1">
            {(['login', 'signup'] as const).map(m => (
              <button key={m} type="button" onClick={() => { setMode(m); setErr('') }}
                className={`flex-1 rounded-md py-2 text-xs font-semibold transition ${mode === m ? 'bg-forest text-cream shadow' : 'text-forest/50 hover:text-forest'}`}>
                {m === 'login' ? 'Masuk' : 'Daftar'}
              </button>
            ))}
          </div>

          <div className="space-y-3.5">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-forest/50">Email</span>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="nama@email.com"
                className="w-full rounded-xl border border-forest/12 bg-white px-4 py-3 text-sm text-forest outline-none transition placeholder:text-forest/30 focus:border-forest/40 focus:ring-2 focus:ring-forest/10" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-forest/50">Password</span>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Minimal 6 karakter"
                className="w-full rounded-xl border border-forest/12 bg-white px-4 py-3 text-sm text-forest outline-none transition placeholder:text-forest/30 focus:border-forest/40 focus:ring-2 focus:ring-forest/10" />
            </label>
          </div>

          {err && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-500">
              <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              {err}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-forest to-forest-light py-3 text-sm font-bold text-cream shadow-lg shadow-forest/25 transition hover:shadow-forest/40 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" opacity=".25"/><path d="M4 12a8 8 0 018-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                Memproses...
              </span>
            ) : mode === 'login' ? 'Masuk ke Dashboard' : 'Buat Akun Baru'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-forest/30">
          Dibuat dengan ❤️ untuk keluarga Indonesia
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const { session, loading } = useAuth()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [alerts, setAlerts] = useState<BillAlert[]>([])
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    getBillAlerts().then(setAlerts)
    const t = setInterval(() => getBillAlerts().then(setAlerts), 60000)
    return () => clearInterval(t)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-forest/15 border-t-forest" />
          <span className="text-sm text-forest/40">Memuat...</span>
        </div>
      </div>
    )
  }

  if (!session) return <Login />

  return (
    <div className="min-h-screen bg-cream-dark text-forest font-sans">

      {/* ── MOBILE HEADER (hidden on md+) ── */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-forest/8 bg-cream px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-forest to-forest-light shadow shadow-forest/20">
            <svg className="h-4 w-4 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1m-4 0h4" />
            </svg>
          </div>
          <span className="text-base font-bold">Daily<span className="text-gold">KaoAyy</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Notifications alerts={alerts} />
          <button onClick={() => setShowProfile(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-forest to-forest-light text-xs font-bold text-cream shadow shadow-forest/20">
            {session.user.email?.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      {/* ── DESKTOP SIDEBAR (hidden on mobile) ── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden md:flex w-56 flex-col border-r border-forest/8 bg-cream overflow-hidden">
        <div className="flex items-center gap-2 border-b border-forest/8 px-4 py-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-forest to-forest-light shadow-lg shadow-forest/20">
            <svg className="h-5 w-5 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1m-4 0h4" />
            </svg>
          </div>
          <span className="text-base font-bold">Daily<span className="text-gold">KaoAyy</span></span>
          <div className="ml-auto">
            <Notifications alerts={alerts} />
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          {TABS.map(t => {
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${active ? 'bg-forest/10 text-forest' : 'text-forest/50 hover:bg-forest/5 hover:text-forest'}`}>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base transition ${active ? 'bg-forest/12' : 'bg-forest/5'}`}>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-forest/8 bg-cream p-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-forest to-forest-light text-sm font-bold text-cream">
                {session.user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-forest">{session.user.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowProfile(true)} className="flex-1 rounded-lg bg-forest/5 px-3 py-1.5 text-xs font-medium text-forest hover:bg-forest/10 transition">
                ⚙️ Profil
              </button>
              <button onClick={() => supabase.auth.signOut()} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition">
                Keluar
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="md:pl-56 pt-[57px] pb-20 md:pt-0 md:pb-0">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <AlertBanner alerts={alerts} />
          {tab === 'dashboard' && <Dashboard onNavigate={t => setTab(t as Tab)} />}
          {tab === 'expenses' && <Expenses />}
          {tab === 'income' && <Income />}
          {tab === 'chores' && <Chores />}
          {tab === 'shopping' && <Shopping />}
          {tab === 'bills' && <Bills />}
          {tab === 'plans' && <Plans />}
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV (hidden on md+) ── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-forest/8 bg-cream md:hidden">
        {TABS.map(t => {
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-all ${active ? 'text-forest' : 'text-forest/40'}`}>
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-lg transition-all ${active ? 'bg-forest/10 scale-110' : ''}`}>
                {t.icon}
              </span>
              <span className="leading-none">{t.label}</span>
            </button>
          )
        })}
      </nav>

      {showProfile && <Profile onClose={() => setShowProfile(false)} />}
    </div>
  )
}
