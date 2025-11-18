import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAuthenticated } from '@/lib/auth'

// GET - List all reservations with details (admin only)
export async function GET() {
  try {
    // Check authentication
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select(`
        *,
        session:sessions_ateliers (
          id,
          date_debut,
          date_fin,
          atelier:ateliers (
            id,
            titre
          )
        ),
        client:clients (
          id,
          nom,
          prenom,
          email,
          telephone
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des réservations' },
        { status: 500 }
      )
    }

    return NextResponse.json(reservations || [])
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des réservations' },
      { status: 500 }
    )
  }
}



