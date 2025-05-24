# Documentation API Nouvoulook

## Prérequis
- Node.js installé
- Base de données PostgreSQL opérationnelle
- Dépendances installées (`npm install`)
- Lancer les migrations Prisma :
  ```bash
  npx prisma migrate dev --name init
  ```
- Lancer l'application :
  ```bash
  npm run start:dev
  ```

## Commandes de base de données

### Migrations
```bash
# Créer une nouvelle migration
npx prisma migrate dev --name <nom_de_la_migration>

# Appliquer les migrations en production
npx prisma migrate deploy

# Réinitialiser la base de données (attention: supprime toutes les données)
npx prisma migrate reset
```

### Seed
```bash
# Exécuter le seed de la base de données
npx prisma db seed

# Réinitialiser et seed la base de données
npx prisma migrate reset --force
```

### Prisma Studio
```bash
# Ouvrir l'interface de gestion de la base de données
npx prisma studio
```

### Génération du client Prisma
```bash
# Générer le client Prisma après modification du schema
npx prisma generate
```

---

## 1. Créer un utilisateur (Inscription)

**Endpoint :**
```
POST /auth/register
```

**Body JSON :**
```json
{
  "email": "admin@test.com",
  "password": "password123",
  "firstname": "Admin",
  "lastname": "Test"
}
```

**Headers :**
- Content-Type: application/json

**Réponse attendue :**
- 201 Created
- Un objet contenant un `access_token`, un `refresh_token` et les infos utilisateur

---

## 2. Se connecter (Login)

**Endpoint :**
```
POST /auth/login
```

**Body JSON :**
```json
{
  "email": "admin@test.com",
  "password": "password123"
}
```

**Headers :**
- Content-Type: application/json

**Réponse attendue :**
- 200 OK
- Un objet contenant un `access_token`, un `refresh_token` et les infos utilisateur

---

## 3. Utiliser le token pour accéder aux routes protégées

Pour toutes les routes protégées, ajoutez l'en-tête suivant :
```
Authorization: Bearer <votre_access_token>
```

Exemple dans Postman/Thunder Client :
- Onglet Headers :
  - Key : Authorization
  - Value : Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

---

## 4. Créer un partenaire

**Endpoint :**
```
POST /partners
```

**Headers :**
- Content-Type: application/json
- Authorization: Bearer <votre_access_token>

**Body JSON :**
```json
{
  "name": "Nom du partenaire",
  "imageUrl": "https://exemple.com/image.jpg"
}
```

**Réponse attendue :**
- 201 Created
- Objet du partenaire créé

---

## 5. Lister les partenaires

**Endpoint :**
```
GET /partners
```

**Headers :**
- Authorization: Bearer <votre_access_token>

**Réponse attendue :**
- 200 OK
- Tableau de partenaires

---

## 6. Rafraîchir le token

**Endpoint :**
```
POST /auth/refresh
```

**Body JSON :**
```json
{
  "refresh_token": "<votre_refresh_token>"
}
```

**Réponse attendue :**
- 200 OK
- Nouvel access_token

---

## 7. Exemples de commandes curl

**Inscription :**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123","firstname":"Admin","lastname":"Test"}'
```

**Connexion :**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'
```

**Créer un partenaire :**
```bash
curl -X POST http://localhost:3001/partners \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <votre_access_token>" \
  -d '{"name":"Mon Partenaire","imageUrl":"https://exemple.com/image.jpg"}'
```

---

## 8. Conseils
- Utilisez toujours le préfixe `Bearer` dans l'en-tête Authorization.
- Si vous obtenez une erreur 401 ou 403, vérifiez que votre token est bien celui d'un utilisateur admin.
- Pour toute erreur 400, vérifiez les champs obligatoires dans le body de la requête.

---

## 9. Ressources utiles
- [Thunder Client (VS Code)](https://www.thunderclient.com/)
- [Postman](https://www.postman.com/)
- [Prisma Studio](https://www.prisma.io/studio) pour visualiser/modifier la base de données

---

**Contact :**
Pour toute question, contactez le développeur du projet.
