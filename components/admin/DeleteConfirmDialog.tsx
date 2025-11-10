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
      <DialogContent className="border-0 shadow-2xl bg-white">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Confirmer la suppression
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-gray-600 pt-2">
            Êtes-vous sûr de vouloir supprimer l'atelier{' '}
            <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
              "{atelierTitle}"
            </span>{' '}
            ?
            <br />
            <span className="inline-flex items-center gap-1 mt-2 text-red-600 font-medium">
              <span>🚫</span> Cette action est irréversible.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="transition-all hover:bg-gray-100"
          >
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Suppression...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>🗑️</span> Supprimer
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

