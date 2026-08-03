import { useState } from 'react'

export function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-xs text-zinc-400">{label}</span>}
      <input {...props} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-emerald-500" />
    </label>
  )
}

export function Button({ variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  const cls = {
    primary: 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400',
    ghost: 'border border-zinc-700 text-zinc-300 hover:border-zinc-500',
    danger: 'text-zinc-500 hover:text-red-400',
  }[variant]
  return <button {...props} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${cls} disabled:opacity-40`} />
}

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  )
}

export function useForm(initial: Record<string, string>) {
  const [values, setValues] = useState(initial)
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues(v => ({ ...v, [k]: e.target.value }))
  const reset = () => setValues(initial)
  return { values, setValues, set, reset }
}
