-- Migration: Création des tables pour le système de réservation
-- Date: 2025-11-03

-- Table clients: Stocke les informations des clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide par email
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- Table sessions_ateliers: Planification des sessions d'ateliers
CREATE TABLE IF NOT EXISTS sessions_ateliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atelier_id UUID NOT NULL REFERENCES ateliers(id) ON DELETE CASCADE,
  date_debut TIMESTAMP WITH TIME ZONE NOT NULL,
  date_fin TIMESTAMP WITH TIME ZONE NOT NULL,
  places_disponibles INTEGER NOT NULL CHECK (places_disponibles >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide par atelier et date
CREATE INDEX IF NOT EXISTS idx_sessions_atelier_id ON sessions_ateliers(atelier_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date_debut ON sessions_ateliers(date_debut);

-- Table reservations: Suivi des réservations et paiements
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions_ateliers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'confirmee', 'annulee')),
  montant_paye DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_reservations_session_id ON reservations(session_id);
CREATE INDEX IF NOT EXISTS idx_reservations_client_id ON reservations(client_id);
CREATE INDEX IF NOT EXISTS idx_reservations_stripe_checkout_session_id ON reservations(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_reservations_statut ON reservations(statut);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour sessions_ateliers
CREATE TRIGGER update_sessions_ateliers_updated_at 
  BEFORE UPDATE ON sessions_ateliers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour reservations
CREATE TRIGGER update_reservations_updated_at 
  BEFORE UPDATE ON reservations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();


