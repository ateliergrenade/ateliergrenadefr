import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase/admin'
import { atelierSchema } from '@/lib/validations'
import { isAuthenticated } from '@/lib/auth'

// GET - List all ateliers
export async function GET() {
  try {
    const { data: ateliers, error } = await supabase
      .from('ateliers')
      .select('*')
      .order('ordre', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des ateliers' },
        { status: 500 }
      )
    }

    return NextResponse.json(ateliers)
  } catch (error) {
    console.error('Error fetching ateliers:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des ateliers' },
      { status: 500 }
    )
  }
}

// POST - Create new atelier (requires authentication)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate data
    const validatedData = atelierSchema.parse(body)

    // Determine next ordre value
    const adminClient = createAdminClient()
    const { data: lastAtelier } = await adminClient
      .from('ateliers')
      .select('ordre')
      .order('ordre', { ascending: false })
      .limit(1)
      .single()

    const nextOrdre = (lastAtelier?.ordre ?? -1) + 1

    // Insert into Supabase
    const { data, error } = await adminClient
      .from('ateliers')
      .insert({ ...validatedData, ordre: nextOrdre })
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
        { error: 'Erreur lors de la création de l\'atelier' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating atelier:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'atelier' },
      { status: 500 }
    )
  }
}

