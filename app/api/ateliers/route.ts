import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase/admin'
import { atelierSchema } from '@/lib/validations'
import { isAuthenticated } from '@/lib/auth'
import { createStripeProduct } from '@/lib/stripe'

// GET - List all ateliers
export async function GET() {
  try {
    const { data: ateliers, error } = await supabase
      .from('ateliers')
      .select('*')
      .order('created_at', { ascending: false })

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

    // Insert into Supabase
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('ateliers')
      .insert(validatedData)
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

    // Create Stripe product and price
    try {
      const { productId, priceId } = await createStripeProduct(data)

      // Update atelier with Stripe IDs
      const { data: updatedData, error: updateError } = await adminClient
        .from('ateliers')
        .update({ 
          stripe_product_id: productId,
          stripe_price_id: priceId 
        })
        .eq('id', data.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating atelier with Stripe IDs:', updateError)
        // We don't rollback here as the atelier was created successfully
        // The admin can manually update Stripe IDs later if needed
      }

      return NextResponse.json(updatedData || data, { status: 201 })
    } catch (stripeError) {
      console.error('Stripe error:', stripeError)

      // Rollback: delete the atelier since Stripe creation failed
      await adminClient
        .from('ateliers')
        .delete()
        .eq('id', data.id)

      const errorMessage = stripeError instanceof Error ? stripeError.message : 'Erreur inconnue'
      
      return NextResponse.json(
        { 
          error: 'Erreur lors de la création du produit Stripe. Atelier non créé.',
          details: errorMessage
        },
        { status: 500 }
      )
    }
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

