'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { atelierSchema, type AtelierFormData } from '@/lib/validations'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Atelier, AtelierImage } from '@/types/atelier.types'
import { ImageUploader } from './ImageUploader'

interface AtelierFormProps {
  atelier?: Atelier | null
  onSubmit: (data: AtelierFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function AtelierForm({ atelier, onSubmit, onCancel, loading = false }: AtelierFormProps) {
  const [images, setImages] = useState<(AtelierImage & { url: string })[]>([])
  const [loadingImages, setLoadingImages] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AtelierFormData>({
    resolver: zodResolver(atelierSchema),
    defaultValues: atelier
      ? {
          titre: atelier.titre,
          description_courte: atelier.description_courte,
          description_longue: atelier.description_longue,
          prix: atelier.prix,
          slug: atelier.slug,
          duree: atelier.duree,
          participants_max: atelier.participants_max,
          materiel_fourni: atelier.materiel_fourni,
          niveau_requis: atelier.niveau_requis,
          age_minimum: atelier.age_minimum,
          parent_requis: atelier.parent_requis,
        }
      : {
          materiel_fourni: true,
          parent_requis: false,
        },
  })

  // Charger les images de l'atelier
  const fetchImages = async () => {
    if (!atelier?.id) return

    try {
      setLoadingImages(true)
      const response = await fetch(`/api/ateliers/${atelier.id}/images`)

      if (response.ok) {
        const data = await response.json()
        setImages(data)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoadingImages(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [atelier?.id])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="titre" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-purple-500">✦</span> Titre
        </Label>
        <Input
          id="titre"
          {...register('titre')}
          placeholder="Atelier Céramique"
          className="input-focus border-2 hover:border-purple-200 transition-all !bg-white !text-gray-900 placeholder:text-gray-400"
        />
        {errors.titre && (
          <p className="text-sm text-orange-600 flex items-center gap-1">
            <span>⚠️</span> {errors.titre.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-indigo-500">🔗</span> Slug (URL)
        </Label>
        <Input
          id="slug"
          {...register('slug')}
          placeholder="atelier-ceramique"
          className="input-focus border-2 hover:border-indigo-200 transition-all font-mono !bg-white !text-gray-900 placeholder:text-gray-400"
        />
        {errors.slug && (
          <p className="text-sm text-orange-600 flex items-center gap-1">
            <span>⚠️</span> {errors.slug.message}
          </p>
        )}
        <p className="text-xs text-gray-500 flex items-center gap-1 bg-gray-50 p-2 rounded-lg">
          <span>💡</span>
          Utilisez uniquement des lettres minuscules, des chiffres et des tirets
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prix" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-pink-500">💰</span> Prix (€)
        </Label>
        <Input
          id="prix"
          type="number"
          step="0.01"
          {...register('prix', { valueAsNumber: true })}
          placeholder="50.00"
          className="input-focus border-2 hover:border-pink-200 transition-all !bg-white !text-gray-900 placeholder:text-gray-400"
        />
        {errors.prix && (
          <p className="text-sm text-orange-600 flex items-center gap-1">
            <span>⚠️</span> {errors.prix.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duree" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-amber-500">⏱️</span> Durée
          </Label>
          <Input
            id="duree"
            {...register('duree')}
            placeholder="1h30"
            className="input-focus border-2 hover:border-amber-200 transition-all !bg-white !text-gray-900 placeholder:text-gray-400"
          />
          {errors.duree && (
            <p className="text-sm text-orange-600 flex items-center gap-1">
              <span>⚠️</span> {errors.duree.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="participants_max" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-cyan-500">👥</span> Participants max
          </Label>
          <Input
            id="participants_max"
            type="number"
            {...register('participants_max', { valueAsNumber: true })}
            placeholder="6"
            className="input-focus border-2 hover:border-cyan-200 transition-all !bg-white !text-gray-900 placeholder:text-gray-400"
          />
          {errors.participants_max && (
            <p className="text-sm text-orange-600 flex items-center gap-1">
              <span>⚠️</span> {errors.participants_max.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="niveau_requis" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-teal-500">📊</span> Niveau requis
          </Label>
          <Input
            id="niveau_requis"
            {...register('niveau_requis')}
            placeholder="Tout niveau accepté"
            className="input-focus border-2 hover:border-teal-200 transition-all !bg-white !text-gray-900 placeholder:text-gray-400"
          />
          {errors.niveau_requis && (
            <p className="text-sm text-orange-600 flex items-center gap-1">
              <span>⚠️</span> {errors.niveau_requis.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="age_minimum" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-lime-500">🎂</span> Âge minimum
          </Label>
          <Input
            id="age_minimum"
            type="number"
            {...register('age_minimum', { 
              setValueAs: (v) => v === '' || v === null ? null : parseInt(v) 
            })}
            placeholder="Optionnel"
            className="input-focus border-2 hover:border-lime-200 transition-all !bg-white !text-gray-900 placeholder:text-gray-400"
          />
          {errors.age_minimum && (
            <p className="text-sm text-orange-600 flex items-center gap-1">
              <span>⚠️</span> {errors.age_minimum.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="materiel_fourni" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-orange-500">🎨</span> Matériel fourni
          </Label>
          <div className="flex items-center gap-2 h-10">
            <input
              id="materiel_fourni"
              type="checkbox"
              {...register('materiel_fourni')}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="text-sm text-gray-600">Oui, le matériel est fourni</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="parent_requis" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-rose-500">👨‍👩‍👧</span> Parent requis
          </Label>
          <div className="flex items-center gap-2 h-10">
            <input
              id="parent_requis"
              type="checkbox"
              {...register('parent_requis')}
              className="w-4 h-4 text-rose-500 border-gray-300 rounded focus:ring-rose-500"
            />
            <span className="text-sm text-gray-600">Oui, un parent doit accompagner</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description_courte" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-blue-500">📝</span> Description courte
        </Label>
        <Textarea
          id="description_courte"
          {...register('description_courte')}
          placeholder="Une brève description de l'atelier..."
          rows={3}
          className="input-focus border-2 hover:border-blue-200 transition-all resize-none !bg-white !text-gray-900 placeholder:text-gray-400"
        />
        {errors.description_courte && (
          <p className="text-sm text-orange-600 flex items-center gap-1">
            <span>⚠️</span> {errors.description_courte.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description_longue" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-green-500">📄</span> Description longue
        </Label>
        <Textarea
          id="description_longue"
          {...register('description_longue')}
          placeholder="Description détaillée de l'atelier..."
          rows={6}
          className="input-focus border-2 hover:border-green-200 transition-all resize-none !bg-white !text-gray-900 placeholder:text-gray-400"
        />
        {errors.description_longue && (
          <p className="text-sm text-orange-600 flex items-center gap-1">
            <span>⚠️</span> {errors.description_longue.message}
          </p>
        )}
      </div>

      {/* Image Uploader */}
      <div className="border-t border-gray-200 pt-6">
        <ImageUploader
          atelierId={atelier?.id || null}
          images={images}
          onImagesChange={fetchImages}
          disabled={loading}
        />
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={loading}
          className="transition-all hover:bg-gray-100"
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="btn-gradient"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span> Enregistrement...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {atelier ? '✏️ Mettre à jour' : '✨ Créer'}
            </span>
          )}
        </Button>
      </div>
    </form>
  )
}

