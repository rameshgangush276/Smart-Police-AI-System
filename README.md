# Smart Police AI - Advanced Case Management System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![AI](https://img.shields.io/badge/AI-Enabled-brightgreen.svg)
![Police Tech](https://img.shields.io/badge/Industry-Law%20Enforcement-midnightblue.svg)

A state-of-the-art, AI-powered system designed for modern law enforcement. This platform streamlines the entire lifecycle of a police complaint—from field intake to official FIR generation—using NLP, OCR, and Semantic Search.

## 🚀 Key Features

- **AI-Assisted Intake**: Natural language extraction from narratives.
- **Voice FIR Registration**: STT-powered hands-free dictation.
- **OCR Document Extraction**: Automatic data parsing from uploaded documents.
- **AI Legal Suggester**: Mapping incidents to **BNS (Bharatiya Nyaya Sanhita)**.
- **Strategic Mapping**: Crime hotspot visualization.
- **Secure Evidence Vault**: Multimedia evidence tracking.

## 🛠 Technology Stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL (Production), SQLite (Dev)
- **Frontend**: React.js, Vite, Framer Motion
- **Mobile**: Android (Java/Kotlin)
- **Deployment**: Docker, PM2, GitHub Actions

## 📂 Project Structure

```text
SmartPoliceApp/
├── android/            # Native Android Application
├── backend/            # Express API Server (Node.js)
│   ├── prisma/         # Database Schema & Migrations
│   └── src/            # Application Logic
├── frontend-web/       # React Admin Dashboard
├── docker-compose.yml  # Docker Orchestration
└── README.md           # Documentation
```

## ⚙️ Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (or Docker)
- Android Studio (for mobile development)

### 2. Backend Configuration
1. Navigate to `backend/`.
2. Copy `.env.example` to `.env`.
3. Configure your `DATABASE_URL` and `AI_API_KEY`.
4. Install dependencies:
   ```bash
   npm install
   npx prisma generate
   ```

### 3. Running Locally
- **Development**: `npm run dev` (Starts backend and frontend if configured)
- **Production Build**: 
  ```bash
  npm run build
  npm start
  ```

## 🚢 Deployment

### Using Docker (Recommended)
Deploy the entire stack with a single command:
```bash
docker-compose up -d --build
```

### Using PM2
For Node.js native hosting:
```bash
pm2 start ecosystem.config.js --env production
```

## 🔐 Environment Variables
Required variables in `.env`:
- `PORT`: Server port (default 5000)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for authentication
- `AI_API_KEY`: API key for AI services

---
**Developed for the Law Enforcement Community.**
