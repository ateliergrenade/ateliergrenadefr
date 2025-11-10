'use client'

import { useState, useRef, useCallback } from 'react'
import { AtelierImage } from '@/types/atelier.types'
import { Button } from '@/components/ui/button'
import { Upload, X, Star, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { adminFetch } from '@/lib/admin-fetch'

interface ImageUploaderProps {
  atelierId: string | null
  images: (AtelierImage & { url: string })[]
  onImagesChange: () => void
  disabled?: boolean
}

export function ImageUploader({ atelierId, images, onImagesChange, disabled = false }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [atelierId])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }, [atelierId])

  const handleFiles = async (files: FileList) => {
    if (!atelierId) {
      alert('Veuillez d\'abord enregistrer l\'atelier avant d\'ajouter des images')
      return
    }

    const file = files[0]

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image')
      return
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB')
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('is_cover', images.length === 0 ? 'true' : 'false') // Première image = cover par défaut

      const response = await adminFetch(`/api/ateliers/${atelierId}/images`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de l\'upload')
      }

      onImagesChange()
    } catch (error) {
      console.error('Error uploading image:', error)
      alert(error instanceof Error ? error.message : 'Erreur lors de l\'upload de l\'image')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (imageId: string) => {
    if (!atelierId) return

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      return
    }

    try {
      setDeleting(imageId)

      const response = await adminFetch(`/api/ateliers/${atelierId}/images?imageId=${imageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la suppression')
      }

      onImagesChange()
    } catch (error) {
      console.error('Error deleting image:', error)
      alert(error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'image')
    } finally {
      setDeleting(null)
    }
  }

  const handleSetCover = async (imageId: string) => {
    if (!atelierId) return

    try {
      const response = await adminFetch(`/api/ateliers/${atelierId}/images/${imageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_cover: true }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la mise à jour')
      }

      onImagesChange()
    } catch (error) {
      console.error('Error setting cover:', error)
      alert(error instanceof Error ? error.message : 'Erreur lors de la définition de l\'image de couverture')
    }
  }

  const onButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-emerald-500">🖼️</span> Images de l'atelier
        </label>
        {!atelierId && (
          <p className="text-xs text-orange-600">
            Enregistrez d'abord l'atelier pour ajouter des images
          </p>
        )}
      </div>

      {/* Zone de drop */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50'
        } ${disabled || !atelierId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-purple-400'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!disabled && atelierId ? onButtonClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={disabled || !atelierId}
        />

        <div className="flex flex-col items-center gap-2">
          <Upload className="h-10 w-10 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              {uploading ? 'Upload en cours...' : 'Cliquez ou glissez une image ici'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF jusqu'à 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Liste des images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {images.map((image) => (
            <div
              key={image.id}
              className={`relative group rounded-lg overflow-hidden border-2 ${
                image.is_cover ? 'border-yellow-400' : 'border-gray-200'
              } hover:border-purple-400 transition-colors`}
            >
              <div className="aspect-square relative bg-gray-100">
                <Image
                  src={image.url}
                  alt="Image atelier"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>

              {/* Badge cover */}
              {image.is_cover && (
                <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Couverture
                </div>
              )}

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!image.is_cover && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="bg-white/90 hover:bg-white"
                    onClick={() => handleSetCover(image.id)}
                    disabled={disabled}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="bg-white/90 hover:bg-white text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(image.id)}
                  disabled={disabled || deleting === image.id}
                >
                  {deleting === image.id ? '...' : <X className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && atelierId && (
        <div className="text-center py-8 text-gray-500 text-sm">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          Aucune image pour cet atelier
        </div>
      )}
    </div>
  )
}
