import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

// This is needed to get the raw body for signature verification
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('No Stripe signature found')
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        console.log('Checkout session completed:', session.id)

        // Get metadata from the checkout session
        const { reservation_id, session_id } = session.metadata || {}

        if (!reservation_id || !session_id) {
          console.error('Missing metadata in checkout session:', session.id)
          return NextResponse.json(
            { error: 'Missing required metadata' },
            { status: 400 }
          )
        }

        // Get payment intent ID
        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id

        // Get amount paid (in cents, convert to euros)
        const amountPaid = session.amount_total ? session.amount_total / 100 : null

        // 1. Update reservation status to "confirmee"
        const { error: reservationError } = await supabase
          .from('reservations')
          .update({
            statut: 'confirmee',
            stripe_payment_intent_id: paymentIntentId,
            montant_paye: amountPaid,
          })
          .eq('id', reservation_id)

        if (reservationError) {
          console.error('Error updating reservation:', reservationError)
          return NextResponse.json(
            { error: 'Failed to update reservation' },
            { status: 500 }
          )
        }

        console.log('Reservation updated:', reservation_id)

        // 2. Decrement places_disponibles for the session
        // We need to fetch current value first, then decrement
        const { data: sessionData, error: sessionFetchError } = await supabase
          .from('sessions_ateliers')
          .select('places_disponibles')
          .eq('id', session_id)
          .single()

        if (sessionFetchError || !sessionData) {
          console.error('Error fetching session:', sessionFetchError)
          // Don't return error, reservation is already confirmed
          // Log the error and continue
        } else {
          const newPlacesDisponibles = Math.max(0, sessionData.places_disponibles - 1)

          const { error: sessionUpdateError } = await supabase
            .from('sessions_ateliers')
            .update({ places_disponibles: newPlacesDisponibles })
            .eq('id', session_id)

          if (sessionUpdateError) {
            console.error('Error updating session places:', sessionUpdateError)
            // Don't return error, reservation is already confirmed
          } else {
            console.log(
              'Session places updated:',
              session_id,
              'New places:',
              newPlacesDisponibles
            )
          }
        }

        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session

        console.log('Checkout session expired:', session.id)

        // Get metadata
        const { reservation_id } = session.metadata || {}

        if (reservation_id) {
          // Cancel the reservation
          const { error } = await supabase
            .from('reservations')
            .update({ statut: 'annulee' })
            .eq('id', reservation_id)

          if (error) {
            console.error('Error canceling reservation:', error)
          } else {
            console.log('Reservation canceled:', reservation_id)
          }
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}


