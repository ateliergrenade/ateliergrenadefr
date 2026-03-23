'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  atelierTitle: string
  loading?: boolean
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  atelierTitle,
  loading = false,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2" style={{ background: '#f8f5f2', borderColor: '#e8e4df' }}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(200, 16, 46, 0.08)' }}>
              <AlertTriangle className="h-5 w-5" style={{ color: '#c8102e' }} />
            </div>
            <DialogTitle className="text-xl font-bold" style={{ color: '#2c2c2c', fontFamily: 'var(--font-playfair), serif' }}>
              Confirmer la suppression
            </DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2" style={{ color: '#6b7280', fontFamily: 'var(--font-crimson), serif' }}>
            Êtes-vous sûr de vouloir supprimer l'atelier{' '}
            <span className="font-semibold px-2 py-0.5 rounded" style={{ color: '#2c2c2c', background: 'white' }}>
              « {atelierTitle} »
            </span>{' '}
            ?
            <br />
            <span className="inline-block mt-2 font-medium" style={{ color: '#c8102e' }}>
              Cette action est irréversible.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-2 transition-all"
            style={{ borderColor: '#d1d5db' }}
          >
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="text-white border-0 transition-all"
            style={{ background: '#c8102e' }}
          >
            {loading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
