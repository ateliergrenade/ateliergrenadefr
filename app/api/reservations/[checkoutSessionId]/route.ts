import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ checkoutSessionId: string }> }
) {
  try {
    const { checkoutSessionId } = await params

    const supabase = createAdminClient()

    if (!checkoutSessionId) {
      return NextResponse.json(
        { error: 'Checkout session ID manquant' },
        { status: 400 }
      )
    }

    // Fetch reservation with all related data
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .select(`
        *,
        session:sessions_ateliers (
          id,
          date_debut,
          date_fin,
          places_disponibles,
          atelier:ateliers (
            id,
            titre,
            prix,
            duree,
            description_courte,
            description_longue
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
      .eq('stripe_checkout_session_id', checkoutSessionId)
      .single()

    if (reservationError || !reservation) {
      console.error('Reservation error:', reservationError)
      return NextResponse.json(
        { error: 'Réservation non trouvée' },
        { status: 404 }
      )
    }

    // Format the response
    const atelier = Array.isArray(reservation.session?.atelier)
      ? reservation.session.atelier[0]
      : reservation.session?.atelier

    return NextResponse.json({
      reservation: {
        id: reservation.id,
        statut: reservation.statut,
        stripe_checkout_session_id: reservation.stripe_checkout_session_id,
        stripe_payment_intent_id: reservation.stripe_payment_intent_id,
        montant_paye: reservation.montant_paye,
        nombre_personnes: reservation.nombre_personnes,
        created_at: reservation.created_at,
      },
      session: reservation.session
        ? {
            id: reservation.session.id,
            date_debut: reservation.session.date_debut,
            date_fin: reservation.session.date_fin,
            places_disponibles: reservation.session.places_disponibles,
          }
        : null,
      atelier: atelier || null,
      client: Array.isArray(reservation.client)
        ? reservation.client[0]
        : reservation.client,
    })
  } catch (error) {
    console.error('Error fetching reservation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la réservation' },
      { status: 500 }
    )
  }
}


