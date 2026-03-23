-- Add places_totales column to track total capacity
ALTER TABLE sessions_ateliers
ADD COLUMN places_totales integer;

-- Initialize places_totales from places_disponibles for existing rows
UPDATE sessions_ateliers
SET places_totales = places_disponibles;

-- Make it NOT NULL after backfill
ALTER TABLE sessions_ateliers
ALTER COLUMN places_totales SET NOT NULL;

-- Add CHECK constraint
ALTER TABLE sessions_ateliers
ADD CONSTRAINT places_totales_positive CHECK (places_totales > 0);

-- Ensure places_disponibles <= places_totales
ALTER TABLE sessions_ateliers
ADD CONSTRAINT places_disponibles_lte_totales CHECK (places_disponibles <= places_totales);
