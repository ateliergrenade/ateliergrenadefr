'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ReservationWithDetails } from '@/types/reservation.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, Home, CheckCircle2, Clock, XCircle, Calendar } from 'lucide-react'
import Link from 'next/link'
import { adminFetch } from '@/lib/admin-fetch'

export default function ReservationsAdminPage() {
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'en_attente' | 'confirmee' | 'annulee'>('all')
  const router = useRouter()

  // Fetch reservations
  const fetchReservations = async () => {
    try {
      setLoading(true)
      const response = await adminFetch('/api/admin/reservations')

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des réservations')
      }

      const data = await response.json()
      setReservations(data)
    } catch (err) {
      console.error('Error fetching reservations:', err)
      setError('Erreur lors du chargement des réservations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('admin-auth')
    router.push('/admin/login')
    router.refresh()
  }

  // Filter reservations
  const filteredReservations = reservations.filter((r) =>
    filter === 'all' ? true : r.statut === filter
  )

  // Stats
  const stats = {
    total: reservations.length,
    confirmee: reservations.filter((r) => r.statut === 'confirmee').length,
    en_attente: reservations.filter((r) => r.statut === 'en_attente').length,
    annulee: reservations.filter((r) => r.statut === 'annulee').length,
  }

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'confirmee':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Confirmée
          </span>
        )
      case 'en_attente':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </span>
        )
      case 'annulee':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Annulée
          </span>
        )
      default:
        return <span className="text-gray-500">{statut}</span>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="admin-header mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                🎫 Réservations
              </h1>
              <p className="text-white/90 text-sm md:text-base">
                Consultez toutes les réservations
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin">
                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Home className="h-4 w-4 mr-2" />
                  Ateliers
                </Button>
              </Link>
              <Link href="/admin/sessions">
                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  Sessions
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
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 text-orange-700 rounded-xl shadow-lg">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-purple-600">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Confirmées</p>
              <p className="text-3xl font-bold text-green-600">{stats.confirmee}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">En attente</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.en_attente}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Annulées</p>
              <p className="text-3xl font-bold text-red-600">{stats.annulee}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Card */}
        <Card className="admin-card border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Liste des réservations
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  {filteredReservations.length} réservation{filteredReservations.length > 1 ? 's' : ''}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  Toutes
                </Button>
                <Button
                  variant={filter === 'confirmee' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('confirmee')}
                >
                  Confirmées
                </Button>
                <Button
                  variant={filter === 'en_attente' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('en_attente')}
                >
                  En attente
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-4">
                <div className="loading-shimmer h-20 rounded-lg"></div>
                <div className="loading-shimmer h-20 rounded-lg"></div>
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={64} className="mx-auto mb-4 text-gray-400" />
                <p className="text-xl text-gray-600 mb-2">Aucune réservation</p>
                <p className="text-gray-400">Les réservations apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReservations.map((reservation) => {
                  const sessionData = Array.isArray(reservation.session)
                    ? reservation.session[0]
                    : reservation.session
                  const clientData = Array.isArray(reservation.client)
                    ? reservation.client[0]
                    : reservation.client
                  const atelierData =
                    sessionData && 'atelier' in sessionData
                      ? Array.isArray(sessionData.atelier)
                        ? sessionData.atelier[0]
                        : sessionData.atelier
                      : null

                  return (
                    <div key={reservation.id} className="p-4 rounded-lg border-2 bg-white">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-bold text-gray-900">
                              {atelierData?.titre || 'Atelier inconnu'}
                            </h3>
                            {getStatusBadge(reservation.statut)}
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <p className="font-semibold">Client</p>
                                <p>
                                  {clientData?.prenom} {clientData?.nom}
                                </p>
                                <p>{clientData?.email}</p>
                                <p>{clientData?.telephone}</p>
                              </div>
                              <div>
                                <p className="font-semibold">Session</p>
                                {sessionData && (
                                  <>
                                    <p>
                                      📅{' '}
                                      {new Date(sessionData.date_debut).toLocaleDateString('fr-FR', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                      })}
                                    </p>
                                    <p>
                                      🕐{' '}
                                      {new Date(sessionData.date_debut).toLocaleTimeString('fr-FR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                            {reservation.montant_paye && (
                              <p className="font-semibold text-green-600">
                                Montant payé: {reservation.montant_paye} €
                              </p>
                            )}
                            <p className="text-xs text-gray-400">
                              Créée le {new Date(reservation.created_at!).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


