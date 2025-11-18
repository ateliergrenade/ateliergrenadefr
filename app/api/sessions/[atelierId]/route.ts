import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - List available sessions for an atelier
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ atelierId: string }> }
) {
  try {
    const { atelierId } = await params

    // Validate atelierId format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(atelierId)) {
      return NextResponse.json(
        { error: 'ID d\'atelier invalide' },
        { status: 400 }
      )
    }

    // Fetch sessions with atelier details
    // Only return future sessions with available places
    const now = new Date().toISOString()
    
    const { data: sessions, error } = await supabase
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
      .eq('atelier_id', atelierId)
      .gte('date_debut', now)
      .gt('places_disponibles', 0)
      .order('date_debut', { ascending: true })

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



