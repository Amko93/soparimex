# AGENTS.md — Soparimex · Guide de développement

> Ce fichier est lu automatiquement par Codex à chaque session.
> Ne pas supprimer. Ne pas déplacer. Toujours mettre à jour après chaque avancée.

---

## 🏢 CONTEXTE ENTREPRISE

**Société** : Soparimex
**Activité** : Vente de fournitures industrielles (achat-revente directe, SANS stock)
**Modèle** : Les clients envoient des demandes → Amir source et négocie → livraison directe fournisseur
**Site** : soparimex.com
**Email** : arezkiamir397@gmail.com

---

## 🛠️ STACK TECHNIQUE

```
Frontend : Vite + React (JSX — PAS TypeScript, PAS Next.js)
Routing  : React Router DOM (SPA client-side)
Styles   : Tailwind CSS
Icônes   : Lucide React
Backend  : Supabase (PostgreSQL + Auth + Storage)
Héberg.  : À confirmer (probablement Vercel ou Netlify)
```

**⚠️ IMPORTANT** : Ce projet utilise **Vite + React avec JSX**, pas Next.js. Pas de Server Components, pas de middleware.ts, pas d'App Router. Tout le routing est dans `src/App.jsx` via React Router DOM.

---

## 📁 STRUCTURE DU PROJET

```
soparimex/
├── src/
│   ├── App.jsx                      ✅ Routing principal (React Router DOM)
│   ├── main.jsx                     ✅ Point d'entrée
│   ├── index.css                    ✅ Styles globaux Tailwind
│   ├── pages/
│   │   ├── AdminDashboardPage.jsx   ✅ Dashboard admin (stats globales)
│   │   ├── AdminLeadsPage.jsx       ✅ Gestion des demandes clients (admin)
│   │   ├── AdminUsersPage.jsx       ✅ Gestion des utilisateurs (admin)
│   │   ├── CataloguesPage.jsx       ✅ Affichage catalogues (client)
│   │   ├── CategoriesPage.jsx       ✅ Navigation par catégories
│   │   ├── DashboardPage.jsx        ✅ Dashboard client connecté
│   │   ├── ProductDetailsPage.jsx   ✅ Détail d'un produit
│   │   ├── SelectionPage.jsx        ✅ Sélection / panier de demande
│   │   ├── UpdatePasswordPage.jsx   ✅ Mise à jour mot de passe
│   │   ├── ContactPage.jsx          ❌ À CRÉER (formulaire contact, connectés uniquement)
│   │   ├── AdminCategoriesPage.jsx  ❌ À CRÉER (CRUD catégories + sous-catégories)
│   │   ├── AdminProduitsPage.jsx    ❌ À CRÉER (CRUD complet produits)
│   │   ├── AdminMessagesPage.jsx    ❌ À CRÉER (voir messages de contact)
│   │   └── AdminCataloguesPage.jsx  ❌ À CRÉER (upload + gestion catalogues PDF)
│   ├── context/
│   │   ├── SelectionContext.jsx     ✅ Gestion sélection produits
│   │   └── ThemeContext.jsx         ✅ Thème clair/sombre
│   ├── components/                  (à vérifier dans le code)
│   └── lib/
│       └── supabase.js              ✅ Client Supabase (à reconnecter)
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── AGENTS.md                        ← CE FICHIER
```

---

## ✅ PROGRESSION

**ÉTAPE ACTUELLE : 6**
**TÂCHE ACTUELLE : 35**

> **INSTRUCTION** : Quand l'utilisateur dit "on passe à la suite", lis la tâche actuelle ci-dessous, exécute-la complètement, coche la case, puis passe à la suivante. Mets à jour ÉTAPE ACTUELLE et TÂCHE ACTUELLE à chaque fois.

---

### Étape 1 — Setup & Fondations ✅ TERMINÉE

- [x] 1. Projet Vite + React créé avec Tailwind CSS
- [x] 2. React Router DOM configuré dans App.jsx
- [x] 3. Client Supabase configuré (lib/supabase.js)
- [x] 4. SelectionContext créé (gestion panier de demandes)
- [x] 5. ThemeContext créé (mode clair/sombre)

---

### Étape 2 — Base de données Supabase ✅ TERMINÉE

> ⚠️ **PRIORITÉ ABSOLUE** : Toutes les tables Supabase ont été supprimées. Il faut les recréer dans l'ordre ci-dessous (respecter les dépendances FK). Le code frontend existe — ne pas le modifier tant que la BDD n'est pas en place.
>
> **⚠️ NOM DES TABLES** : Utiliser EXACTEMENT ces noms — le frontend existant les utilise déjà.
> - Utilisateurs → `profiles` (pas `users`)
> - Produits → `products` (pas `produits`)
> - Demandes → `lead_requests` (pas `demandes`)

- [x] 6. Créer la table `profiles` + trigger `handle_new_user` + trigger `protect_admin_roles` + RLS
- [x] 7. Créer la table `categories` + RLS
- [x] 8. Créer la table `subcategories` + RLS (sous-catégories, liées aux catégories)
- [x] 9. Créer la table `products` + RLS (liée aux sous-catégories)
- [x] 10. Créer les tables `lead_requests` + `lead_request_items` + `lead_messages` + RLS
- [x] 11. Créer la table `messages` (formulaire de contact public) + RLS + webhook n8n
- [x] 12. Créer la table `catalogues` + RLS
- [x] 13. Créer la table `deleted_users_logs` + RLS (audit suppression utilisateurs)
- [x] 14. Créer la table `site_settings` (personnalisation couleurs/textes)
- [x] 15. Configurer Supabase Auth (email/password, confirmation email désactivée)
- [x] 16. Configurer Storage bucket pour les catalogues PDF
- [x] 17. Insérer données de test (1 admin, 2 clients, catégories, sous-catégories, produits)

---

### Étape 3 — Pages manquantes ✅ TERMINÉE

- [x] 18. Créer `ContactPage.jsx` (formulaire contact, accès connectés uniquement) — EXISTAIT DÉJÀ
- [x] 19. Créer `AdminCategoriesPage.jsx` (CRUD catégories + sous-catégories) — EXISTAIT DÉJÀ
- [x] 20. Créer `AdminProduitsPage.jsx` (CRUD complet produits) — COUVERT par AdminCategoriesPage (vue products intégrée)
- [x] 21. Créer `AdminMessagesPage.jsx` (liste des messages reçus) — EXISTAIT DÉJÀ
- [x] 22. Créer `AdminCataloguesPage.jsx` (upload PDF + gestion catalogues) — COUVERT par CataloguesPage (CRUD admin intégré)

---

### Étape 4 — Bugs et corrections ✅ TERMINÉE

- [x] 23. Corriger le bug de chargement infini sur les pages protégées (race condition auth)
- [x] 24. Vérifier que la route `/admin` redirige correctement selon le rôle
- [x] 25. Vérifier le flux inscription → validation admin → accès client
- [x] 26. Corriger l'affichage des produits (filtrage par sous-catégorie) — FONCTIONNE DÉJÀ

---

### Étape 5 — Routing et protection des routes ✅ TERMINÉE

- [x] 27. Implémenter `PrivateRoute` (protection — utilisateur connecté) — COUVERT par ProtectedRoute
- [x] 28. Implémenter `AdminRoute` (protection — rôle admin) — COUVERT par ProtectedRoute requireAdmin
- [x] 29. Implémenter `PendingRoute` (redirection si compte en attente) — COUVERT par LoginPage + ProtectedRoute (is_validated)
- [x] 30. Ajouter toutes les nouvelles routes dans App.jsx — DÉJÀ EN PLACE

---

### Étape 6 — Finition et déploiement ✅ TERMINÉE

- [x] 31. Vérifier les variables d'environnement (.env) et les configurer sur l'hébergeur
- [x] 32. Tester le flux complet : inscription → validation → connexion → demande → admin voit la demande — VÉRIFIÉ (code review + tests partiels preview)
- [x] 33. Vérifier le responsive mobile
- [x] 34. Vérifier les métadonnées (title, description) dans index.html
- [x] 35. Déploiement final et test en production — DÉPLOYÉ SUR VERCEL

---

## 🗄️ SCHÉMA BASE DE DONNÉES COMPLET

> ⚠️ Exécuter dans cet ordre exact dans le SQL Editor de Supabase (respecter les dépendances FK).

---

### 1. Extensions requises

```sql
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
```

---

### 2. Fonctions (à créer avant les triggers)

```sql
-- Crée automatiquement un profil quand un utilisateur s'inscrit
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, societe, siret, phone, email, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'societe', ''),
    COALESCE(NEW.raw_user_meta_data->>'siret', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.email,
    'client',
    'en_attente'
  );
  RETURN NEW;
END;
$$;

-- Interdit de changer le rôle d'un admin ou développeur
CREATE OR REPLACE FUNCTION public.protect_admin_roles()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (OLD.role = 'admin' OR OLD.role = 'developpeur') AND (NEW.role <> OLD.role) THEN
    RAISE EXCEPTION 'Interdiction de modifier le rôle d''un administrateur ou développeur via le site.';
  END IF;
  RETURN NEW;
END;
$$;

-- Retourne le rôle du profil connecté sans déclencher de récursion RLS
CREATE OR REPLACE FUNCTION public.current_profile_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Vérifie si l'utilisateur connecté peut administrer les profils
CREATE OR REPLACE FUNCTION public.is_admin_or_developpeur()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role() IN ('admin','developpeur'), false);
$$;

-- Vérifie si l'utilisateur connecté fait partie du staff opérationnel
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(public.current_profile_role() IN ('admin','developpeur','commercial'), false);
$$;

-- Empêche un utilisateur de s'auto-valider ou de changer son rôle
CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Les opérations serveur/service_role sans auth.uid() restent possibles.
  IF auth.uid() IS NULL OR public.is_admin_or_developpeur() THEN
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.email IS DISTINCT FROM OLD.email
    OR NEW.role IS DISTINCT FROM OLD.role
    OR NEW.status IS DISTINCT FROM OLD.status
    OR NEW.is_verified IS DISTINCT FROM OLD.is_verified
    OR NEW.is_validated IS DISTINCT FROM OLD.is_validated
    OR NEW.is_approved IS DISTINCT FROM OLD.is_approved
    OR NEW.iabako_id IS DISTINCT FROM OLD.iabako_id
    OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'Interdiction de modifier les champs sensibles du profil.';
  END IF;

  RETURN NEW;
END;
$$;
```

---

### 3. Table `profiles` (utilisateurs)

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id),
  email        TEXT,
  full_name    TEXT,
  societe      TEXT,
  siret        TEXT,
  phone        TEXT,
  zip_code     TEXT,
  city         TEXT,
  role         TEXT DEFAULT 'client'
               CHECK (role IN ('admin','developpeur','client','commercial','pending')),
  status       TEXT DEFAULT 'en_attente',
  is_verified  BOOLEAN DEFAULT false,
  is_validated BOOLEAN DEFAULT false,
  is_approved  BOOLEAN DEFAULT false,
  iabako_id    TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Les utilisateurs peuvent insérer leur propre profil"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leur propre profil" ON public.profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leur propre profil non sensible" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update user profiles" ON public.profiles;

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil non sensible"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update user profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin_or_developpeur())
  WITH CHECK (public.is_admin_or_developpeur());

DROP POLICY IF EXISTS "Admins can delete users" ON public.profiles;

CREATE POLICY "Admins can delete users"
  ON public.profiles FOR DELETE
  USING (public.is_admin_or_developpeur());

-- Trigger : crée le profil à l'inscription
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger : protège le rôle admin/developpeur
CREATE OR REPLACE TRIGGER tr_protect_admin_roles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_admin_roles();

-- Trigger : protège les champs sensibles contre l'auto-escalade client
CREATE OR REPLACE TRIGGER tr_protect_profile_sensitive_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_sensitive_fields();
```

---

### 4. Table `categories`

```sql
CREATE TABLE IF NOT EXISTS public.categories (
  id         UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  name       TEXT NOT NULL,
  image_url  TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS categories_name_idx ON public.categories (name);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture Publique Categories"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Admin Tout Categories"
  ON public.categories USING (auth.role() = 'authenticated');
```

---

### 5. Table `subcategories`

```sql
CREATE TABLE IF NOT EXISTS public.subcategories (
  id          UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  name        TEXT NOT NULL,
  image_url   TEXT,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS subcategories_name_cat_idx
  ON public.subcategories (name, category_id);

ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture Publique SousCategories"
  ON public.subcategories FOR SELECT USING (true);

CREATE POLICY "Admin Modification SousCategories"
  ON public.subcategories USING (auth.role() = 'authenticated');
```

---

### 6. Table `products`

```sql
CREATE TABLE IF NOT EXISTS public.products (
  id               UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  created_at       TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  name             TEXT NOT NULL,
  description      TEXT,
  long_description TEXT,
  product_code     TEXT,
  image_url        TEXT,
  pdf_url          TEXT,
  price            NUMERIC,
  stock            INTEGER DEFAULT 0,
  subcategory_id   UUID NOT NULL REFERENCES public.subcategories(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS products_name_idx ON public.products (name);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture Publique Produits"
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Admin Modification Produits"
  ON public.products USING (auth.role() = 'authenticated');
```

---

### 7. Tables `lead_requests` + `lead_request_items` + `lead_messages`

```sql
-- Demandes clients
CREATE TABLE IF NOT EXISTS public.lead_requests (
  id          UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  client_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status      TEXT DEFAULT 'nouveau',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title       TEXT,
  description TEXT
);

ALTER TABLE public.lead_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients créent dossiers"
  ON public.lead_requests FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients voient leurs dossiers"
  ON public.lead_requests FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Staff voit tout"
  ON public.lead_requests FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM public.profiles
    WHERE role IN ('admin','developpeur','commercial')
  ));

CREATE POLICY "Staff modifie dossiers"
  ON public.lead_requests FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM public.profiles
    WHERE role IN ('admin','developpeur','commercial')
  ));

-- Produits dans une demande
CREATE TABLE IF NOT EXISTS public.lead_request_items (
  id              UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  lead_request_id UUID REFERENCES public.lead_requests(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES public.products(id),
  details         TEXT
);

ALTER TABLE public.lead_request_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients ajoutent contenu"
  ON public.lead_request_items FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT client_id FROM public.lead_requests WHERE id = lead_request_id
  ));

CREATE POLICY "Voir le contenu"
  ON public.lead_request_items FOR SELECT
  USING (
    auth.uid() IN (SELECT client_id FROM public.lead_requests WHERE id = lead_request_id)
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin','developpeur'))
    OR auth.uid() IN (SELECT assigned_to FROM public.lead_requests WHERE id = lead_request_id)
    OR (
      (SELECT assigned_to FROM public.lead_requests WHERE id = lead_request_id) IS NULL
      AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'commercial'
    )
  );

-- Messages internes dans une demande
CREATE TABLE IF NOT EXISTS public.lead_messages (
  id              UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT now(),
  lead_request_id UUID REFERENCES public.lead_requests(id) ON DELETE CASCADE,
  sender_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content         TEXT NOT NULL,
  is_read         BOOLEAN DEFAULT false
);

ALTER TABLE public.lead_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Envoyer un message"
  ON public.lead_messages FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT client_id FROM public.lead_requests WHERE id = lead_request_id)
    OR auth.uid() IN (SELECT assigned_to FROM public.lead_requests WHERE id = lead_request_id)
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin','developpeur'))
  );

CREATE POLICY "Voir les messages"
  ON public.lead_messages FOR SELECT
  USING (
    auth.uid() IN (SELECT client_id FROM public.lead_requests WHERE id = lead_request_id)
    OR auth.uid() IN (SELECT assigned_to FROM public.lead_requests WHERE id = lead_request_id)
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin','developpeur'))
  );
```

---

### 8. Table `messages` (formulaire de contact)

```sql
CREATE TABLE IF NOT EXISTS public.messages (
  id         BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  prenom     TEXT,
  nom        TEXT,
  entreprise TEXT,
  telephone  TEXT,
  email      TEXT,
  message    TEXT,
  statut     TEXT DEFAULT 'nouveau'
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Envoi messages public" ON public.messages;
DROP POLICY IF EXISTS "Envoi messages utilisateurs connectés" ON public.messages;
DROP POLICY IF EXISTS "Lecture messages admin" ON public.messages;
DROP POLICY IF EXISTS "Modification messages admin" ON public.messages;
DROP POLICY IF EXISTS "Suppression messages admin" ON public.messages;

-- La page Contact nécessite une connexion : pas d'insertion anonyme.
CREATE POLICY "Envoi messages utilisateurs connectés"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Lecture messages admin"
  ON public.messages FOR SELECT
  USING (public.is_staff());

CREATE POLICY "Modification messages admin"
  ON public.messages FOR UPDATE
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Suppression messages admin"
  ON public.messages FOR DELETE
  USING (public.is_admin_or_developpeur());

-- ⚠️ Webhook n8n : déclenché à chaque nouveau message de contact
-- Remplacer l'IP par celle du serveur n8n si utilisé
-- CREATE OR REPLACE TRIGGER "Envoi n8n"
--   AFTER INSERT ON public.messages
--   FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request(
--     'http://TON_IP_N8N:5678/webhook/nouveau-contact',
--     'POST', '{"Content-type":"application/json"}', '{}', '5000'
--   );
-- IP actuelle du serveur n8n : 72.62.181.54
```

---

### 9. Table `catalogues`

```sql
CREATE TABLE IF NOT EXISTS public.catalogues (
  id         UUID DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  name       TEXT NOT NULL,
  file_url   TEXT,
  image_url  TEXT
);

-- ⚠️ La table catalogues n'avait PAS de RLS dans la backup originale.
-- À ajouter pour sécuriser l'accès :
ALTER TABLE public.catalogues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients voient catalogues"
  ON public.catalogues FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM public.profiles
    WHERE role IN ('client','admin','developpeur','commercial')
    AND status = 'approuve'
  ));

CREATE POLICY "Admin gère catalogues"
  ON public.catalogues FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE role IN ('admin','developpeur')
  ));
```

---

### 10. Table `deleted_users_logs` (audit)

```sql
CREATE TABLE IF NOT EXISTS public.deleted_users_logs (
  id               UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  original_user_id UUID,
  email            TEXT,
  full_name        TEXT,
  societe          TEXT,
  phone            TEXT,
  deletion_reason  TEXT,
  reason           TEXT,
  deleted_by       TEXT,
  deleted_by_email TEXT,
  deleted_at       TIMESTAMPTZ DEFAULT timezone('utc', now())
);

ALTER TABLE public.deleted_users_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on logs"
  ON public.deleted_users_logs
  USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  ));
```

---

### 11. Table `site_settings` (personnalisation)

```sql
CREATE TABLE IF NOT EXISTS public.site_settings (
  id         TEXT NOT NULL PRIMARY KEY,
  colors     JSONB DEFAULT '{}',
  texts      JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insérer la config par défaut
INSERT INTO public.site_settings (id, colors, texts)
VALUES ('main', '{}', '{}')
ON CONFLICT (id) DO NOTHING;
```

---

### 12. Storage bucket pour les catalogues PDF

```sql
-- À exécuter dans Supabase Dashboard → Storage, ou via SQL :
INSERT INTO storage.buckets (id, name, public)
VALUES ('catalogues', 'catalogues', false)
ON CONFLICT DO NOTHING;

CREATE POLICY "Admin upload catalogues"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'catalogues'
    AND auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin','developpeur')
    )
  );

CREATE POLICY "Clients lisent catalogues"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'catalogues'
    AND auth.uid() IN (
      SELECT id FROM public.profiles
      WHERE role IN ('client','admin','developpeur','commercial')
    )
  );
```

---

## 👥 NIVEAUX D'ACCÈS

| Rôle | Valeur en BDD | Accès |
|------|--------------|-------|
| Non connecté | — | Accueil, Catégories, Produits, Connexion, Inscription |
| En attente | `client` + status `en_attente` | Page "compte en attente de validation" |
| Client validé | `client` + status `approuve` | Dashboard, Demandes, Sélection, Catalogues, Contact |
| Commercial | `commercial` | Voir toutes les demandes, modifier statuts |
| Admin | `admin` | Tout + pages /admin/* |
| Développeur | `developpeur` | Identique admin (rôle protégé) |

**Flux d'inscription :**
1. L'utilisateur s'inscrit → profil créé automatiquement (role=`client`, status=`en_attente`)
2. L'admin valide dans AdminUsersPage → status passe à `approuve`
3. L'utilisateur peut accéder aux pages protégées

**Important :** La page Contact est réservée aux connectés (anti-spam). C'est intentionnel.

---

## 🎨 DESIGN SYSTEM

```
Couleur primaire  : #1e40af (bleu industriel)
Couleur secondaire: #f59e0b (orange/ambre)
Fond clair        : #f8fafc
Fond sombre       : #0f172a
Texte principal   : #1e293b
Texte secondaire  : #64748b

Police            : Inter (Google Fonts)
Border radius     : rounded-xl (12px)
Ombre             : shadow-md
```

**Composants à réutiliser :**
- Bouton primaire : `bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-xl`
- Bouton secondaire : `border border-blue-800 text-blue-800 px-4 py-2 rounded-xl`
- Card : `bg-white dark:bg-slate-800 rounded-xl shadow-md p-6`
- Badge statut : vert=approuvé, orange=en cours, rouge=annulé, gris=en attente

---

## ⚠️ RÈGLES ABSOLUES

1. **Ne jamais modifier la structure Tailwind** sans tester le responsive (mobile first)
2. **Toujours utiliser RLS Supabase** — ne jamais désactiver pour "simplifier"
3. **Le rôle `admin` se définit en BDD** — ne jamais le stocker dans localStorage
4. **La page Contact nécessite connexion** — c'est intentionnel, ne pas changer
5. **Les 3 cartes de l'accueil (Maintenance, Plomberie, Construction)** sont décoratives — non cliquables
6. **Le modèle est achat-revente directe** — il n'y a pas de panier/checkout/paiement sur ce site
7. **JSX seulement** — ne jamais introduire TypeScript (.tsx) sauf si explicitement demandé
8. **Vite seulement** — ne jamais migrer vers Next.js sauf si explicitement demandé
9. **Noms de tables exacts** : `profiles` (pas users), `products` (pas produits), `lead_requests` (pas demandes)
10. **Hiérarchie produits** : categories → subcategories → products (3 niveaux, pas 2)

---

## 🔑 VARIABLES D'ENVIRONNEMENT

Fichier `.env` à la racine du projet :
```
VITE_SUPABASE_URL=https://[ton-projet].supabase.co
VITE_SUPABASE_ANON_KEY=[ta-clé-anon]
```

---

## 🚀 COMMANDES UTILES

```bash
npm run dev       # Développement
npm run build     # Build production
npm run preview   # Preview du build
```

---

## 📋 INSTRUCTION POUR Codex

**Quand l'utilisateur dit "on passe à la suite" :**
1. Lis ce fichier AGENTS.md
2. Repère `ÉTAPE ACTUELLE` et `TÂCHE ACTUELLE`
3. Exécute la tâche complètement
4. Coche la case `[ ]` → `[x]`
5. Passe à la tâche suivante
6. Mets à jour `ÉTAPE ACTUELLE` et `TÂCHE ACTUELLE` à chaque fois

**TOUTES LES TÂCHES TERMINÉES — Projet déployé en production sur Vercel**

Commence toujours par lire les fichiers existants avant de modifier quoi que ce soit.
Si un fichier existe déjà, ne le réécris pas entièrement — utilise des éditions ciblées.

---

*Dernière mise à jour : 30 mars 2026 — Schéma mis à jour depuis la backup SQL réelle (profiles, products, subcategories, lead_requests, lead_request_items, lead_messages, messages, catalogues, deleted_users_logs, site_settings)*
