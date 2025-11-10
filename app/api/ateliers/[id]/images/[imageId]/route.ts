import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAuthenticated } from '@/lib/auth'

// PATCH - Mettre à jour une image (définir comme couverture, changer l'ordre)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id, imageId } = await params

    // Vérifier l'authentification
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { is_cover, display_order } = body

    const adminClient = createAdminClient()

    // Si on définit comme couverture, retirer le flag des autres images
    if (is_cover === true) {
      await adminClient
        .from('atelier_images')
        .update({ is_cover: false })
        .eq('atelier_id', id)
    }

    // Construire l'objet de mise à jour
    const updateData: any = {}
    if (typeof is_cover === 'boolean') {
      updateData.is_cover = is_cover
    }
    if (typeof display_order === 'number') {
      updateData.display_order = display_order
    }

    // Mettre à jour l'image
    const { data, error } = await adminClient
      .from('atelier_images')
      .update(updateData)
      .eq('id', imageId)
      .eq('atelier_id', id)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de l\'image' },
        { status: 500 }
      )
    }

    // Ajouter l'URL publique
    const imageWithUrl = {
      ...data,
      url: supabase.storage.from('atelier-images').getPublicUrl(data.storage_path).data.publicUrl
    }

    return NextResponse.json(imageWithUrl)
  } catch (error) {
    console.error('Error updating image:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'image' },
      { status: 500 }
    )
  }
}
