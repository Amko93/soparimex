# Cahier des charges fonctionnel — Corrections et améliorations Soparimex

Dernière mise à jour : 3 mai 2026

## 1. Contexte

Soparimex est une plateforme B2B de fourniture industrielle. Le site permet aux visiteurs de consulter les catégories, produits et catalogues, puis aux clients validés de créer des demandes commerciales suivies par l'équipe Soparimex.

Le projet utilise Vite + React JSX, React Router DOM, Tailwind CSS et Supabase pour l'authentification, la base PostgreSQL, le stockage et les Edge Functions.

Ce cahier des charges formalise les corrections et améliorations issues de l'audit du code, avec une priorité forte sur la sécurité Supabase, la cohérence du schéma, les notifications et la fiabilité des parcours métier.

## 2. Objectifs

- Sécuriser les accès aux données sensibles et aux actions administrateur.
- Empêcher toute escalade de privilèges par un utilisateur client.
- Rendre fonctionnels les parcours métier essentiels : inscription, validation, demande, chat, pièces jointes, notifications, suppression utilisateur.
- Aligner le frontend, le schéma Supabase, les buckets Storage et les Edge Functions.
- Nettoyer les erreurs de lint et réduire les risques de maintenance.

## 3. Acteurs

### Visiteur non connecté

- Consulte l'accueil, les catégories, les sous-catégories, les produits, la recherche, les pages légales.
- Peut créer un compte.
- Ne doit pas accéder aux catalogues privés, demandes, messages ou pages admin.

### Client en attente

- Possède un compte créé mais non validé par l'administrateur.
- Ne doit pas accéder aux pages client protégées.
- Voit un message clair indiquant que le compte attend validation.

### Client validé

- Accède au dashboard, à sa sélection, à ses demandes, aux catalogues et au formulaire de contact/demande.
- Peut créer une demande depuis une sélection ou depuis le formulaire contact.
- Peut échanger dans le dossier de demande avec l'équipe Soparimex.
- Peut joindre des fichiers autorisés si la fonctionnalité est conservée.

### Commercial

- Accède aux demandes clients non assignées ou assignées à lui.
- Peut prendre un dossier, modifier son statut et répondre au client.
- Peut consulter les archives qui lui appartiennent.
- Ne doit pas gérer les utilisateurs, catégories, produits, paramètres globaux ou rôles.

### Admin

- Accède au tableau de bord administrateur.
- Valide ou refuse les comptes clients.
- Gère les utilisateurs non protégés.
- Gère les catégories, sous-catégories, produits, catalogues et messages.
- Ne peut pas modifier ou supprimer un compte développeur si cette protection est conservée.

### Développeur

- Dispose des droits administrateur complets.
- Peut gérer les rôles protégés selon les règles métier définies.

## 4. Périmètre fonctionnel à corriger

### 4.1 Authentification et validation des comptes

Exigences :

- À l'inscription, le profil doit être créé avec `role = client`, `is_validated = false` et un statut cohérent.
- Un utilisateur en attente ne doit pas accéder aux pages protégées.
- La validation admin doit mettre à jour tous les champs utilisés par le code et les policies : `is_validated = true` et, si conservé, `status = approuve`.
- Les routes protégées doivent se baser sur le profil Supabase, jamais sur localStorage.

Critères d'acceptation :

- Un client nouvellement inscrit est bloqué tant qu'il n'est pas validé.
- Après validation, il peut accéder au dashboard, aux catalogues et aux demandes.
- Un client ne peut pas changer son rôle via l'API Supabase.

### 4.2 Sécurité RLS Supabase

Corrections obligatoires :

- Restreindre la mise à jour de `profiles` pour empêcher un utilisateur de modifier `role`, `is_validated`, `is_approved`, `is_verified` ou tout autre champ sensible.
- Remplacer les policies trop larges des tables `categories`, `subcategories`, `products` par des policies basées sur le rôle réel dans `profiles`.
- Restreindre `messages` : seuls les admins/développeurs/commerciaux autorisés doivent lire, modifier ou supprimer les messages.
- Ajouter une policy claire sur `site_settings` : lecture publique si nécessaire, écriture admin/développeur uniquement.
- Vérifier les policies Storage pour les buckets `images`, `catalogues` et `lead-files`.

Critères d'acceptation :

- Un client authentifié ne peut pas modifier le catalogue via Supabase.
- Un client ne peut pas lire tous les messages de contact.
- Un client ne peut pas s'attribuer le rôle admin ou développeur.
- Les actions admin continuent de fonctionner pour les vrais admins.

### 4.3 Gestion des utilisateurs

Corrections obligatoires :

- Créer ou rétablir l'Edge Function `delete-user`, appelée par `AdminUsersPage` et `AdminUserProfilePage`.
- La suppression doit supprimer le compte Auth et le profil associé, ou documenter clairement la stratégie retenue.
- La suppression doit écrire un audit dans `deleted_users_logs` avec la raison, l'utilisateur supprimé et l'admin ayant effectué l'action.
- L'Edge Function doit vérifier que l'appelant est admin ou développeur.

Critères d'acceptation :

- Depuis l'admin, supprimer un utilisateur supprime bien son accès Auth.
- L'action échoue si elle est appelée par un client ou commercial.
- Une trace complète apparaît dans l'historique des suppressions.

### 4.4 Demandes clients et chat

Corrections obligatoires :

- Aligner la table `lead_messages` avec le frontend si les pièces jointes sont conservées : `file_url`, `file_name`, `file_type`.
- Ajouter ou retirer proprement le champ `notify_on_message` sur `lead_requests`.
- Vérifier que les clients voient uniquement leurs demandes.
- Vérifier que les commerciaux voient uniquement les dossiers non assignés ou assignés à eux.
- Corriger les champs de profil client affichés dans `AdminLeadDetailsPage` : utiliser `city`/`zip_code` ou migrer la BDD vers `ville`/`code_postal`, mais ne pas garder les deux conventions.

Critères d'acceptation :

- Un client peut créer une demande depuis la sélection.
- Le dossier apparaît côté admin/commercial.
- Le client et le staff peuvent échanger des messages.
- Les pièces jointes fonctionnent ou sont retirées de l'interface si non supportées.
- Un client ne peut pas ouvrir le dossier d'un autre client.

### 4.5 Notifications email

Corrections obligatoires :

- Étendre `send-email` pour gérer les types réellement envoyés par le frontend :
  - `new-lead`
  - `lead-message`
  - `contact` si encore utilisé
- Utiliser une adresse de notification configurable via `site_settings` ou une variable d'environnement, mais choisir une seule source prioritaire.
- Vérifier les droits d'appel de l'Edge Function.
- Éviter de laisser une fonction d'envoi générique exploitable comme relais email.
- Nettoyer les logs contenant le payload complet.

Critères d'acceptation :

- Une nouvelle demande envoie un email à l'adresse admin configurée.
- Un message staff vers client envoie une notification au client.
- Un message client vers commercial assigné envoie une notification au commercial si les notifications sont activées.
- Les erreurs email sont visibles côté logs sans exposer inutilement les données personnelles.

### 4.6 Catalogues et Storage

Corrections obligatoires :

- Aligner le bucket utilisé par le frontend avec le schéma : soit utiliser `catalogues`, soit documenter et sécuriser `images`.
- Si les PDF sont privés, utiliser des signed URLs au lieu de `getPublicUrl`.
- Vérifier que les clients validés peuvent lire les catalogues.
- Vérifier que seuls admin/développeur peuvent créer, modifier ou supprimer un catalogue.

Critères d'acceptation :

- Un admin peut uploader un PDF et une image de couverture.
- Un client validé peut télécharger le PDF.
- Un visiteur non connecté ne peut pas télécharger un catalogue privé.
- Un client ne peut pas uploader ou supprimer un catalogue.

### 4.7 Personnalisation du site

Corrections obligatoires :

- Corriger `ThemeCustomizer` pour sauvegarder dans `site_settings.id = main`, comme `ThemeContext`.
- Vérifier que la sauvegarde affiche un succès seulement si une ligne a réellement été mise à jour.
- Restreindre l'écriture des paramètres aux admins/développeurs.

Critères d'acceptation :

- Un admin change une couleur ou un texte, sauvegarde, recharge la page, et voit la modification persistée.
- Un client ne voit pas le customizer et ne peut pas modifier `site_settings` par API.

### 4.8 Formulaire contact et messages

État actuel :

- La page contact crée une demande dans `lead_requests` et un premier message dans `lead_messages`.
- La table `messages` existe encore pour une ancienne logique de formulaire public.

Décision fonctionnelle à prendre :

- Option A : conserver `messages` comme boîte de réception séparée.
- Option B : supprimer/abandonner `messages` et utiliser uniquement `lead_requests`.

Exigence :

- Choisir une seule logique principale pour éviter deux systèmes de messages concurrents.
- Si `messages` est conservée, elle doit être sécurisée par RLS admin/staff.

## 5. Anomalies priorisées

### P0 — Critique

1. Escalade de rôle possible via `profiles`.
2. Messages de contact exposés par RLS trop permissive.
3. CRUD catégories, sous-catégories et produits ouvert à tout utilisateur connecté.

### P1 — Haute priorité

1. Edge Function `delete-user` absente.
2. Notifications email `new-lead` et `lead-message` non gérées.
3. Schéma `lead_messages` incomplet pour les pièces jointes.
4. Validation utilisateur incohérente entre `is_validated` et `status`.
5. Bucket catalogue incohérent entre code et schéma.
6. Personnalisation thème sauvegardée sur le mauvais identifiant.

### P2 — Moyenne priorité

1. Champs adresse incohérents : `address`, `ville`, `code_postal` côté code, `city`, `zip_code` côté schéma.
2. Lint en échec avec 5 erreurs.
3. Warnings React Hooks à nettoyer.
4. Bundle principal supérieur à 500 kB.
5. Vulnérabilités `react-router-dom` signalées par `npm audit`.

## 6. Exigences non fonctionnelles

### Sécurité

- Toutes les tables sensibles doivent avoir RLS activée.
- Toute écriture administrative doit vérifier le rôle côté BDD ou Edge Function, pas seulement côté frontend.
- Les Edge Functions sensibles doivent authentifier l'appelant.
- Les buckets privés doivent utiliser des policies et/ou signed URLs.
- Les données personnelles ne doivent pas être exposées dans les logs ou réponses publiques.

### Fiabilité

- Les erreurs Supabase doivent être affichées ou journalisées de manière exploitable.
- Les actions critiques doivent confirmer leur succès réel, pas seulement l'absence d'exception.
- Les chemins métier principaux doivent être testés après chaque correction.

### Maintenabilité

- Garder Vite + React JSX.
- Ne pas introduire TypeScript dans le frontend.
- Centraliser les helpers réutilisés : rôle admin, extraction Storage path, labels statut.
- Nettoyer les exports de contextes pour satisfaire Fast Refresh ou ajuster la règle ESLint avec justification.

## 7. Plan de recette

### Parcours inscription

1. Créer un compte client.
2. Vérifier qu'il est bloqué avant validation.
3. Valider le compte depuis l'admin.
4. Vérifier l'accès au dashboard, catalogues, sélection et demandes.

### Parcours demande

1. Ajouter un produit à la sélection.
2. Envoyer une demande.
3. Vérifier l'apparition dans `/admin/leads`.
4. Prendre le dossier avec un commercial.
5. Échanger un message client/staff.
6. Tester une pièce jointe si conservée.

### Parcours sécurité

1. Avec un compte client, tenter de modifier `profiles.role` via API : doit échouer.
2. Avec un compte client, tenter de modifier un produit : doit échouer.
3. Avec un compte client, tenter de lire `messages` : doit échouer.
4. Avec un commercial, tenter d'accéder à `/admin/users` : doit échouer.

### Parcours admin

1. Modifier une couleur ou un texte depuis le customizer.
2. Recharger la page et vérifier la persistance.
3. Créer/modifier/supprimer une catégorie, sous-catégorie et produit.
4. Uploader un catalogue PDF.
5. Supprimer un utilisateur test et vérifier l'audit.

### Vérifications techniques

- `npm run lint` doit passer sans erreur.
- `npm run build` doit passer.
- `npm audit --omit=dev` ne doit plus signaler de vulnérabilité critique ou high liée aux dépendances directes.

## 8. Livrables attendus

- Migrations SQL ou script Supabase corrigeant les tables, colonnes et RLS.
- Edge Function `delete-user`.
- Edge Function `send-email` corrigée.
- Frontend aligné avec le schéma retenu.
- Documentation `AGENTS.md` mise à jour avec le schéma réel.
- Recette manuelle validée sur environnement de test puis production.

## 9. Ordre de réalisation recommandé

1. Corriger les RLS critiques `profiles`, `messages`, `categories`, `subcategories`, `products`.
2. Aligner le schéma `lead_requests`, `lead_messages`, `profiles`, `catalogues`.
3. Corriger ou créer les Edge Functions `delete-user` et `send-email`.
4. Corriger le frontend impacté : validation utilisateur, buckets, thème, champs profil.
5. Nettoyer lint, audit npm et warnings principaux.
6. Faire la recette complète.
7. Mettre à jour `AGENTS.md` après validation.

