-- Migration: Remove Stripe product and price ID columns from ateliers table
-- These columns are no longer needed as we'll use price_data in checkout sessions

-- Remove the stripe_product_id column
ALTER TABLE ateliers DROP COLUMN IF EXISTS stripe_product_id;

-- Remove the stripe_price_id column
ALTER TABLE ateliers DROP COLUMN IF EXISTS stripe_price_id;
