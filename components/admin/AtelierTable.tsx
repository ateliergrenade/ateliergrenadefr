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
import { Pencil, Trash2, Calendar } from 'lucide-react'

interface AtelierTableProps {
  ateliers: Atelier[]
  onEdit: (atelier: Atelier) => void
  onDelete: (atelier: Atelier) => void
  onManageSessions?: (atelier: Atelier) => void
}

export function AtelierTable({ ateliers, onEdit, onDelete, onManageSessions }: AtelierTableProps) {
  if (ateliers.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full mb-4">
          <span className="text-4xl">📚</span>
        </div>
        <p className="text-gray-600 text-lg font-medium mb-2">
          Aucun atelier pour le moment
        </p>
        <p className="text-gray-400 text-sm">
          Créez votre premier atelier pour commencer !
        </p>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-gray-50 to-white hover:from-gray-50 hover:to-white">
            <TableHead className="font-bold text-gray-700">Titre</TableHead>
            <TableHead className="font-bold text-gray-700">Slug</TableHead>
            <TableHead className="font-bold text-gray-700">Prix</TableHead>
            <TableHead className="font-bold text-gray-700">Description</TableHead>
            <TableHead className="text-right font-bold text-gray-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ateliers.map((atelier, index) => (
            <TableRow 
              key={atelier.id}
              className="table-row-hover border-b border-gray-100 last:border-0"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <TableCell className="font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                  {atelier.titre}
                </div>
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
                <p className="truncate text-gray-600 text-sm">
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
                      className="action-button bg-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 border-gray-300"
                      title="Gérer les sessions"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(atelier)}
                    className="edit-btn action-button bg-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-500 border-gray-300"
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(atelier)}
                    className="delete-btn action-button bg-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 border-gray-300"
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

