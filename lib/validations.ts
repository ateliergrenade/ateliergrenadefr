import { z } from 'zod'

export const atelierSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(200, 'Le titre est trop long'),
  description_courte: z.string().min(1, 'La description courte est requise').max(500, 'La description courte est trop longue'),
  description_longue: z.string().min(1, 'La description longue est requise'),
  prix: z.number().min(0, 'Le prix doit être positif'),
  slug: z.string()
    .min(1, 'Le slug est requis')
    .max(200, 'Le slug est trop long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Le slug doit contenir uniquement des lettres minuscules, des chiffres et des tirets'),
  duree: z.string().min(1, 'La durée est requise').max(50, 'La durée est trop longue'),
  participants_max: z.number().int().min(1, 'Le nombre de participants doit être au moins 1'),
  materiel_fourni: z.boolean(),
  niveau_requis: z.string().max(200, 'Le niveau requis est trop long').nullable().optional(),
  age_minimum: z.number().int().min(1, 'L\'âge minimum doit être au moins 1').nullable().optional(),
  parent_requis: z.boolean(),
})

export const atelierUpdateSchema = atelierSchema.partial()

export type AtelierFormData = z.infer<typeof atelierSchema>

