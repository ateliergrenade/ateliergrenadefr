import { Database } from './database.types'

// Type helpers pour les tables de réservation
export type Client = Database['public']['Tables']['clients']['Row']
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type ClientUpdate = Database['public']['Tables']['clients']['Update']

export type SessionAtelier = Database['public']['Tables']['sessions_ateliers']['Row']
export type SessionAtelierInsert = Database['public']['Tables']['sessions_ateliers']['Insert']
export type SessionAtelierUpdate = Database['public']['Tables']['sessions_ateliers']['Update']

export type Reservation = Database['public']['Tables']['reservations']['Row']
export type ReservationInsert = Database['public']['Tables']['reservations']['Insert']
export type ReservationUpdate = Database['public']['Tables']['reservations']['Update']

// Type étendu avec relations
export type SessionAtelierWithAtelier = SessionAtelier & {
  atelier?: {
    id: string
    titre: string
    prix: number
    duree: string
  }
}

export type ReservationWithDetails = Reservation & {
  session?: SessionAtelierWithAtelier
  client?: Client
}

// Types pour les formulaires
export type ClientFormData = {
  nom: string
  prenom: string
  email: string
  telephone: string
}

export type ReservationFormData = ClientFormData & {
  sessionId: string
  nombre_personnes: number
}

// Types pour les réponses API
export type CheckoutResponse = {
  url: string
  reservationId: string
}

export type SessionsResponse = SessionAtelierWithAtelier[]



