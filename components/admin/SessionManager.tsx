'use client'

import { useEffect, useState } from 'react'
import { Atelier } from '@/types/atelier.types'
import { SessionAtelierWithAtelier } from '@/types/reservation.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Calendar, MapPin } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'

interface SessionManagerProps {
  atelier: Atelier
  open: boolean
  onOpenChange: (open: boolean) => void
}

const inputStyle = {
  borderColor: '#d1d5db',
  background: 'white',
  color: '#1f2937',
}

export function SessionManager({ atelier, open, onOpenChange }: SessionManagerProps) {
  const [sessions, setSessions] = useState<SessionAtelierWithAtelier[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<SessionAtelierWithAtelier | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    date: '',
    heure_debut: '',
    duree: 120,
    places_totales: 10,
    places_prises: 0,
    adresse: '',
  })
  const [existingAddresses, setExistingAddresses] = useState<string[]>([])
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)

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

  const fetchAddresses = async () => {
    try {
      const response = await adminFetch('/api/admin/addresses')
      if (response.ok) {
        const data = await response.json()
        setExistingAddresses(data)
      }
    } catch (err) {
      console.error('Error fetching addresses:', err)
    }
  }

  useEffect(() => {
    if (open) {
      fetchSessions()
      fetchAddresses()
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

      if (!formData.date || !formData.heure_debut || !formData.duree) {
        setError('Veuillez remplir tous les champs')
        setActionLoading(false)
        return
      }

      const dateDebut = new Date(`${formData.date}T${formData.heure_debut}`)
      if (isNaN(dateDebut.getTime())) {
        setError('La date ou l\'heure saisie est invalide')
        setActionLoading(false)
        return
      }

      const dateFin = new Date(dateDebut.getTime() + formData.duree * 60 * 1000)
      const dateDebutISO = dateDebut.toISOString()
      const dateFinISO = dateFin.toISOString()

      const places_disponibles = Math.max(0, formData.places_totales - formData.places_prises)

      const adresse = formData.adresse.trim() || null

      const payload = selectedSession
        ? {
            date_debut: dateDebutISO,
            date_fin: dateFinISO,
            places_disponibles,
            places_totales: formData.places_totales,
            adresse,
          }
        : {
            atelier_id: atelier.id,
            date_debut: dateDebutISO,
            date_fin: dateFinISO,
            places_disponibles,
            places_totales: formData.places_totales,
            adresse,
          }

      const response = await adminFetch(url, {
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
    const debut = new Date(session.date_debut)
    const fin = new Date(session.date_fin)
    const dureeMinutes = Math.round((fin.getTime() - debut.getTime()) / (60 * 1000))
    const placesTotales = session.places_totales || session.places_disponibles
    setFormData({
      date: debut.toISOString().slice(0, 10),
      heure_debut: debut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }),
      duree: dureeMinutes,
      places_totales: placesTotales,
      places_prises: placesTotales - session.places_disponibles,
      adresse: session.adresse || '',
    })
    setFormOpen(true)
    setError('')
  }

  const resetForm = () => {
    setFormData({
      date: '',
      heure_debut: '',
      duree: 120,
      places_totales: 10,
      places_prises: 0,
      adresse: '',
    })
  }

  const filteredAddresses = existingAddresses.filter(
    (addr) => addr.toLowerCase().includes(formData.adresse.toLowerCase()) && addr !== formData.adresse
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-2" style={{ background: '#f8f5f2', borderColor: '#e8e4df' }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" style={{ color: '#2d5a3d', fontFamily: 'var(--font-playfair), serif' }}>
            Sessions — {atelier.titre}
          </DialogTitle>
        </DialogHeader>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg border-2" style={{ background: 'rgba(200, 16, 46, 0.04)', borderColor: 'rgba(200, 16, 46, 0.2)', color: '#c8102e' }}>
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Sessions List */}
        <Card className="border-0 shadow-none" style={{ background: 'transparent' }}>
          <CardHeader className="border-b pb-4" style={{ borderColor: '#e8e4df' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-xl font-bold" style={{ color: '#2c2c2c', fontFamily: 'var(--font-playfair), serif' }}>
                  Sessions planifiées
                </CardTitle>
                <CardDescription className="text-sm mt-1" style={{ fontFamily: 'var(--font-crimson), serif' }}>
                  {sessions.length} session{sessions.length > 1 ? 's' : ''} au total
                </CardDescription>
              </div>
              <Button onClick={handleCreate} className="btn-gradient" size="sm">
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
                <Calendar size={48} className="mx-auto mb-4" style={{ color: '#2d5a3d', opacity: 0.3 }} />
                <p className="text-lg mb-2" style={{ color: '#2c2c2c', fontFamily: 'var(--font-playfair), serif' }}>Aucune session planifiée</p>
                <p className="text-sm" style={{ color: '#6b7280' }}>Créez votre première session pour cet atelier</p>
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
                      className={`p-4 rounded-lg border-2 transition-all ${isPast ? 'opacity-60' : ''}`}
                      style={{
                        background: isPast ? '#fafaf8' : 'white',
                        borderColor: isPast ? '#e8e4df' : 'rgba(45, 90, 61, 0.2)',
                      }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="space-y-1 text-sm" style={{ fontFamily: 'var(--font-crimson), serif' }}>
                            <p className="font-semibold" style={{ color: '#2c2c2c' }}>
                              {dateDebut.toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                            <p style={{ color: '#6b7280' }}>
                              {dateDebut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} –{' '}
                              {dateFin.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p style={{ color: '#6b7280' }}>
                              {(session.places_totales || session.places_disponibles) - session.places_disponibles}/{session.places_totales || session.places_disponibles} place(s) prise(s)
                              {session.places_disponibles === 0 && (
                                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: '#c8102e', background: 'rgba(200, 16, 46, 0.08)' }}>Complet</span>
                              )}
                            </p>
                            {session.adresse && (
                              <p className="flex items-center gap-1" style={{ color: '#6b7280' }}>
                                <MapPin size={12} className="flex-shrink-0" />
                                {session.adresse}
                              </p>
                            )}
                            {isPast && (
                              <p className="text-xs italic" style={{ color: '#9ca3af' }}>Session passée</p>
                            )}
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

        {/* Create/Edit Session Dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-w-md border-2" style={{ background: '#f8f5f2', borderColor: '#e8e4df' }}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold" style={{ color: '#2d5a3d', fontFamily: 'var(--font-playfair), serif' }}>
                {selectedSession ? 'Modifier la session' : 'Nouvelle session'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-focus border-2 h-12 transition-all hover:border-[#2d5a3d]/30"
                  style={inputStyle}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="heure_debut" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>
                  Heure de début
                </Label>
                <Input
                  id="heure_debut"
                  type="time"
                  value={formData.heure_debut}
                  onChange={(e) => setFormData({ ...formData, heure_debut: e.target.value })}
                  className="input-focus border-2 h-12 transition-all hover:border-[#2d5a3d]/30"
                  style={inputStyle}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duree" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>
                  Durée (en minutes)
                </Label>
                <Input
                  id="duree"
                  type="number"
                  min="15"
                  step="15"
                  value={formData.duree}
                  onChange={(e) =>
                    setFormData({ ...formData, duree: parseInt(e.target.value) || 0 })
                  }
                  className="input-focus border-2 h-12 transition-all hover:border-[#2d5a3d]/30"
                  style={inputStyle}
                  required
                />
                <p className="text-xs p-2 rounded-lg" style={{ color: '#6b7280', background: 'rgba(45, 90, 61, 0.04)' }}>
                  Ex : 120 = 2h, 90 = 1h30
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="places_totales" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>
                  Places totales
                </Label>
                <Input
                  id="places_totales"
                  type="number"
                  min="1"
                  value={formData.places_totales}
                  onChange={(e) => {
                    const newTotal = parseInt(e.target.value) || 0
                    setFormData({
                      ...formData,
                      places_totales: newTotal,
                      places_prises: Math.min(formData.places_prises, newTotal),
                    })
                  }}
                  className="input-focus border-2 h-12 transition-all hover:border-[#2d5a3d]/30"
                  style={inputStyle}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="places_prises" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>
                  Places prises
                </Label>
                <Input
                  id="places_prises"
                  type="number"
                  min="0"
                  max={formData.places_totales}
                  value={formData.places_prises}
                  onChange={(e) =>
                    setFormData({ ...formData, places_prises: Math.min(parseInt(e.target.value) || 0, formData.places_totales) })
                  }
                  className="input-focus border-2 h-12 transition-all hover:border-[#2d5a3d]/30"
                  style={inputStyle}
                />
                <p className="text-xs p-2 rounded-lg" style={{ color: '#6b7280', background: 'rgba(45, 90, 61, 0.04)' }}>
                  {formData.places_totales - formData.places_prises} place(s) restante(s)
                  {formData.places_prises >= formData.places_totales && (
                    <span className="ml-1 font-semibold" style={{ color: '#c8102e' }}>— Session complète</span>
                  )}
                </p>
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="adresse" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>
                  Adresse
                </Label>
                <Input
                  id="adresse"
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => {
                    setFormData({ ...formData, adresse: e.target.value })
                    setShowAddressSuggestions(true)
                  }}
                  onFocus={() => setShowAddressSuggestions(true)}
                  onBlur={() => {
                    // Delay to allow click on suggestion
                    setTimeout(() => setShowAddressSuggestions(false), 200)
                  }}
                  placeholder="Ex : 12 rue des Ateliers, 75011 Paris"
                  className="input-focus border-2 h-12 transition-all hover:border-[#2d5a3d]/30"
                  style={inputStyle}
                  autoComplete="off"
                />
                {showAddressSuggestions && filteredAddresses.length > 0 && (
                  <div
                    className="absolute z-50 w-full mt-1 rounded-lg border-2 shadow-lg overflow-hidden"
                    style={{ background: 'white', borderColor: '#e8e4df', top: '100%' }}
                  >
                    {filteredAddresses.map((addr) => (
                      <button
                        key={addr}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-[#2d5a3d]/5 transition-colors flex items-center gap-2"
                        style={{ color: '#2c2c2c' }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setFormData({ ...formData, adresse: addr })
                          setShowAddressSuggestions(false)
                        }}
                      >
                        <MapPin size={14} className="flex-shrink-0" style={{ color: '#2d5a3d' }} />
                        {addr}
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-xs p-2 rounded-lg" style={{ color: '#6b7280', background: 'rgba(45, 90, 61, 0.04)' }}>
                  Optionnel — les adresses déjà utilisées sont suggérées
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4" style={{ borderTop: '1px solid #e8e4df' }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormOpen(false)}
                  disabled={actionLoading}
                  className="border-2 transition-all"
                  style={{ borderColor: '#d1d5db' }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="btn-gradient"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Enregistrement...' : selectedSession ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
