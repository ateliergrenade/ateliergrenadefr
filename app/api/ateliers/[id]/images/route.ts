import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAuthenticated } from '@/lib/auth'

// GET - Récupérer toutes les images d'un atelier
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: images, error } = await supabase
      .from('atelier_images')
      .select('*')
      .eq('atelier_id', id)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des images' },
        { status: 500 }
      )
    }

    // Générer les URLs publiques pour chaque image
    const imagesWithUrls = images.map((image) => ({
      ...image,
      url: supabase.storage.from('atelier-images').getPublicUrl(image.storage_path).data.publicUrl
    }))

    return NextResponse.json(imagesWithUrls)
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des images' },
      { status: 500 }
    )
  }
}

// POST - Uploader une nouvelle image (authentification requise)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Vérifier l'authentification
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const isCover = formData.get('is_cover') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Vérifier que le type de fichier est une image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Le fichier doit être une image' },
        { status: 400 }
      )
    }

    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop()
    const fileName = `${id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Uploader le fichier dans le storage
    const { error: uploadError } = await supabase.storage
      .from('atelier-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'upload de l\'image' },
        { status: 500 }
      )
    }

    const adminClient = createAdminClient()

    // Si c'est une image de couverture, retirer le flag des autres images
    if (isCover) {
      await adminClient
        .from('atelier_images')
        .update({ is_cover: false })
        .eq('atelier_id', id)
    }

    // Obtenir le display_order maximum
    const { data: maxOrderData } = await adminClient
      .from('atelier_images')
      .select('display_order')
      .eq('atelier_id', id)
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const nextOrder = (maxOrderData?.display_order ?? -1) + 1

    // Insérer l'entrée dans la base de données
    const { data: imageData, error: dbError } = await adminClient
      .from('atelier_images')
      .insert({
        atelier_id: id,
        storage_path: fileName,
        is_cover: isCover,
        display_order: nextOrder
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Nettoyer le fichier uploadé en cas d'erreur
      await supabase.storage.from('atelier-images').remove([fileName])
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement de l\'image' },
        { status: 500 }
      )
    }

    // Ajouter l'URL publique
    const imageWithUrl = {
      ...imageData,
      url: supabase.storage.from('atelier-images').getPublicUrl(fileName).data.publicUrl
    }

    return NextResponse.json(imageWithUrl, { status: 201 })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload de l\'image' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une image (authentification requise)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Vérifier l'authentification
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('imageId')

    if (!imageId) {
      return NextResponse.json(
        { error: 'ID de l\'image manquant' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Récupérer le storage_path de l'image
    const { data: imageData, error: fetchError } = await adminClient
      .from('atelier_images')
      .select('storage_path')
      .eq('id', imageId)
      .eq('atelier_id', id)
      .single()

    if (fetchError || !imageData) {
      return NextResponse.json(
        { error: 'Image non trouvée' },
        { status: 404 }
      )
    }

    // Supprimer le fichier du storage
    const { error: storageError } = await supabase.storage
      .from('atelier-images')
      .remove([imageData.storage_path])

    if (storageError) {
      console.error('Storage error:', storageError)
    }

    // Supprimer l'entrée de la base de données
    const { error: dbError } = await adminClient
      .from('atelier_images')
      .delete()
      .eq('id', imageId)
      .eq('atelier_id', id)

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'image' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'image' },
      { status: 500 }
    )
  }
}
