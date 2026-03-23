'use client'

import { Atelier } from '@/types/atelier.types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Calendar, ArrowUp, ArrowDown } from 'lucide-react'

interface AtelierTableProps {
  ateliers: Atelier[]
  onEdit: (atelier: Atelier) => void
  onDelete: (atelier: Atelier) => void
  onManageSessions?: (atelier: Atelier) => void
  onReorder?: (orderedIds: string[]) => void
}

export function AtelierTable({ ateliers, onEdit, onDelete, onManageSessions, onReorder }: AtelierTableProps) {
  const handleMoveUp = (index: number) => {
    if (index === 0 || !onReorder) return
    const ids = ateliers.map(a => a.id)
    ;[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]]
    onReorder(ids)
  }

  const handleMoveDown = (index: number) => {
    if (index === ateliers.length - 1 || !onReorder) return
    const ids = ateliers.map(a => a.id)
    ;[ids[index], ids[index + 1]] = [ids[index + 1], ids[index]]
    onReorder(ids)
  }

  if (ateliers.length === 0) {
    return (
      <div className="text-center py-16">
        <Calendar size={48} className="mx-auto mb-4" style={{ color: '#2d5a3d', opacity: 0.3 }} />
        <p className="text-lg font-medium mb-2" style={{ color: '#2c2c2c', fontFamily: 'var(--font-playfair), serif' }}>
          Aucun atelier pour le moment
        </p>
        <p className="text-sm" style={{ color: '#6b7280' }}>
          Créez votre premier atelier pour commencer
        </p>
      </div>
    )
  }

  return (
    <div className="border-2 rounded-lg overflow-hidden" style={{ borderColor: '#e8e4df' }}>
      <Table>
        <TableHeader>
          <TableRow style={{ background: '#fafaf8' }}>
            <TableHead className="font-bold w-[80px]" style={{ color: '#2d5a3d', fontFamily: 'var(--font-playfair), serif' }}>Ordre</TableHead>
            <TableHead className="font-bold" style={{ color: '#2d5a3d', fontFamily: 'var(--font-playfair), serif' }}>Titre</TableHead>
            <TableHead className="font-bold" style={{ color: '#2d5a3d', fontFamily: 'var(--font-playfair), serif' }}>Slug</TableHead>
            <TableHead className="font-bold" style={{ color: '#2d5a3d', fontFamily: 'var(--font-playfair), serif' }}>Prix</TableHead>
            <TableHead className="font-bold" style={{ color: '#2d5a3d', fontFamily: 'var(--font-playfair), serif' }}>Description</TableHead>
            <TableHead className="text-right font-bold" style={{ color: '#2d5a3d', fontFamily: 'var(--font-playfair), serif' }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ateliers.map((atelier, index) => (
            <TableRow
              key={atelier.id}
              className="table-row-hover"
              style={{ borderBottom: '1px solid #e8e4df' }}
            >
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="h-6 w-6 p-0"
                    title="Monter"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === ateliers.length - 1}
                    className="h-6 w-6 p-0"
                    title="Descendre"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
              <TableCell className="font-semibold" style={{ color: '#2c2c2c' }}>
                {atelier.titre}
              </TableCell>
              <TableCell>
                <span className="badge-slug">
                  {atelier.slug}
                </span>
              </TableCell>
              <TableCell>
                <span className="price-tag">
                  {atelier.prix.toFixed(2)} €
                </span>
              </TableCell>
              <TableCell className="max-w-xs">
                <p className="truncate text-sm" style={{ color: '#6b7280' }}>
                  {atelier.description_courte}
                </p>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  {onManageSessions && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onManageSessions(atelier)}
                      className="action-button border-2 hover:bg-[#2d5a3d] hover:text-white hover:border-[#2d5a3d]"
                      style={{ borderColor: '#d1d5db', background: 'white' }}
                      title="Gérer les sessions"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(atelier)}
                    className="edit-btn action-button border-2"
                    style={{ borderColor: '#d1d5db', background: 'white' }}
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(atelier)}
                    className="delete-btn action-button border-2"
                    style={{ borderColor: '#d1d5db', background: 'white' }}
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
