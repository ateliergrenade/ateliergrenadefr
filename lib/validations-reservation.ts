import { z } from 'zod'

// Validation pour les données client
export const clientSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  telephone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone français invalide'),
})

// Validation pour les données de réservation
export const reservationSchema = z.object({
  sessionId: z.string().uuid('ID de session invalide'),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  telephone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone français invalide'),
  nombre_personnes: z.number().int().min(1, 'Au moins 1 personne').max(10, 'Maximum 10 personnes'),
})

// Validation pour la création de session d'atelier
export const sessionAtelierSchema = z.object({
  atelier_id: z.string().uuid('ID d\'atelier invalide'),
  date_debut: z.string().datetime('Date de début invalide'),
  date_fin: z.string().datetime('Date de fin invalide'),
  places_disponibles: z.number().int().min(0, 'Le nombre de places disponibles ne peut pas être négatif'),
  places_totales: z.number().int().positive('Le nombre de places totales doit être positif'),
})

export type ClientFormData = z.infer<typeof clientSchema>
export type ReservationFormData = z.infer<typeof reservationSchema>
export type SessionAtelierFormData = z.infer<typeof sessionAtelierSchema>



