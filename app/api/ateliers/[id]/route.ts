import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase/admin'
import { atelierUpdateSchema } from '@/lib/validations'
import { isAuthenticated } from '@/lib/auth'
import { updateStripeProduct, archiveStripeProduct } from '@/lib/stripe'

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

    // First, get the existing atelier to check if it has Stripe IDs
    const { data: existingAtelier, error: fetchError } = await adminClient
      .from('ateliers')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingAtelier) {
      console.error('Error fetching existing atelier:', {
        id,
        error: fetchError,
        code: fetchError?.code,
        message: fetchError?.message,
        details: fetchError?.details,
        hint: fetchError?.hint
      })
      return NextResponse.json(
        { error: 'Atelier non trouvé', details: fetchError?.message },
        { status: 404 }
      )
    }

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

    // Update Stripe product if Stripe IDs exist
    if (existingAtelier.stripe_product_id && existingAtelier.stripe_price_id) {
      try {
        const { productId, priceId } = await updateStripeProduct(
          data,
          existingAtelier.stripe_product_id,
          existingAtelier.stripe_price_id
        )

        // Update atelier with new Stripe IDs if price changed
        if (priceId !== existingAtelier.stripe_price_id) {
          const { data: updatedData, error: updateError } = await adminClient
            .from('ateliers')
            .update({ 
              stripe_product_id: productId,
              stripe_price_id: priceId 
            })
            .eq('id', id)
            .select()
            .single()

          if (updateError) {
            console.error('Error updating atelier with new Stripe price ID:', updateError)
          }

          return NextResponse.json(updatedData || data)
        }
      } catch (stripeError) {
        console.error('Stripe error during update:', stripeError)
        // Don't fail the request if Stripe update fails
        // The atelier was already updated successfully in Supabase
      }
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

    // First, get the atelier to retrieve Stripe product ID
    const { data: atelier, error: fetchError } = await adminClient
      .from('ateliers')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !atelier) {
      return NextResponse.json(
        { error: 'Atelier non trouvé' },
        { status: 404 }
      )
    }

    // Archive Stripe product if it exists
    if (atelier.stripe_product_id) {
      try {
        await archiveStripeProduct(atelier.stripe_product_id)
      } catch (stripeError) {
        console.error('Stripe error during deletion:', stripeError)
        // Don't fail the request if Stripe archiving fails
        // We still want to delete the atelier from Supabase
      }
    }

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

