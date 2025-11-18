import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase/admin'
import { atelierUpdateSchema } from '@/lib/validations'
import { isAuthenticated } from '@/lib/auth'

type Params = {
  params: Promise<{
    id: string
  }>
}

// PATCH - Update atelier (requires authentication)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Validate data
    const validatedData = atelierUpdateSchema.parse(body)

    const adminClient = createAdminClient()

    // Update in Supabase
    const { data, error } = await adminClient
      .from('ateliers')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      
      // Check for unique constraint violation (slug already exists)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Ce slug existe déjà' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de l\'atelier' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Atelier non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating atelier:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'atelier' },
      { status: 500 }
    )
  }
}

// DELETE - Delete atelier (requires authentication)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = await params

    const adminClient = createAdminClient()

    // Delete from Supabase
    const { error } = await adminClient
      .from('ateliers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'atelier' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting atelier:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'atelier' },
      { status: 500 }
    )
  }
}

