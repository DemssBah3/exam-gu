# Exam-GU API - Système de Gestion des Examens en Ligne

API REST complète pour la gestion des examens en ligne de l'UQAC, générée à partir d'une spécification OpenAPI et implémentée avec Express.js/Node.js.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 14+ 
- npm ou yarn

### Installation

```bash
cd exam-gu-server
npm install
```

### Lancer le serveur

```bash
npm start
```

Le serveur démarre sur `http://localhost:8080/api/v1`

#### Documentation Swagger
Une fois le serveur lancé, accédez à :
```
http://localhost:8080/docs
```

## 📋 Caractéristiques

### 🔐 Authentification JWT
- Login/logout avec génération de token JWT
- Historique des connexions
- Profil utilisateur `/auth/me`
- Middleware de vérification de rôles (ADMIN, TEACHER, STUDENT)

### 👥 Gestion des Utilisateurs (Admin)
- CRUD complet des utilisateurs
- Filtrage par rôle (ADMIN, TEACHER, STUDENT)
- Chiffrage des mots de passe (bcrypt)

### 📚 Gestion des Cours et Sessions
- Création/modification/suppression de cours
- Sessions avec dates de début/fin
- Inscriptions d'étudiants
- Assignations d'enseignants

### 📝 Gestion des Examens
- Créer des examens (état DRAFT)
- Trois types de questions :
  - **MCQ** (Choix multiples)
  - **TRUE_FALSE** (Vrai/Faux)
  - **OPEN_ENDED** (Questions ouvertes)
- Transitions d'état validées : DRAFT → ACTIVE → CLOSED → IN_GRADING → GRADED
- Configuration de la visibilité des résultats (score, réponses, feedback)

### 🎯 Tentatives et Réponses
- Démarrer une tentative pour un examen
- Soumettre/sauvegarder des réponses par question
- Soumission finale avec création automatique d'un résultat
- Limite de tentatives configurable par examen

### ✅ Résultats et Correction
- Lister les résultats (enseignant voit tous, étudiant voit les siens)
- Correction manuelle des questions ouvertes
- Calcul automatique du score pour MCQ et True/False
- Visibilité contrôlée des résultats (ADMIN/TEACHER décide)

## 🗂️ Structure du Projet

```
exam-gu-server/
├── api/                          # Spec OpenAPI
│   └── openapi.yaml
├── db/
│   └── database.js               # Base de données en mémoire (sqlite/PostgreSQL en prod)
├── middleware/
│   └── auth.js                   # JWT verification & role authorization
├── controllers/                  # Route handlers
│   ├── AdminController.js
│   ├── AuthenticationController.js
│   ├── ExamsController.js
│   ├── QuestionsController.js
│   ├── AttemptsController.js
│   └── ResultsController.js
├── services/                     # Business logic
│   ├── AdminService.js
│   ├── AuthenticationService.js
│   ├── ExamsService.js
│   ├── QuestionsService.js
│   ├── AttemptsService.js
│   └── ResultsService.js
├── utils/
│   └── openapiRouter.js          # Route binding (autogénéré)
├── config.js                     # Configuration
├── expressServer.js              # Setup Express
├── logger.js                     # Winston logger
├── package.json
└── index.js                      # Entry point
```

## 🔑 Identifiants de Démo

Le serveur démarre avec des données de test :

### Admin
- Email: `admin@uqac.ca`
- Mot de passe: `password123`
- Rôle: ADMIN

### Enseignant
- Email: `teacher@uqac.ca`
- Mot de passe: `password123`
- Rôle: TEACHER

### Étudiant
- Email: `student@uqac.ca`
- Mot de passe: `password123`
- Rôle: STUDENT

## 🧪 Exemple de Flux d'Utilisation

### 1. Se connecter
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@uqac.ca","password":"password123"}'
```
Réponse :
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "teacher@uqac.ca",
    "firstName": "Teacher",
    "lastName": "Test",
    "role": "TEACHER",
    "createdAt": "..."
  }
}
```

### 2. Récupérer le profil
```bash
curl -X GET http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

### 3. Créer un examen (Enseignant)
```bash
curl -X POST http://localhost:8080/api/v1/exams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Examen Final - INF111",
    "description": "...",
    "sessionId": "...",
    "duration": 120,
    "startTime": "2025-04-15T10:00:00Z",
    "endTime": "2025-04-15T12:00:00Z",
    "maxAttempts": 2
  }'
```

### 4. Ajouter une question (Enseignant)
```bash
curl -X POST http://localhost:8080/api/v1/exams/{examId}/questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "type": "MCQ",
    "text": "Quelle est la sortie de...",
    "points": 5,
    "order": 1,
    "options": [
      {"text": "option1", "isCorrect": false},
      {"text": "option2", "isCorrect": true}
    ]
  }'
```

### 5. Publier l'examen (Enseignant)
```bash
curl -X PUT http://localhost:8080/api/v1/exams/{examId}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"status": "ACTIVE"}'
```

### 6. Démarrer une tentative (Étudiant)
```bash
curl -X POST http://localhost:8080/api/v1/exams/{examId}/attempts \
  -H "Authorization: Bearer <token>"
```

### 7. Soumettre une réponse (Étudiant)
```bash
curl -X POST http://localhost:8080/api/v1/exams/{examId}/attempts/{attemptId}/answers/{questionId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"content": "option2"}'
```

### 8. Soumettre l'examen (Étudiant)
```bash
curl -X POST http://localhost:8080/api/v1/exams/{examId}/attempts/{attemptId}/submit \
  -H "Authorization: Bearer <token>"
```

### 9. Corriger une question ouverte (Enseignant)
```bash
curl -X PUT http://localhost:8080/api/v1/exams/{examId}/results/{resultId}/questions/{questionId}/grade \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"points": 8.5, "feedback": "Bonne réponse"}'
```

## 🔧 Variables d'Environnement

```bash
JWT_SECRET=your-secret-key              # Secret pour les tokens JWT
NODE_ENV=development                    # development | production
PORT=8080                               # Port d'écoute
```

## 📦 Endpoints Principaux

### Authentification
- `POST /auth/login` - Connexion
- `POST /auth/logout` - Déconnexion
- `GET /auth/me` - Profil courant
- `GET /auth/login-history` - Historique des connexions

### Admin - Utilisateurs
- `GET /admin/users` - Lister (filtrage par rôle)
- `POST /admin/users` - Créer
- `GET /admin/users/{userId}` - Détails
- `PUT /admin/users/{userId}` - Modifier
- `DELETE /admin/users/{userId}` - Supprimer

### Admin - Cours & Sessions
- `GET /admin/courses` - Lister cours
- `POST /admin/courses` - Créer cours
- `GET /admin/sessions` - Lister sessions
- `POST /admin/sessions` - Créer session
- `GET /admin/enrollments` - Lister inscriptions
- `POST /admin/enrollments` - Inscrire étudiant
- `GET /admin/course-assignments` - Lister assignations
- `POST /admin/course-assignments` - Assigner enseignant

### Examens
- `GET /exams` - Lister mes examens
- `POST /exams` - Créer examen
- `GET /exams/{examId}` - Détails examen + questions
- `PUT /exams/{examId}` - Modifier examen
- `DELETE /exams/{examId}` - Supprimer examen
- `PUT /exams/{examId}/status` - Changer statut
- `PUT /exams/{examId}/visibility` - Configurer visibilité

### Questions
- `GET /exams/{examId}/questions` - Lister questions
- `POST /exams/{examId}/questions` - Ajouter question
- `GET /exams/{examId}/questions/{questionId}` - Détails question
- `PUT /exams/{examId}/questions/{questionId}` - Modifier question
- `DELETE /exams/{examId}/questions/{questionId}` - Supprimer question

### Tentatives
- `POST /exams/{examId}/attempts` - Démarrer tentative
- `GET /exams/{examId}/attempts/{attemptId}` - État tentative
- `POST /exams/{examId}/attempts/{attemptId}/answers/{questionId}` - Soumettre réponse
- `POST /exams/{examId}/attempts/{attemptId}/save` - Sauvegarder manuelle
- `POST /exams/{examId}/attempts/{attemptId}/submit` - Soumettre examen

### Résultats
- `GET /exams/{examId}/results` - Lister résultats
- `GET /exams/{examId}/results/{resultId}` - Détails résultat
- `PUT /exams/{examId}/results/{resultId}/questions/{questionId}/grade` - Corriger question ouverte

## 🚀 Prochaines Étapes pour la Production

1. **Base de données réelle**
   - Remplacer `db/database.js` par une connexion PostgreSQL/MongoDB
   - Ajouter migrations et seeders

2. **Authentification renforcée**
   - Refresh tokens
   - 2FA (two-factor authentication)
   - OAuth2/SSO intégration

3. **Validation robuste**
   - Ajouter Joi/Yup pour validation des inputs
   - Middleware de sanitization

4. **Logging & Monitoring**
   - Logs centralisés (ELK stack, Datadog)
   - APM (Application Performance Monitoring)

5. **Tests**
   - Tests unitaires (Jest/Mocha)
   - Tests d'intégration
   - Load testing

6. **Déploiement**
   - Docker containerization
   - CI/CD pipeline (GitHub Actions, GitLab CI)
   - Kubernetes orchestration

7. **Frontend**
   - Générer SDK client TypeScript/JavaScript (openapi-generator)
   - Application Web (React, Vue.js)
   - Application Mobile (React Native, Flutter)

## 📄 Licence

Unlicense - Libre d'utilisation

## 📞 Support

Pour toute question ou problème, contactez le support : support@examgu.uqac.ca
