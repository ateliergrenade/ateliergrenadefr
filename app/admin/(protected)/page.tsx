'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Atelier } from '@/types/atelier.types'
import { AtelierFormData } from '@/lib/validations'
import { AtelierTable } from '@/components/admin/AtelierTable'
import { AtelierForm } from '@/components/admin/AtelierForm'
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog'
import { SessionManager } from '@/components/admin/SessionManager'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, LogOut } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'

export default function AdminPage() {
  const [ateliers, setAteliers] = useState<Atelier[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sessionsDialogOpen, setSessionsDialogOpen] = useState(false)
  const [selectedAtelier, setSelectedAtelier] = useState<Atelier | null>(null)
  const [atelierToDelete, setAtelierToDelete] = useState<Atelier | null>(null)
  const [atelierForSessions, setAtelierForSessions] = useState<Atelier | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Fetch ateliers
  const fetchAteliers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ateliers')
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des ateliers')
      }

      const data = await response.json()
      setAteliers(data)
    } catch (err) {
      console.error('Error fetching ateliers:', err)
      setError('Erreur lors du chargement des ateliers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAteliers()
  }, [])

  // Handle create/update
  const handleSubmit = async (data: AtelierFormData) => {
    try {
      setActionLoading(true)
      setError('')

      const url = selectedAtelier
        ? `/api/ateliers/${selectedAtelier.id}`
        : '/api/ateliers'
      
      const method = selectedAtelier ? 'PATCH' : 'POST'

      const response = await adminFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Erreur lors de l\'enregistrement')
        return
      }

      // Refresh list and close dialog
      await fetchAteliers()
      setFormOpen(false)
      setSelectedAtelier(null)
    } catch (err) {
      console.error('Error saving atelier:', err)
      setError('Erreur lors de l\'enregistrement')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!atelierToDelete) return

    try {
      setActionLoading(true)
      setError('')

      const response = await adminFetch(`/api/ateliers/${atelierToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        setError(result.error || 'Erreur lors de la suppression')
        return
      }

      // Refresh list and close dialog
      await fetchAteliers()
      setDeleteDialogOpen(false)
      setAtelierToDelete(null)
    } catch (err) {
      console.error('Error deleting atelier:', err)
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
    setSelectedAtelier(null)
    setFormOpen(true)
    setError('')
  }

  // Open edit dialog
  const handleEdit = (atelier: Atelier) => {
    setSelectedAtelier(atelier)
    setFormOpen(true)
    setError('')
  }

  // Open delete dialog
  const handleDeleteClick = (atelier: Atelier) => {
    setAtelierToDelete(atelier)
    setDeleteDialogOpen(true)
    setError('')
  }

  // Open sessions management dialog
  const handleManageSessions = (atelier: Atelier) => {
    setAtelierForSessions(atelier)
    setSessionsDialogOpen(true)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="admin-header mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                ✨ Administration des Ateliers
              </h1>
              <p className="text-white/90 text-sm md:text-base">
                Gérez et organisez les ateliers de l'Atelier Grenade
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm transition-all"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 text-orange-700 rounded-xl shadow-lg animate-slideDown">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
                <span className="text-orange-700 font-bold">!</span>
              </div>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Main Card */}
        <Card className="admin-card border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Liste des ateliers
                </CardTitle>
                <CardDescription className="text-base mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full text-purple-700 font-bold text-sm">
                    {ateliers.length}
                  </span>
                  <span>
                    {ateliers.length} atelier{ateliers.length > 1 ? 's' : ''} au total
                  </span>
                </CardDescription>
              </div>
              <Button 
                onClick={handleCreate}
                className="btn-gradient shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvel atelier
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-4">
                <div className="loading-shimmer h-12 rounded-lg"></div>
                <div className="loading-shimmer h-12 rounded-lg"></div>
                <div className="loading-shimmer h-12 rounded-lg"></div>
              </div>
            ) : (
              <AtelierTable
                ateliers={ateliers}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onManageSessions={handleManageSessions}
              />
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {selectedAtelier ? '✏️ Modifier l\'atelier' : '✨ Nouvel atelier'}
              </DialogTitle>
            </DialogHeader>
            <AtelierForm
              atelier={selectedAtelier}
              onSubmit={handleSubmit}
              onCancel={() => setFormOpen(false)}
              loading={actionLoading}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          atelierTitle={atelierToDelete?.titre || ''}
          loading={actionLoading}
        />

        {/* Sessions Management Dialog */}
        {atelierForSessions && (
          <SessionManager
            atelier={atelierForSessions}
            open={sessionsDialogOpen}
            onOpenChange={(open) => {
              setSessionsDialogOpen(open)
              if (!open) {
                setAtelierForSessions(null)
              }
            }}
          />
        )}
      </div>
    </div>
  )
}

