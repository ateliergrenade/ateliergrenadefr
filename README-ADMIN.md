# Administration des Ateliers

## Configuration

### 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase

# Admin Password
ADMIN_PASSWORD=votre_mot_de_passe_admin
```

### 2. Lancer le serveur de développement

```bash
npm run dev
```

## Utilisation

### Connexion

1. Naviguez vers `/admin/login`
2. Entrez le mot de passe défini dans `ADMIN_PASSWORD`
3. Vous serez redirigé vers le tableau de bord admin

### Gestion des ateliers

Une fois connecté, vous pouvez :

- **Créer** un nouvel atelier avec le bouton "Nouvel atelier"
- **Modifier** un atelier existant en cliquant sur l'icône crayon
- **Supprimer** un atelier en cliquant sur l'icône corbeille (avec confirmation)
- **Se déconnecter** avec le bouton "Se déconnecter"

### Champs du formulaire

- **Titre** : Le nom de l'atelier (requis)
- **Slug** : URL-friendly identifier (requis, format : lettres-minuscules-tirets)
- **Prix** : Prix en euros (requis, minimum 0)
- **Description courte** : Brève description pour les listes (requis)
- **Description longue** : Description détaillée (requis)

## Sécurité

- La page `/admin` est protégée par un mot de passe
- Seule la page de login (`/admin/login`) est accessible sans authentification
- La session dure 24 heures
- Le cookie de session est HTTP-only pour plus de sécurité

## Architecture

### API Routes

- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/ateliers` - Liste tous les ateliers
- `POST /api/ateliers` - Crée un atelier (authentification requise)
- `PATCH /api/ateliers/[id]` - Met à jour un atelier (authentification requise)
- `DELETE /api/ateliers/[id]` - Supprime un atelier (authentification requise)

### Composants

- `AtelierForm` - Formulaire de création/édition
- `AtelierTable` - Tableau listant les ateliers
- `DeleteConfirmDialog` - Dialog de confirmation de suppression

### Pages

- `/admin/login` - Page de connexion
- `/admin` - Tableau de bord admin (protégé)

