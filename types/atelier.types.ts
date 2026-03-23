import { Database } from './database.types'

// Type helper pour la table ateliers
export type Atelier = Database['public']['Tables']['ateliers']['Row']
export type AtelierInsert = Database['public']['Tables']['ateliers']['Insert']
export type AtelierUpdate = Database['public']['Tables']['ateliers']['Update']

// Type helper pour la table atelier_images
export type AtelierImage = {
  id: string
  atelier_id: string
  storage_path: string
  is_cover: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type AtelierImageInsert = Omit<AtelierImage, 'id' | 'created_at' | 'updated_at'>
export type AtelierImageUpdate = Partial<Omit<AtelierImage, 'id' | 'atelier_id' | 'created_at' | 'updated_at'>>

// Type avec images pour l'affichage
export type AtelierWithImages = Atelier & {
  images?: AtelierImage[]
  cover_image?: AtelierImage
}



