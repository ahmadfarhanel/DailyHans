import { useCallback, useEffect, useState } from 'react'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export function useServiceStatus() {
  const [unavailable, setUnavailable] = useState(!navigator.onLine)

  const check = useCallback(async () => {
    if (!navigator.onLine) {
      setUnavailable(true)
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 5000)
    try {
      const response = await fetch(`${url}/rest/v1/`, {
        headers: { apikey: key },
        signal: controller.signal,
      })
      setUnavailable(response.status >= 500)
    } catch {
      setUnavailable(true)
    } finally {
      window.clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    void check()
    const handleOnline = () => void check()
    const handleOffline = () => setUnavailable(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    const interval = window.setInterval(() => void check(), 30000)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.clearInterval(interval)
    }
  }, [check])

  return { unavailable, retry: check }
}
