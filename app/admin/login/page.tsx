'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const ADMIN_PASSWORD = 'ziggy'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('admin-auth') === 'true') {
      router.push('/admin')
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simple client-side validation
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('admin-auth', 'true')
      router.push('/admin')
      router.refresh()
    } else {
      setError('Mot de passe incorrect')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#f8f5f2' }}>
      <Card className="w-full max-w-md border-2" style={{ borderColor: '#e8e4df', background: 'white' }}>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl" style={{ color: '#2d5a3d', fontFamily: 'var(--font-playfair), serif' }}>
            Atelier Grenade
          </CardTitle>
          <CardDescription className="text-base" style={{ color: '#6b7280', fontFamily: 'var(--font-crimson), serif' }}>
            Espace administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Entrez le mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                className="h-12 border-2 transition-all"
                style={{
                  borderColor: '#d1d5db',
                  background: 'white',
                  color: '#1f2937',
                  borderRadius: '0.5rem',
                }}
              />
            </div>

            {error && (
              <div className="text-sm p-3 rounded-lg" style={{ color: '#c8102e', background: 'rgba(200, 16, 46, 0.06)', border: '1px solid rgba(200, 16, 46, 0.2)' }}>
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold transition-all"
              disabled={loading}
              style={{
                background: '#2d5a3d',
                color: 'white',
                borderRadius: '0.5rem',
              }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
