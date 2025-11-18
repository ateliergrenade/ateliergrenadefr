# Configuration du Paiement Stripe

## Vue d'ensemble

Ce guide explique comment configurer le système de paiement Stripe pour les réservations d'ateliers. Le système fonctionne différemment en environnement local (développement) et en production.

## Prérequis

1. Compte Stripe actif sur [stripe.com](https://stripe.com)
2. Accès au Stripe Dashboard
3. Stripe CLI installé pour le développement local

## Configuration des Variables d'Environnement

### 1. Copier le fichier d'exemple

```bash
cp .env.local.example .env.local
```

### 2. Configurer les clés Stripe

#### Environnement LOCAL (Développement)

1. Allez dans le [Stripe Dashboard](https://dashboard.stripe.com)
2. Activez le **mode Test** (toggle en haut à droite)
3. Allez dans **Développeurs** → **Clés API**
4. Copiez les clés de TEST dans `.env.local` :

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

#### Environnement PRODUCTION

1. Dans le Stripe Dashboard, désactivez le **mode Test**
2. Allez dans **Développeurs** → **Clés API**
3. Copiez les clés de PRODUCTION dans vos variables d'environnement de production :

```env
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
```

⚠️ **IMPORTANT** : Ne JAMAIS commiter les clés de production dans Git !

## Configuration des Webhooks

Les webhooks permettent à Stripe de notifier votre application quand un paiement est complété.

### Environnement LOCAL

1. **Installer Stripe CLI** (si pas déjà fait) :

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Autres OS : https://stripe.com/docs/stripe-cli#install
```

2. **Se connecter à Stripe** :

```bash
stripe login
```

3. **Lancer le listener de webhooks** :

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

4. **Copier le webhook secret** affiché dans le terminal (commence par `whsec_`) :

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

5. **Ajouter dans `.env.local`** :

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

6. **Laisser le terminal ouvert** pendant le développement pour recevoir les webhooks

### Environnement PRODUCTION

1. Allez dans le [Stripe Dashboard](https://dashboard.stripe.com) (mode PRODUCTION)
2. Allez dans **Développeurs** → **Webhooks**
3. Cliquez sur **+ Ajouter un endpoint**
4. Configurez :
   - **URL de l'endpoint** : `https://votre-domaine.com/api/webhooks/stripe`
   - **Description** : "Webhooks Atelier Grenade"
   - **Événements à envoyer** : Sélectionnez `checkout.session.completed`
5. Cliquez sur **Ajouter un endpoint**
6. Copiez le **Secret de signature** affiché
7. Ajoutez dans vos variables d'environnement de production :

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

## Tester le Système de Paiement

### 1. Créer une session d'atelier

1. Connectez-vous à l'interface admin : `http://localhost:3000/admin`
2. Créez un atelier (si pas déjà fait)
3. Allez dans **Sessions** et créez une nouvelle session avec une date future

### 2. Faire une réservation de test

1. Sur la page d'accueil, cliquez sur un atelier
2. Dans la modale, remplissez le formulaire de réservation
3. Utilisez les [cartes de test Stripe](https://stripe.com/docs/testing) :
   - **Paiement réussi** : `4242 4242 4242 4242`
   - **Paiement refusé** : `4000 0000 0000 0002`
   - **Authentification requise** : `4000 0025 0000 3155`
4. Date d'expiration : n'importe quelle date future (ex: `12/34`)
5. CVC : n'importe quel 3 chiffres (ex: `123`)

### 3. Vérifier le webhook

1. Vérifiez dans le terminal où tourne `stripe listen` que l'événement `checkout.session.completed` est reçu
2. Vérifiez dans Supabase que la réservation a été mise à jour avec le statut `confirmee`
3. Vérifiez que les places disponibles ont été décrémentées

## Architecture du Flux de Paiement

```
1. Utilisateur remplit le formulaire
   ↓
2. POST /api/checkout
   - Valide les données
   - Crée/récupère le client dans Supabase
   - Crée une réservation (statut: en_attente)
   - Crée une session Stripe Checkout
   ↓
3. Redirection vers Stripe Checkout
   - L'utilisateur paie sur la page Stripe
   ↓
4. Webhook Stripe → POST /api/webhooks/stripe
   - Vérifie la signature
   - Met à jour la réservation (statut: confirmee)
   - Enregistre stripe_payment_intent_id
   - Décrémente places_disponibles
   ↓
5. Redirection vers /reservation/success
   - Affiche la confirmation
```

## Dépannage

### Erreur : "Webhook signature verification failed"

- Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct dans `.env.local`
- En local, assurez-vous que `stripe listen` tourne
- En prod, vérifiez que le webhook est configuré dans le Stripe Dashboard

### Les webhooks ne sont pas reçus en local

- Vérifiez que `stripe listen` tourne dans un terminal
- Vérifiez que l'URL est correcte : `localhost:3000/api/webhooks/stripe`
- Vérifiez que le port 3000 n'est pas bloqué par un firewall

### Les réservations restent en statut "en_attente"

- Le webhook n'a pas été reçu ou a échoué
- Vérifiez les logs du terminal où tourne `stripe listen`
- Vérifiez les logs de l'application Next.js
- Vérifiez dans le Stripe Dashboard → **Événements** pour voir les webhooks envoyés

### Différence entre environnement local et production

| Aspect | Local (Test) | Production |
|--------|-------------|------------|
| Clés Stripe | `sk_test_...` / `pk_test_...` | `sk_live_...` / `pk_live_...` |
| Webhooks | Stripe CLI (`stripe listen`) | Endpoint configuré dans Dashboard |
| Paiements | Cartes de test | Vraies cartes bancaires |
| Données | Base de test Stripe | Vraies transactions |

## Sécurité

- ✅ Ne jamais exposer `STRIPE_SECRET_KEY` côté client
- ✅ Ne jamais commiter les clés dans Git
- ✅ Toujours vérifier la signature des webhooks
- ✅ Utiliser HTTPS en production
- ✅ Valider toutes les données côté serveur

## Ressources

- [Documentation Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Webhooks Stripe](https://stripe.com/docs/webhooks)
- [Cartes de test Stripe](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)



