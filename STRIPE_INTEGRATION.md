# Intégration Stripe pour les Ateliers

## Vue d'ensemble

L'application est maintenant synchronisée avec Stripe. Chaque fois qu'un atelier est créé, modifié ou supprimé dans l'application, les changements sont automatiquement répercutés dans Stripe.

## Configuration requise

### 1. Obtenir les clés API Stripe

1. Créez un compte Stripe sur [stripe.com](https://stripe.com) si ce n'est pas déjà fait
2. Allez dans le tableau de bord Stripe → Développeurs → Clés API
3. Copiez votre **clé secrète** (Secret key)

### 2. Configurer les variables d'environnement

Ajoutez votre clé secrète Stripe dans votre fichier `.env.local` :

```env
STRIPE_SECRET_KEY=sk_test_...
```

**Important:** N'utilisez **JAMAIS** la clé secrète de production (`sk_live_...`) tant que vous êtes en développement. Utilisez toujours la clé de test (`sk_test_...`).

## Fonctionnalités implémentées

### Création d'atelier

Lorsqu'un atelier est créé via l'interface admin :

1. ✅ L'atelier est créé dans Supabase
2. ✅ Un **Product** est créé dans Stripe avec :
   - Nom = titre de l'atelier
   - Description = description courte
   - Métadonnées : slug, durée, participants max, etc.
3. ✅ Un **Price** est créé dans Stripe avec :
   - Montant = prix de l'atelier (converti en centimes)
   - Devise = EUR
4. ✅ Les IDs Stripe (`stripe_product_id` et `stripe_price_id`) sont sauvegardés dans Supabase

**Note:** Si la création Stripe échoue, l'atelier ne sera pas créé (rollback automatique).

### Modification d'atelier

Lorsqu'un atelier est modifié :

1. ✅ L'atelier est mis à jour dans Supabase
2. ✅ Le Product Stripe est mis à jour avec les nouvelles informations
3. ✅ Si le **prix change** :
   - L'ancien Price est désactivé (archived)
   - Un nouveau Price est créé avec le nouveau montant
   - Le nouvel ID de prix est sauvegardé dans Supabase

**Note:** Les modifications Stripe qui échouent n'empêchent pas la mise à jour dans Supabase (les changements sont tout de même sauvegardés).

### Suppression d'atelier

Lorsqu'un atelier est supprimé :

1. ✅ Le Product Stripe est archivé (désactivé)
2. ✅ L'atelier est supprimé de Supabase

**Note:** Les erreurs Stripe n'empêchent pas la suppression dans Supabase.

## Structure de la base de données

### Nouveaux champs dans la table `ateliers`

| Champ | Type | Description |
|-------|------|-------------|
| `stripe_product_id` | TEXT (nullable) | ID du Product dans Stripe |
| `stripe_price_id` | TEXT (nullable) | ID du Price actif dans Stripe |

## Architecture technique

### Fichiers modifiés

1. **`lib/stripe.ts`** (nouveau)
   - Configuration du client Stripe
   - `createStripeProduct()` - Crée un Product et un Price
   - `updateStripeProduct()` - Met à jour un Product et gère les changements de prix
   - `archiveStripeProduct()` - Archive un Product

2. **`app/api/ateliers/route.ts`**
   - Intégration de la création Stripe dans le POST

3. **`app/api/ateliers/[id]/route.ts`**
   - Intégration de la mise à jour Stripe dans le PATCH
   - Intégration de l'archivage Stripe dans le DELETE

4. **`types/database.types.ts`**
   - Types mis à jour avec les nouveaux champs Stripe

### Gestion des erreurs

L'implémentation suit une approche pragmatique :

- **Création** : Si Stripe échoue → rollback complet (atelier non créé)
- **Modification** : Si Stripe échoue → changements Supabase conservés (logged)
- **Suppression** : Si Stripe échoue → suppression Supabase effectuée (logged)

Cette approche garantit que votre base de données reste cohérente même si Stripe rencontre des problèmes temporaires.

## Prochaines étapes

Pour implémenter le paiement via Stripe :

### 1. Créer une page de checkout

Utilisez `stripe_price_id` pour créer une session de paiement :

```typescript
import { stripe } from '@/lib/stripe'

const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price: atelier.stripe_price_id, // Utiliser le prix de l'atelier
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_URL}/ateliers/${atelier.slug}`,
})

// Rediriger vers session.url
```

### 2. Créer une route API pour le checkout

```typescript
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const { priceId, atelierId } = await request.json()
  
  const session = await stripe.checkout.sessions.create({
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/ateliers`,
    metadata: {
      atelier_id: atelierId,
    },
  })

  return NextResponse.json({ url: session.url })
}
```

### 3. Gérer les webhooks Stripe

Pour suivre les paiements réussis, configurez un webhook :

```typescript
// app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    // Enregistrer la réservation dans Supabase
    // Envoyer un email de confirmation
  }

  return NextResponse.json({ received: true })
}
```

## Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)

## Dépannage

### Erreur : "STRIPE_SECRET_KEY is not defined"

Assurez-vous que votre fichier `.env.local` contient la variable `STRIPE_SECRET_KEY`.

### Les produits ne sont pas créés dans Stripe

1. Vérifiez que votre clé API Stripe est valide
2. Consultez les logs de l'application (console serveur)
3. Vérifiez que vous avez bien accès à Internet

### Migration Supabase

Si vous avez des ateliers existants sans IDs Stripe, ils ne seront pas automatiquement synchronisés. Vous pouvez :

1. Créer un script de migration pour synchroniser les ateliers existants
2. Ou simplement éditer chaque atelier pour déclencher la synchronisation

## Support

Pour toute question ou problème, consultez :
- [Documentation Stripe](https://stripe.com/docs)
- [Support Stripe](https://support.stripe.com/)



