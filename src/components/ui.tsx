import { useState } from 'react'

export function Input({ label, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block group">
      {label && <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{label}</span>}
      <input {...props} className={`w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/50 focus:bg-zinc-900 focus:ring-2 focus:ring-emerald-500/10 group-focus-within:text-zinc-100 ${className}`} />
    </label>
  )
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' | 'success'; size?: 'sm' | 'md' | 'lg' }) {
  const variants = {
    primary: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.98]',
    ghost: 'border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100',
    danger: 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10',
    success: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
  }
  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }
  return <button {...props} className={`rounded-lg font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`} />
}

export function Card({ title, icon, children, className = '' }: { title: string; icon?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm overflow-hidden ${className}`}>
      <div className="flex items-center gap-2.5 border-b border-zinc-800/60 bg-zinc-800/30 px-5 py-4">
        {icon && <span className="text-lg">{icon}</span>}
        <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

export function useForm<T extends Record<string, string>>(initial: T) {
  const [values, setValues] = useState<T>(initial)
  const set = (k: keyof T) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues(v => ({ ...v, [k]: e.target.value }))
  const reset = () => setValues(initial)
  return { values, setValues, set, reset }
}

export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'emerald' | 'amber' | 'red' | 'sky' }) {
  const styles = {
    default: 'bg-zinc-800 text-zinc-400',
    emerald: 'bg-emerald-500/15 text-emerald-400',
    amber: 'bg-amber-500/15 text-amber-400',
    red: 'bg-red-500/15 text-red-400',
    sky: 'bg-sky-500/15 text-sky-400',
  }
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${styles[variant]}`}>{children}</span>
}

export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="mb-2 text-4xl opacity-30">{icon}</div>
      <p className="text-sm text-zinc-500">{message}</p>
    </div>
  )
}