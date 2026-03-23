'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SessionAtelierWithAtelier } from '@/types/reservation.types'
import { Atelier } from '@/types/atelier.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Calendar, LogOut, Home } from 'lucide-react'
import Link from 'next/link'
import { adminFetch } from '@/lib/admin-fetch'

export default function SessionsAdminPage() {
  const [sessions, setSessions] = useState<SessionAtelierWithAtelier[]>([])
  const [ateliers, setAteliers] = useState<Atelier[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<SessionAtelierWithAtelier | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    atelier_id: '',
    date_debut: '',
    date_fin: '',
    places_disponibles: 10,
  })

  // Fetch sessions and ateliers
  const fetchData = async () => {
    try {
      setLoading(true)
      const [sessionsRes, ateliersRes] = await Promise.all([
        adminFetch('/api/admin/sessions'),
        fetch('/api/ateliers'),
      ])

      if (!sessionsRes.ok || !ateliersRes.ok) {
        throw new Error('Erreur lors du chargement des données')
      }

      const sessionsData = await sessionsRes.json()
      const ateliersData = await ateliersRes.json()

      setSessions(sessionsData)
      setAteliers(ateliersData)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Handle create/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setActionLoading(true)
      setError('')

      const url = selectedSession
        ? `/api/admin/sessions/${selectedSession.id}`
        : '/api/admin/sessions'

      const method = selectedSession ? 'PATCH' : 'POST'

      const response = await adminFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Erreur lors de l\'enregistrement')
        return
      }

      // Refresh list and close dialog
      await fetchData()
      setFormOpen(false)
      setSelectedSession(null)
      resetForm()
    } catch (err) {
      console.error('Error saving session:', err)
      setError('Erreur lors de l\'enregistrement')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async (session: SessionAtelierWithAtelier) => {
    if (!confirm(`Supprimer cette session ? Cette action est irréversible.`)) return

    try {
      setActionLoading(true)
      setError('')

      const response = await adminFetch(`/api/admin/sessions/${session.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        setError(result.error || 'Erreur lors de la suppression')
        return
      }

      await fetchData()
    } catch (err) {
      console.error('Error deleting session:', err)
      setError('Erreur lors de la suppression')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('admin-auth')
    router.push('/admin/login')
    router.refresh()
  }

  // Open create dialog
  const handleCreate = () => {
    setSelectedSession(null)
    resetForm()
    setFormOpen(true)
    setError('')
  }

  // Open edit dialog
  const handleEdit = (session: SessionAtelierWithAtelier) => {
    setSelectedSession(session)
    setFormData({
      atelier_id: session.atelier_id,
      date_debut: new Date(session.date_debut).toISOString().slice(0, 16),
      date_fin: new Date(session.date_fin).toISOString().slice(0, 16),
      places_disponibles: session.places_disponibles,
    })
    setFormOpen(true)
    setError('')
  }

  const resetForm = () => {
    setFormData({
      atelier_id: '',
      date_debut: '',
      date_fin: '',
      places_disponibles: 10,
    })
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: '#f8f5f2', color: '#1f2937' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="admin-header mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                Sessions
              </h1>
              <p className="text-white/80 text-sm md:text-base" style={{ fontFamily: 'var(--font-crimson), serif' }}>
                Planifiez et gérez les sessions d'ateliers
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin">
                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Home className="h-4 w-4 mr-2" />
                  Ateliers
                </Button>
              </Link>
              <Link href="/admin/reservations">
                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  Réservations
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout} className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border-2" style={{ background: 'rgba(200, 16, 46, 0.04)', borderColor: 'rgba(200, 16, 46, 0.2)', color: '#c8102e' }}>
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Main Card */}
        <Card className="admin-card border-0">
          <CardHeader className="border-b pb-6" style={{ borderColor: '#e8e4df', background: 'white' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold" style={{ color: '#2d5a3d', fontFamily: 'var(--font-playfair), serif' }}>
                  Sessions planifiées
                </CardTitle>
                <CardDescription className="text-base mt-2" style={{ fontFamily: 'var(--font-crimson), serif' }}>
                  {sessions.length} session{sessions.length > 1 ? 's' : ''} au total
                </CardDescription>
              </div>
              <Button onClick={handleCreate} className="btn-gradient">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle session
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-4">
                <div className="loading-shimmer h-12 rounded-lg"></div>
                <div className="loading-shimmer h-12 rounded-lg"></div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto mb-4" style={{ color: '#2d5a3d', opacity: 0.3 }} />
                <p className="text-lg mb-2" style={{ color: '#2c2c2c', fontFamily: 'var(--font-playfair), serif' }}>Aucune session planifiée</p>
                <p className="text-sm" style={{ color: '#6b7280' }}>Créez votre première session pour commencer</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => {
                  const atelierData = Array.isArray(session.atelier) ? session.atelier[0] : session.atelier
                  const dateDebut = new Date(session.date_debut)
                  const dateFin = new Date(session.date_fin)
                  const isPast = dateDebut < new Date()

                  return (
                    <div
                      key={session.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isPast ? 'opacity-60' : ''
                      }`}
                      style={{
                        background: isPast ? '#fafaf8' : 'white',
                        borderColor: isPast ? '#e8e4df' : 'rgba(45, 90, 61, 0.2)',
                      }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold" style={{ color: '#2c2c2c', fontFamily: 'var(--font-playfair), serif' }}>
                            {atelierData?.titre || 'Atelier supprimé'}
                          </h3>
                          <div className="mt-2 space-y-1 text-sm" style={{ color: '#6b7280', fontFamily: 'var(--font-crimson), serif' }}>
                            <p>
                              {dateDebut.toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                            <p>
                              {dateDebut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} –{' '}
                              {dateFin.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p>{session.places_disponibles} place(s) disponible(s)</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(session)}
                            disabled={actionLoading}
                            className="border-2 hover:bg-[#2d5a3d] hover:text-white hover:border-[#2d5a3d] transition-all"
                            style={{ borderColor: '#d1d5db' }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(session)}
                            disabled={actionLoading}
                            className="border-2 hover:bg-[#c8102e] hover:text-white hover:border-[#c8102e] transition-all"
                            style={{ borderColor: '#d1d5db', color: '#c8102e' }}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-w-md border-2" style={{ background: '#f8f5f2', borderColor: '#e8e4df' }}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold" style={{ color: '#2d5a3d', fontFamily: 'var(--font-playfair), serif' }}>
                {selectedSession ? 'Modifier la session' : 'Nouvelle session'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="atelier_id" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>Atelier</Label>
                <select
                  id="atelier_id"
                  value={formData.atelier_id}
                  onChange={(e) => setFormData({ ...formData, atelier_id: e.target.value })}
                  className="w-full mt-1 p-2 h-12 border-2 rounded-lg transition-all"
                  style={{ borderColor: '#d1d5db', background: 'white', color: '#1f2937' }}
                  required
                >
                  <option value="">Sélectionnez un atelier</option>
                  {ateliers.map((atelier) => (
                    <option key={atelier.id} value={atelier.id}>
                      {atelier.titre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_debut" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>Date et heure de début</Label>
                <Input
                  id="date_debut"
                  type="datetime-local"
                  value={formData.date_debut}
                  onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  required
                  className="h-12 border-2 transition-all"
                  style={{ borderColor: '#d1d5db', background: 'white', color: '#1f2937' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_fin" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>Date et heure de fin</Label>
                <Input
                  id="date_fin"
                  type="datetime-local"
                  value={formData.date_fin}
                  onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                  required
                  className="h-12 border-2 transition-all"
                  style={{ borderColor: '#d1d5db', background: 'white', color: '#1f2937' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="places_disponibles" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>Places disponibles</Label>
                <Input
                  id="places_disponibles"
                  type="number"
                  min="0"
                  value={formData.places_disponibles}
                  onChange={(e) => setFormData({ ...formData, places_disponibles: parseInt(e.target.value) })}
                  required
                  className="h-12 border-2 transition-all"
                  style={{ borderColor: '#d1d5db', background: 'white', color: '#1f2937' }}
                />
              </div>

              <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid #e8e4df' }}>
                <Button
                  type="submit"
                  className="flex-1 btn-gradient h-12"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Enregistrement...' : selectedSession ? 'Mettre à jour' : 'Créer'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormOpen(false)}
                  className="h-12 border-2"
                  style={{ borderColor: '#d1d5db' }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
