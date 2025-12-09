# 🎓 Exam-GU - Plateforme de Gestion d'Examens en Ligne

Système complet de gestion d'examens en ligne pour l'Université du Québec à Chicoutimi (UQAC).

---

## 📋 Table des Matières

- [Vue d'Ensemble](#vue-densemble)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Technologies Utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Structure du Projet](#structure-du-projet)
- [API Documentation](#api-documentation)
- [Comptes de Démonstration](#comptes-de-démonstration)
- [Développement](#développement)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Contribuer](#contribuer)
- [Licence](#licence)

---

## 🎯 Vue d'Ensemble

Exam-GU est une plateforme moderne de gestion d'examens en ligne qui permet aux enseignants de créer et gérer des examens, et aux étudiants de les passer en ligne avec correction automatique et manuelle.

### Objectifs Principaux

- ✅ Gestion complète des utilisateurs (Admin, Enseignants, Étudiants)
- ✅ Création et gestion des cours et sessions
- ✅ Création d'examens avec différents types de questions
- ✅ Passage d'examens en ligne avec timer
- ✅ Correction automatique (QCM, Vrai/Faux)
- ✅ Correction manuelle (Questions ouvertes)
- ✅ Gestion de la visibilité des résultats
- ✅ Historique des tentatives et résultats

---

## ✨ Fonctionnalités

### 👨‍💼 Administration

- **Gestion des Utilisateurs**
  - Créer, modifier, supprimer des utilisateurs
  - Filtrer par rôle (Admin, Enseignant, Étudiant)
  - Voir l'historique des connexions

- **Gestion des Cours**
  - Créer des cours templates (code, titre, description, crédits)
  - Modifier et supprimer des cours
  - Voir tous les cours disponibles

- **Gestion des Sessions**
  - Créer des sessions de cours par semestre
  - Définir les dates de début et fin
  - Lier les sessions aux cours

- **Gestion des Inscriptions**
  - Inscrire des étudiants aux sessions
  - Voir toutes les inscriptions
  - Retirer des inscriptions

- **Gestion des Assignations**
  - Assigner des enseignants aux sessions
  - Voir toutes les assignations
  - Retirer des assignations

### 👨‍🏫 Enseignants

- **Mes Cours**
  - Voir les cours assignés
  - Accéder aux sessions actives

- **Gestion des Examens**
  - Créer des examens (titre, description, durée, dates)
  - Ajouter des questions (QCM, Vrai/Faux, Questions ouvertes)
  - Publier/fermer des examens
  - Gérer les statuts (Brouillon, Actif, Fermé, En correction, Corrigé)

- **Correction**
  - Correction automatique des QCM et Vrai/Faux
  - Correction manuelle des questions ouvertes
  - Ajouter des commentaires
  - Gérer la visibilité des résultats

- **Résultats**
  - Voir tous les résultats des étudiants
  - Statistiques par examen
  - Export des résultats

### 👨‍🎓 Étudiants

- **Mes Cours**
  - Voir les cours inscrits
  - Accéder aux examens disponibles

- **Passage d'Examens**
  - Démarrer une tentative d'examen
  - Timer en temps réel
  - Sauvegarde automatique des réponses
  - Auto-submit à la fin du temps
  - Nombre limité de tentatives

- **Mes Résultats**
  - Voir les résultats des examens passés
  - Consulter les corrections (si visibles)
  - Historique des tentatives

---

## 🏗️ Architecture

### Architecture Microservices

 FRONTEND (React) │ │ - React 18 + TypeScript │ │ - React Router (Navigation) │ │ - TanStack Query (State Management) │ │ - Tailwind CSS (Styling) │ └─────────────────────────────────────────────────────────┘ │ │ HTTP/REST │ ┌─────────────────────────────────────────────────────────┐ │ BACKEND (Node.js) │ │ - Express.js │ │ - OpenAPI Validator │ │ - JWT Authentication │ │ - SQLite Database │ └─────────────────────────────────────────────────────────┘


### Couches de l'Application

Frontend: ┌──────────────────────────────────────┐ │ Pages (Admin, Teacher, Student) │ ├──────────────────────────────────────┤ │ Components (Forms, Lists, Layout) │ ├──────────────────────────────────────┤ │ API Client (Axios) │ ├──────────────────────────────────────┤ │ Contexts (Auth) │ └──────────────────────────────────────┘

Backend: ┌──────────────────────────────────────┐ │ Controllers (Route Handlers) │ ├──────────────────────────────────────┤ │ Services (Business Logic) │ ├──────────────────────────────────────┤ │ Database (SQLite) │ ├──────────────────────────────────────┤ │ Middleware (Auth, Validation) │ └──────────────────────────────────────┘


---

## 🛠️ Technologies Utilisées

### Frontend

| Technologie | Version | Description |
|------------|---------|-------------|
| React | 18.2.0 | Bibliothèque UI |
| TypeScript | 5.2.2 | Typage statique |
| Vite | 5.0.8 | Build tool |
| React Router | 6.20.0 | Routing |
| TanStack Query | 5.12.2 | State management |
| Axios | 1.6.2 | HTTP client |
| React Hook Form | 7.48.2 | Gestion des formulaires |
| Zod | 3.22.4 | Validation de schémas |
| Tailwind CSS | 3.4.1 | Framework CSS |
| Lucide React | 0.294.0 | Icônes |
| Sonner | 1.2.4 | Toast notifications |

### Backend

| Technologie | Version | Description |
|------------|---------|-------------|
| Node.js | 18+ | Runtime JavaScript |
| Express | 4.18.2 | Framework web |
| SQLite3 | 5.1.6 | Base de données |
| jsonwebtoken | 9.0.2 | Authentification JWT |
| bcryptjs | 2.4.3 | Hachage de mots de passe |
| express-openapi-validator | 5.1.0 | Validation OpenAPI |
| swagger-ui-express | 5.0.0 | Documentation API |
| winston | 3.11.0 | Logging |
| dotenv | 16.3.1 | Variables d'environnement |

---

## 📦 Prérequis

- **Node.js** : version 18.x ou supérieure
- **npm** : version 9.x ou supérieure
- **Git** : pour cloner le repository

### Vérifier les versions installées

```bash
node --version  # v18.x.x ou supérieur
npm --version   # 9.x.x ou supérieur
git --version   # 2.x.x ou supérieur
🚀 Installation
1. Cloner le Repository
Copygit clone https://github.com/votre-username/exam-gu.git
cd exam-gu
2. Installation du Backend
Copycd exam-gu-server
npm install
3. Installation du Frontend
Copycd ../exam-gu-frontend
npm install
⚙️ Configuration
Backend (.env)
Créez un fichier .env dans exam-gu-server/ :

# Port du serveur
PORT=8080

# Secret JWT (CHANGEZ EN PRODUCTION !)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars

# Durée de validité du token JWT
JWT_EXPIRY=7d

# Niveau de log
LOG_LEVEL=info

# Environnement
NODE_ENV=development

# Base de données SQLite
DB_PATH=./db/exam-gu.db

# Dossier pour les uploads
FILE_UPLOAD_PATH=./uploaded_files
Frontend (vite.config.ts)
Le fichier vite.config.ts est déjà configuré :

Copyimport { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
🎮 Utilisation
Démarrage en Mode Développement
1. Démarrer le Backend
Copycd exam-gu-server
npm start
Le serveur démarre sur http://localhost:8080

Endpoints disponibles :

🏥 Health Check : http://localhost:8080/health
📖 API Docs : http://localhost:8080/api-docs
📄 OpenAPI Spec : http://localhost:8080/openapi
2. Démarrer le Frontend
Dans un nouveau terminal :

Copycd exam-gu-frontend
npm run dev
L'application démarre sur http://localhost:3000

🔐 Comptes de Démonstration
Administrateur
Email : admin@uqac.ca
Mot de passe : password123
Enseignant
Email : teacher@uqac.ca
Mot de passe : password123
Étudiant
Email : student@uqac.ca
Mot de passe : password123