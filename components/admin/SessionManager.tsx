'use client'

import { useEffect, useState } from 'react'
import { Atelier } from '@/types/atelier.types'
import { SessionAtelierWithAtelier } from '@/types/reservation.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Calendar, X } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'

interface SessionManagerProps {
  atelier: Atelier
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SessionManager({ atelier, open, onOpenChange }: SessionManagerProps) {
  const [sessions, setSessions] = useState<SessionAtelierWithAtelier[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<SessionAtelierWithAtelier | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    date_debut: '',
    date_fin: '',
    places_disponibles: 10,
  })

  // Fetch sessions for this atelier
  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await adminFetch(`/api/admin/sessions?atelier_id=${atelier.id}`)

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des sessions')
      }

      const data = await response.json()
      setSessions(data)
    } catch (err) {
      console.error('Error fetching sessions:', err)
      setError('Erreur lors du chargement des sessions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchSessions()
    }
  }, [open, atelier.id])

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

      // Convert datetime-local format to ISO 8601 format
      // datetime-local returns YYYY-MM-DDTHH:mm format (local time)
      // We need to convert it to ISO 8601 format with timezone
      if (!formData.date_debut || !formData.date_fin) {
        setError('Veuillez remplir tous les champs')
        setActionLoading(false)
        return
      }

      const dateDebutISO = new Date(formData.date_debut).toISOString()
      const dateFinISO = new Date(formData.date_fin).toISOString()

      // Validate that dates are valid
      if (isNaN(new Date(formData.date_debut).getTime()) || isNaN(new Date(formData.date_fin).getTime())) {
        setError('Les dates saisies sont invalides')
        setActionLoading(false)
        return
      }

      // Validate that end date is after start date
      if (new Date(formData.date_fin) <= new Date(formData.date_debut)) {
        setError('La date de fin doit être après la date de début')
        setActionLoading(false)
        return
      }

      const payload = selectedSession
        ? {
            date_debut: dateDebutISO,
            date_fin: dateFinISO,
            places_disponibles: formData.places_disponibles,
          }
        : {
            atelier_id: atelier.id,
            date_debut: dateDebutISO,
            date_fin: dateFinISO,
            places_disponibles: formData.places_disponibles,
          }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Erreur lors de l\'enregistrement')
        return
      }

      // Refresh list and close dialog
      await fetchSessions()
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

      await fetchSessions()
    } catch (err) {
      console.error('Error deleting session:', err)
      setError('Erreur lors de la suppression')
    } finally {
      setActionLoading(false)
    }
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
      date_debut: new Date(session.date_debut).toISOString().slice(0, 16),
      date_fin: new Date(session.date_fin).toISOString().slice(0, 16),
      places_disponibles: session.places_disponibles,
    })
    setFormOpen(true)
    setError('')
  }

  const resetForm = () => {
    setFormData({
      date_debut: '',
      date_fin: '',
      places_disponibles: 10,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            📅 Sessions - {atelier.titre}
          </DialogTitle>
        </DialogHeader>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 text-orange-700 rounded-xl">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Sessions List */}
        <Card className="border-0 shadow-none">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 pb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-xl font-bold">Sessions planifiées</CardTitle>
                <CardDescription className="text-sm mt-1">
                  {sessions.length} session{sessions.length > 1 ? 's' : ''} au total
                </CardDescription>
              </div>
              <Button onClick={handleCreate} className="btn-gradient shadow-lg" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle session
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {loading ? (
              <div className="space-y-4">
                <div className="loading-shimmer h-16 rounded-lg"></div>
                <div className="loading-shimmer h-16 rounded-lg"></div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg text-gray-600 mb-2">Aucune session planifiée</p>
                <p className="text-gray-400 text-sm">Créez votre première session pour cet atelier</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => {
                  const dateDebut = new Date(session.date_debut)
                  const dateFin = new Date(session.date_fin)
                  const isPast = dateDebut < new Date()

                  return (
                    <div
                      key={session.id}
                      className={`p-4 rounded-lg border-2 ${
                        isPast
                          ? 'bg-gray-50 border-gray-200 opacity-75'
                          : 'bg-white border-purple-200'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="space-y-1 text-sm">
                            <p className="font-semibold text-gray-900">
                              📅 {dateDebut.toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="text-gray-600">
                              🕐 {dateDebut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} -{' '}
                              {dateFin.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-gray-600">
                              👥 {session.places_disponibles} place(s) disponible(s)
                            </p>
                            {isPast && (
                              <p className="text-xs text-gray-500 italic">Session passée</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(session)}
                            disabled={actionLoading}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(session)}
                            disabled={actionLoading}
                            className="text-red-600 hover:bg-red-50"
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

        {/* Create/Edit Session Dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-w-md bg-white border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                {selectedSession ? (
                  <>
                    <span>✏️</span> Modifier la session
                  </>
                ) : (
                  <>
                    <span>✨</span> Nouvelle session
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="date_debut" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="text-purple-500">📅</span> Date et heure de début *
                </Label>
                <Input
                  id="date_debut"
                  type="datetime-local"
                  value={formData.date_debut}
                  onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  className="input-focus border-2 hover:border-purple-200 transition-all bg-white text-black"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_fin" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="text-indigo-500">🕐</span> Date et heure de fin *
                </Label>
                <Input
                  id="date_fin"
                  type="datetime-local"
                  value={formData.date_fin}
                  onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                  className="input-focus border-2 hover:border-indigo-200 transition-all bg-white text-black"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="places_disponibles" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="text-cyan-500">👥</span> Places disponibles *
                </Label>
                <Input
                  id="places_disponibles"
                  type="number"
                  min="0"
                  value={formData.places_disponibles}
                  onChange={(e) =>
                    setFormData({ ...formData, places_disponibles: parseInt(e.target.value) || 0 })
                  }
                  className="input-focus border-2 hover:border-cyan-200 transition-all bg-white text-black"
                  required
                />
                <p className="text-xs text-gray-500 flex items-center gap-1 bg-gray-50 p-2 rounded-lg">
                  <span>💡</span>
                  Nombre de places disponibles pour cette session
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setFormOpen(false)}
                  disabled={actionLoading}
                  className="transition-all hover:bg-gray-100"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  className="btn-gradient shadow-lg hover:shadow-xl transition-all hover:scale-105" 
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Enregistrement...
                    </span>
                  ) : selectedSession ? (
                    <span className="flex items-center gap-2">
                      <span>✏️</span> Mettre à jour
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>✨</span> Créer
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}

