# Structure Supabase - Ateliers

## Table créée

La table `ateliers` a été créée avec succès dans Supabase avec la structure suivante :

### Champs

| Champ | Type | Description | Contraintes |
|-------|------|-------------|-------------|
| `id` | UUID | Identifiant unique | PRIMARY KEY, auto-généré |
| `titre` | TEXT | Titre de l'atelier | NOT NULL |
| `description_courte` | TEXT | Description courte pour les listes | NOT NULL |
| `description_longue` | TEXT | Description détaillée | NOT NULL |
| `prix` | NUMERIC(10,2) | Prix en euros | NOT NULL, >= 0 |
| `slug` | TEXT | URL-friendly identifier | NOT NULL, UNIQUE |
| `duree` | TEXT | Durée de l'atelier (ex: "1h30", "3h") | NOT NULL |
| `participants_max` | INTEGER | Nombre maximum de participants | NOT NULL, > 0 |
| `materiel_fourni` | BOOLEAN | Le matériel est-il fourni ? | NOT NULL, default true |
| `niveau_requis` | TEXT | Niveau requis (ex: "Tout niveau accepté") | NULLABLE |
| `age_minimum` | INTEGER | Âge minimum requis | NULLABLE, > 0 si défini |
| `parent_requis` | BOOLEAN | Présence d'un parent requise ? | NOT NULL, default false |
| `created_at` | TIMESTAMPTZ | Date de création | AUTO, default NOW() |
| `updated_at` | TIMESTAMPTZ | Date de mise à jour | AUTO, mis à jour automatiquement |

### Sécurité (RLS)

- **Row Level Security (RLS)** : ✅ Activé
- **Politique de lecture** : Accès public (tous peuvent lire)
- **Politique d'écriture** : Non configurée (à ajouter selon vos besoins d'authentification)

### Index créés

- Index sur `slug` pour les recherches rapides
- Index sur `created_at` (descendant) pour le tri

### Triggers

- Auto-mise à jour de `updated_at` lors de chaque modification

## Utilisation dans Next.js

### Types TypeScript

Les types ont été générés dans `types/database.types.ts` et des helpers dans `types/atelier.types.ts`.

```typescript
import { Atelier, AtelierInsert, AtelierUpdate } from '@/types/atelier.types'

// Type pour lire un atelier
const atelier: Atelier = {
  id: '...',
  titre: 'Mon atelier',
  description_courte: 'Description courte',
  description_longue: 'Description longue...',
  prix: 50.00,
  slug: 'mon-atelier',
  duree: '2h',
  participants_max: 8,
  materiel_fourni: true,
  niveau_requis: 'Tout niveau accepté',
  age_minimum: null,
  parent_requis: false,
  created_at: '2025-11-03T...',
  updated_at: '2025-11-03T...'
}

// Type pour insérer un atelier
const nouvelAtelier: AtelierInsert = {
  titre: 'Nouvel atelier',
  description_courte: 'Description',
  description_longue: 'Description détaillée',
  prix: 75.50,
  slug: 'nouvel-atelier',
  duree: '2h',
  participants_max: 10,
  materiel_fourni: true,
  niveau_requis: 'Tout niveau accepté',
  age_minimum: null,
  parent_requis: false
  // id, created_at, updated_at sont optionnels (auto-générés)
}

// Type pour mettre à jour un atelier
const miseAJour: AtelierUpdate = {
  prix: 80.00,
  participants_max: 12
  // Tous les champs sont optionnels
}
```

### Configuration Supabase Client

Pour utiliser cette table, vous devrez :

1. Installer le client Supabase :
```bash
npm install @supabase/supabase-js
```

2. Créer un fichier `.env.local` avec vos credentials :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anonyme
```

3. Créer un client Supabase (`lib/supabase.ts`) :
```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Exemples d'utilisation

#### Récupérer tous les ateliers

```typescript
import { supabase } from '@/lib/supabase'

const { data: ateliers, error } = await supabase
  .from('ateliers')
  .select('*')
  .order('created_at', { ascending: false })
```

#### Récupérer un atelier par slug

```typescript
const { data: atelier, error } = await supabase
  .from('ateliers')
  .select('*')
  .eq('slug', 'mon-atelier')
  .single()
```

#### Insérer un nouvel atelier (nécessite authentification admin)

```typescript
const { data, error } = await supabase
  .from('ateliers')
  .insert({
    titre: 'Atelier Céramique',
    description_courte: 'Découvrez l\'art de la céramique',
    description_longue: 'Une journée complète dédiée à...',
    prix: 120.00,
    slug: 'atelier-ceramique',
    duree: '4h',
    participants_max: 10,
    materiel_fourni: true,
    niveau_requis: 'Tout niveau accepté',
    age_minimum: null,
    parent_requis: false
  })
  .select()
  .single()
```

## Ateliers en base de données

Actuellement, 4 ateliers sont disponibles dans la base de données :

1. **Atelier de marqueterie de cuir** (37€, 1h30, 6 participants max)
   - Slug: `marqueterie-cuir`
   - Découverte de la marqueterie de cuir avec création d'un motif personnalisé

2. **Atelier Porte-Carte en Cuir Cousu Main** (69€, 3h30, 6 participants max, dès 8 ans)
   - Slug: `porte-carte-cuir-cousu-main`
   - Création d'un porte-carte personnalisé entièrement cousu main

3. **Atelier Création de Fleurs en Cuir** (37€, 1h30, 8 participants max)
   - Slug: `fleurs-cuir`
   - Création de 3 tiges de fleurs en cuir pour décoration

4. **Atelier Enfants – Création d'un Porte-Clé Tête de Cheval** (25€, 1h, dès 6 ans, parent requis)
   - Slug: `porte-cle-cheval-enfants`
   - Atelier parent-enfant pour créer un porte-clé personnalisé

## Prochaines étapes

1. ✅ Table créée
2. ✅ RLS activé avec lecture publique
3. ✅ Types TypeScript générés
4. ✅ Champs détaillés ajoutés (durée, participants, etc.)
5. ✅ Ateliers insérés en base de données
6. ⏳ Configurer le client Supabase dans Next.js
7. ⏳ Ajouter l'authentification pour les opérations d'écriture
8. ⏳ Créer les composants pour afficher les ateliers

