import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

function getSavedSession(): Session | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const raw = localStorage.getItem(key)
        if (!raw) continue
        const parsed = JSON.parse(raw)
        if (parsed?.access_token && parsed?.user) {
          return parsed as Session
        }
      }
    }
  } catch {}
  return null
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(() => getSavedSession())

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSession(data.session)
    }).catch(() => {})

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (s) {
        setSession(s)
        return
      }
      if (event === 'SIGNED_OUT') {
        setSession(null)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  return { session }
}
