import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAuthenticated } from '@/lib/auth'

// GET - List distinct addresses used in sessions (admin only)
export async function GET() {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('sessions_ateliers')
      .select('adresse')
      .not('adresse', 'is', null)
      .order('adresse', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des adresses' },
        { status: 500 }
      )
    }

    // Deduplicate addresses
    const addresses = [...new Set(
      (data || [])
        .map((row) => row.adresse)
        .filter((a): a is string => !!a)
    )]

    return NextResponse.json(addresses)
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des adresses' },
      { status: 500 }
    )
  }
}
