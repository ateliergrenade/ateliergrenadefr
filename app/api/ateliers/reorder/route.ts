import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAuthenticated } from '@/lib/auth'

// PUT - Reorder ateliers
export async function PUT(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { orderedIds } = await request.json()

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { error: 'orderedIds doit être un tableau non vide' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Update each atelier's ordre based on its position in the array
    for (let i = 0; i < orderedIds.length; i++) {
      const { error } = await adminClient
        .from('ateliers')
        .update({ ordre: i })
        .eq('id', orderedIds[i])

      if (error) {
        console.error('Error updating ordre for atelier:', orderedIds[i], error)
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour de l\'ordre' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering ateliers:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'ordre' },
      { status: 500 }
    )
  }
}
