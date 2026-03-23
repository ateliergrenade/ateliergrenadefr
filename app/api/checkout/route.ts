import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'
import { reservationSchema } from '@/lib/validations-reservation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request data
    const validatedData = reservationSchema.parse(body)
    const { sessionId, nom, prenom, email, telephone } = validatedData

    // 1. Fetch session details with atelier info
    const { data: session, error: sessionError } = await supabase
      .from('sessions_ateliers')
      .select(`
        *,
        atelier:ateliers (
          id,
          titre,
          description_courte,
          prix
        )
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      console.error('Session error:', sessionError)
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      )
    }

    // 2. Check if session has available places
    if (session.places_disponibles <= 0) {
      return NextResponse.json(
        { error: 'Plus de places disponibles pour cette session' },
        { status: 400 }
      )
    }

    // 3. Check if session is in the future
    const now = new Date()
    const sessionDate = new Date(session.date_debut)
    if (sessionDate <= now) {
      return NextResponse.json(
        { error: 'Cette session est déjà passée' },
        { status: 400 }
      )
    }

    // 4. Get atelier data
    const atelierData = Array.isArray(session.atelier) ? session.atelier[0] : session.atelier
    if (!atelierData) {
      console.error('No atelier data found for session:', sessionId)
      return NextResponse.json(
        { error: 'Données de l\'atelier manquantes' },
        { status: 500 }
      )
    }

    // 5. Create or get client
    // First, try to find existing client by email
    const { data: existingClients } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .limit(1)

    let clientId: string

    if (existingClients && existingClients.length > 0) {
      // Update existing client info
      const { data: updatedClient, error: updateError } = await supabase
        .from('clients')
        .update({ nom, prenom, telephone })
        .eq('id', existingClients[0].id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating client:', updateError)
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour des informations client' },
          { status: 500 }
        )
      }

      clientId = updatedClient.id
    } else {
      // Create new client
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({ nom, prenom, email, telephone })
        .select()
        .single()

      if (clientError) {
        console.error('Error creating client:', clientError)
        return NextResponse.json(
          { error: 'Erreur lors de la création du client' },
          { status: 500 }
        )
      }

      clientId = newClient.id
    }

    // 6. Create reservation in "en_attente" status
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        session_id: sessionId,
        client_id: clientId,
        statut: 'en_attente',
        montant_paye: atelierData.prix,
      })
      .select()
      .single()

    if (reservationError) {
      console.error('Error creating reservation:', reservationError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la réservation' },
        { status: 500 }
      )
    }

    // 7. Create Stripe Checkout Session
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

    try {
      // Create description with session date
      const sessionDate = new Date(session.date_debut).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      const productDescription = `${atelierData.titre} - Session du ${sessionDate}`

      const checkoutSession = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'eur',
              unit_amount: Math.round(atelierData.prix * 100), // Convert to cents
              product_data: {
                name: atelierData.titre,
                description: productDescription,
              },
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/reservation/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/reservation/cancel`,
        customer_email: email,
        metadata: {
          reservation_id: reservation.id,
          session_id: sessionId,
          client_id: clientId,
          atelier_id: atelierData.id,
        },
      })

      // 8. Update reservation with Stripe checkout session ID
      await supabase
        .from('reservations')
        .update({ stripe_checkout_session_id: checkoutSession.id })
        .eq('id', reservation.id)

      // 9. Return checkout URL
      return NextResponse.json({
        url: checkoutSession.url,
        reservationId: reservation.id,
      })
    } catch (stripeError) {
      console.error('Stripe error:', stripeError)

      // Rollback: delete the reservation
      await supabase
        .from('reservations')
        .delete()
        .eq('id', reservation.id)

      return NextResponse.json(
        { error: 'Erreur lors de la création de la session de paiement' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error processing checkout:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors du traitement de la réservation' },
      { status: 500 }
    )
  }
}



