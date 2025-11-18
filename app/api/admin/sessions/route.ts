import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAuthenticated } from '@/lib/auth'
import { sessionAtelierSchema } from '@/lib/validations-reservation'

// GET - List all sessions (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Get optional atelier_id filter
    const { searchParams } = new URL(request.url)
    const atelierId = searchParams.get('atelier_id')

    const supabase = createAdminClient()
    let query = supabase
      .from('sessions_ateliers')
      .select(`
        *,
        atelier:ateliers (
          id,
          titre,
          prix,
          duree
        )
      `)
      .order('date_debut', { ascending: true })

    if (atelierId) {
      query = query.eq('atelier_id', atelierId)
    }

    const { data: sessions, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des sessions' },
        { status: 500 }
      )
    }

    return NextResponse.json(sessions || [])
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sessions' },
      { status: 500 }
    )
  }
}

// POST - Create new session (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()

    // Validate data
    const validatedData = sessionAtelierSchema.parse(body)

    // Insert into Supabase
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('sessions_ateliers')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la session' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de la session' },
      { status: 500 }
    )
  }
}



