import Stripe from 'stripe'
import { Atelier } from '@/types/atelier.types'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

// Initialize Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // apiVersion is pinned by the stripe package version, no need to specify it explicitly
  typescript: true,
})

/**
 * Create a Stripe Product and Price for an atelier
 * @param atelier - The atelier object to create a product for
 * @returns Object containing productId and priceId
 */
export async function createStripeProduct(atelier: Atelier) {
  try {
    // Stripe description has a max length of 250 characters
    const truncatedDescription = atelier.description_courte.length > 250
      ? atelier.description_courte.substring(0, 247) + '...'
      : atelier.description_courte

    // Create the product
    const product = await stripe.products.create({
      name: atelier.titre,
      description: truncatedDescription,
      metadata: {
        atelier_id: atelier.id,
        slug: atelier.slug,
        duree: atelier.duree,
        participants_max: atelier.participants_max.toString(),
        materiel_fourni: atelier.materiel_fourni.toString(),
        niveau_requis: atelier.niveau_requis || '',
        age_minimum: atelier.age_minimum?.toString() || '',
        parent_requis: atelier.parent_requis.toString(),
      },
    })

    // Create the price (amount in cents)
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(atelier.prix * 100), // Convert euros to cents
      currency: 'eur',
      metadata: {
        atelier_id: atelier.id,
      },
    })

    return {
      productId: product.id,
      priceId: price.id,
    }
  } catch (error) {
    console.error('Error creating Stripe product:', error)
    throw new Error(
      `Failed to create Stripe product: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Update a Stripe Product and create a new Price if the price changed
 * @param atelier - The updated atelier object
 * @param currentProductId - Current Stripe product ID
 * @param currentPriceId - Current Stripe price ID
 * @returns Object containing productId and priceId (new priceId if price changed)
 */
export async function updateStripeProduct(
  atelier: Atelier & { stripe_product_id?: string | null; stripe_price_id?: string | null },
  currentProductId: string,
  currentPriceId: string
) {
  try {
    // Stripe description has a max length of 250 characters
    const truncatedDescription = atelier.description_courte.length > 250
      ? atelier.description_courte.substring(0, 247) + '...'
      : atelier.description_courte

    // Update the product
    await stripe.products.update(currentProductId, {
      name: atelier.titre,
      description: truncatedDescription,
      metadata: {
        atelier_id: atelier.id,
        slug: atelier.slug,
        duree: atelier.duree,
        participants_max: atelier.participants_max.toString(),
        materiel_fourni: atelier.materiel_fourni.toString(),
        niveau_requis: atelier.niveau_requis || '',
        age_minimum: atelier.age_minimum?.toString() || '',
        parent_requis: atelier.parent_requis.toString(),
      },
    })

    // Check if we need to create a new price
    let newPriceId = currentPriceId

    // Get the current price to check if the amount changed
    const currentPrice = await stripe.prices.retrieve(currentPriceId)
    const newAmountInCents = Math.round(atelier.prix * 100)

    if (currentPrice.unit_amount !== newAmountInCents) {
      // Archive the old price
      await stripe.prices.update(currentPriceId, {
        active: false,
      })

      // Create a new price
      const newPrice = await stripe.prices.create({
        product: currentProductId,
        unit_amount: newAmountInCents,
        currency: 'eur',
        metadata: {
          atelier_id: atelier.id,
        },
      })

      newPriceId = newPrice.id
    }

    return {
      productId: currentProductId,
      priceId: newPriceId,
    }
  } catch (error) {
    console.error('Error updating Stripe product:', error)
    throw new Error(
      `Failed to update Stripe product: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Archive a Stripe Product (makes it inactive)
 * @param productId - The Stripe product ID to archive
 */
export async function archiveStripeProduct(productId: string) {
  try {
    await stripe.products.update(productId, {
      active: false,
    })
  } catch (error) {
    console.error('Error archiving Stripe product:', error)
    throw new Error(
      `Failed to archive Stripe product: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

