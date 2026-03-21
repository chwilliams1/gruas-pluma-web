'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Construction } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesion')
        setLoading(false)
        return
      }

      // Store token in cookie for middleware
      document.cookie = `admin_token=${data.token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`
      router.push('/')
      router.refresh()
    } catch {
      setError('No se pudo conectar al servidor')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-amber flex items-center justify-center mb-4">
            <Construction className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Gruas Pluma</h1>
          <p className="text-[13px] text-ink-tertiary mt-1">Panel de Administracion</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface-0 rounded-2xl p-6 border border-edge shadow-sm">
          <div className="mb-4">
            <label className="block text-[13px] font-medium text-ink-secondary mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-edge bg-canvas text-[14px] text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber transition-colors"
              placeholder="admin@gruaspluma.cl"
              required
              autoFocus
            />
          </div>

          <div className="mb-5">
            <label className="block text-[13px] font-medium text-ink-secondary mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-edge bg-canvas text-[14px] text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="mb-4 text-[13px] text-danger bg-danger/10 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-amber text-white font-semibold text-[14px] hover:bg-amber-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesion'}
          </button>
        </form>
      </div>
    </div>
  )
}
