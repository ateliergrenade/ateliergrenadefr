# Atelier Grenade - Site Web

Site web pour Atelier Grenade, atelier de maroquinerie artisanale.

## Installation

```bash
npm install
```

## Configuration Importante

**⚠️ Avant de démarrer le site, vous devez ajouter la bannière :**

1. Placez votre fichier image de bannière dans le dossier `public/`
2. Nommez-le exactement : `banniere-atelier-grenade.png`
3. Format recommandé : PNG ou JPG, largeur minimale 1920px

## Démarrage

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure du Projet

```
/app
  /layout.tsx       # Layout principal avec métadonnées
  /page.tsx         # Page d'accueil
  /globals.css      # Styles globaux et thème
/public
  /banniere-atelier-grenade.png  # Bannière du site (à ajouter)
/components         # Composants réutilisables (vide pour l'instant)
```

## Thème de Couleurs

Le site utilise des couleurs inspirées de la grenade :
- **Fond sombre** : #2c2c2c
- **Rouge grenade** : #c8102e
- **Vert feuillage** : #2d5a3d
- **Crème** : #f8f5f2

## Technologies

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v4
- React 18

## Fonctionnalités

- ✅ Gestion des ateliers (CRUD complet)
- ✅ Interface d'administration sécurisée
- ✅ Système de réservation en ligne
- ✅ Paiement via Stripe
- ✅ Gestion des sessions d'ateliers
- ✅ Suivi des réservations
- ✅ Synchronisation automatique avec Stripe

## Configuration du Paiement Stripe

Le site intègre un système complet de paiement Stripe pour les réservations d'ateliers.

### 🚀 Configuration Rapide

1. **Copier le fichier d'environnement**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Configurer les variables Stripe**
   
   Obtenez vos clés depuis le [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys):
   
   Pour le **développement local** (mode TEST):
   ```env
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
   ```
   
   Pour la **production** (mode LIVE):
   ```env
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
   ```

3. **Configurer les Webhooks**
   
   **En local:**
   ```bash
   # Installer Stripe CLI
   brew install stripe/stripe-cli/stripe
   
   # Se connecter
   stripe login
   
   # Lancer le listener
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   
   # Copier le webhook secret affiché (whsec_...) dans .env.local
   ```
   
   **En production:**
   - Allez dans Stripe Dashboard → Développeurs → Webhooks
   - Ajoutez un endpoint: `https://votre-domaine.com/api/webhooks/stripe`
   - Sélectionnez l'événement: `checkout.session.completed`
   - Copiez le webhook secret dans vos variables d'environnement de production

4. **Appliquer les migrations Supabase**
   
   Exécutez le fichier de migration pour créer les tables nécessaires:
   ```sql
   -- Fichier: supabase/migrations/003_create_reservations_tables.sql
   ```
   
   Via le Supabase Dashboard ou la CLI Supabase.

### 📚 Documentation Complète

Pour plus de détails sur la configuration Stripe, consultez:
- **[STRIPE_PAYMENT_SETUP.md](./STRIPE_PAYMENT_SETUP.md)** - Guide complet de configuration
- **[STRIPE_INTEGRATION.md](./STRIPE_INTEGRATION.md)** - Documentation de l'intégration technique

## Interface d'Administration

L'interface admin est accessible à `/admin` et permet de :

### Gestion des Ateliers (`/admin`)
- Créer, modifier et supprimer des ateliers
- Synchronisation automatique avec Stripe (Product & Price)
- Gestion des détails (prix, durée, participants, etc.)

### Gestion des Sessions (`/admin/sessions`)
- Planifier des sessions d'ateliers avec dates et horaires
- Gérer les places disponibles
- Vue chronologique des sessions passées et futures

### Vue des Réservations (`/admin/reservations`)
- Consulter toutes les réservations
- Filtrer par statut (confirmée, en attente, annulée)
- Voir les informations clients et détails de paiement
- Statistiques en temps réel

## Flux de Réservation Utilisateur

1. L'utilisateur consulte un atelier sur la page d'accueil
2. Il clique sur "En savoir plus" pour voir les détails
3. Il sélectionne une session disponible
4. Il remplit ses informations (nom, prénom, email, téléphone)
5. Il clique sur "Réserver et Payer"
6. Il est redirigé vers Stripe Checkout pour le paiement
7. Après paiement, il voit une page de confirmation
8. La réservation est confirmée automatiquement via webhook

## Tests de Paiement

Utilisez les cartes de test Stripe:

| Carte | Résultat |
|-------|----------|
| `4242 4242 4242 4242` | Paiement réussi |
| `4000 0000 0000 0002` | Paiement refusé |
| `4000 0025 0000 3155` | Authentification 3D Secure requise |

Date d'expiration: n'importe quelle date future (ex: `12/34`)  
CVC: n'importe quel 3 chiffres (ex: `123`)

## Structure de la Base de Données

### Tables Principales

- **`ateliers`** - Informations sur les ateliers
- **`sessions_ateliers`** - Sessions planifiées pour chaque atelier
- **`clients`** - Informations des clients
- **`reservations`** - Réservations avec statut et paiement

Voir [SUPABASE_ATELIERS.md](./SUPABASE_ATELIERS.md) pour plus de détails.

## Sécurité

- ✅ Clés Stripe secrètes jamais exposées côté client
- ✅ Vérification de signature pour tous les webhooks
- ✅ Interface admin protégée par authentification
- ✅ Validation des données côté serveur (Zod)
- ✅ HTTPS requis en production

## Déploiement

### Variables d'Environnement de Production

Configurez ces variables dans votre plateforme de déploiement:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Stripe PRODUCTION
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_URL=https://votre-domaine.com

# Admin
ADMIN_PASSWORD=
```

⚠️ **Important**: N'oubliez pas de configurer le webhook Stripe en production!
