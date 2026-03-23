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

const inputStyle = {
  borderColor: '#d1d5db',
  background: 'white',
  color: '#1f2937',
}

const focusClass = 'input-focus border-2 h-12 transition-all hover:border-[#2d5a3d]/30'

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="titre" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>
          Titre
        </Label>
        <Input
          id="titre"
          {...register('titre')}
          placeholder="Atelier Céramique"
          className={focusClass}
          style={inputStyle}
        />
        {errors.titre && (
          <p className="text-sm" style={{ color: '#c8102e' }}>{errors.titre.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>
          Slug (URL)
        </Label>
        <Input
          id="slug"
          {...register('slug')}
          placeholder="atelier-ceramique"
          className={`${focusClass} font-mono`}
          style={inputStyle}
        />
        {errors.slug && (
          <p className="text-sm" style={{ color: '#c8102e' }}>{errors.slug.message}</p>
        )}
        <p className="text-xs p-2 rounded-lg" style={{ color: '#6b7280', background: 'rgba(45, 90, 61, 0.04)' }}>
          Utilisez uniquement des lettres minuscules, des chiffres et des tirets
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prix" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>
          Prix (€)
        </Label>
        <Input
          id="prix"
          type="number"
          step="0.01"
          {...register('prix', { valueAsNumber: true })}
          placeholder="50.00"
          className={focusClass}
          style={inputStyle}
        />
        {errors.prix && (
          <p className="text-sm" style={{ color: '#c8102e' }}>{errors.prix.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duree" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>
            Durée
          </Label>
          <Input
            id="duree"
            {...register('duree')}
            placeholder="1h30"
            className={focusClass}
            style={inputStyle}
          />
          {errors.duree && (
            <p className="text-sm" style={{ color: '#c8102e' }}>{errors.duree.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="participants_max" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>
            Participants max
          </Label>
          <Input
            id="participants_max"
            type="number"
            {...register('participants_max', { valueAsNumber: true })}
            placeholder="6"
            className={focusClass}
            style={inputStyle}
          />
          {errors.participants_max && (
            <p className="text-sm" style={{ color: '#c8102e' }}>{errors.participants_max.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="niveau_requis" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>
            Niveau requis
          </Label>
          <Input
            id="niveau_requis"
            {...register('niveau_requis')}
            placeholder="Tout niveau accepté"
            className={focusClass}
            style={inputStyle}
          />
          {errors.niveau_requis && (
            <p className="text-sm" style={{ color: '#c8102e' }}>{errors.niveau_requis.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="age_minimum" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>
            Âge minimum
          </Label>
          <Input
            id="age_minimum"
            type="number"
            {...register('age_minimum', {
              setValueAs: (v) => v === '' || v === null ? null : parseInt(v)
            })}
            placeholder="Optionnel"
            className={focusClass}
            style={inputStyle}
          />
          {errors.age_minimum && (
            <p className="text-sm" style={{ color: '#c8102e' }}>{errors.age_minimum.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="materiel_fourni" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>
            Matériel fourni
          </Label>
          <div className="flex items-center gap-2 h-10">
            <input
              id="materiel_fourni"
              type="checkbox"
              {...register('materiel_fourni')}
              className="w-4 h-4 rounded"
              style={{ accentColor: '#2d5a3d' }}
            />
            <span className="text-sm" style={{ color: '#6b7280' }}>Oui, le matériel est fourni</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="parent_requis" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>
            Parent requis
          </Label>
          <div className="flex items-center gap-2 h-10">
            <input
              id="parent_requis"
              type="checkbox"
              {...register('parent_requis')}
              className="w-4 h-4 rounded"
              style={{ accentColor: '#2d5a3d' }}
            />
            <span className="text-sm" style={{ color: '#6b7280' }}>Oui, un parent doit accompagner</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description_courte" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>
          Description courte
        </Label>
        <Textarea
          id="description_courte"
          {...register('description_courte')}
          placeholder="Une brève description de l'atelier..."
          rows={3}
          className="input-focus border-2 transition-all resize-none hover:border-[#2d5a3d]/30"
          style={inputStyle}
        />
        {errors.description_courte && (
          <p className="text-sm" style={{ color: '#c8102e' }}>{errors.description_courte.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description_longue" className="text-sm font-semibold" style={{ color: '#2c2c2c' }}>
          Description longue
        </Label>
        <Textarea
          id="description_longue"
          {...register('description_longue')}
          placeholder="Description détaillée de l'atelier..."
          rows={6}
          className="input-focus border-2 transition-all resize-none hover:border-[#2d5a3d]/30"
          style={inputStyle}
        />
        {errors.description_longue && (
          <p className="text-sm" style={{ color: '#c8102e' }}>{errors.description_longue.message}</p>
        )}
      </div>

      {/* Image Uploader */}
      <div className="pt-6" style={{ borderTop: '1px solid #e8e4df' }}>
        <ImageUploader
          atelierId={atelier?.id || null}
          images={images}
          onImagesChange={fetchImages}
          disabled={loading}
        />
      </div>

      <div className="flex gap-3 justify-end pt-4" style={{ borderTop: '1px solid #e8e4df' }}>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="border-2 transition-all h-11"
          style={{ borderColor: '#d1d5db' }}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="btn-gradient h-11"
        >
          {loading ? 'Enregistrement...' : atelier ? 'Mettre à jour' : 'Créer l\'atelier'}
        </Button>
      </div>
    </form>
  )
}
