-- Ajouter le nombre de personnes par réservation (défaut 1 pour rétrocompatibilité)
ALTER TABLE reservations ADD COLUMN nombre_personnes INTEGER NOT NULL DEFAULT 1;
ALTER TABLE reservations ADD CONSTRAINT reservations_nombre_personnes_positive CHECK (nombre_personnes >= 1);
