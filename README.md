# Smart Police AI - Advanced Case Management System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![AI](https://img.shields.io/badge/AI-Enabled-brightgreen.svg)
![Police Tech](https://img.shields.io/badge/Industry-Law%20Enforcement-midnightblue.svg)

A state-of-the-art, AI-powered system designed for modern law enforcement. This platform streamlines the entire lifecycle of a police complaint—from field intake to official FIR generation—using Natural Language Processing (NLP), Optical Character Recognition (OCR), and Semantic Search.

## 🚀 Key Features

### 🧠 Intelligence Module
- **AI-Assisted Intake**: Natural language extraction of complainant names, mobile numbers, dates, and locations from unstructured narratives.
- **Voice-to-Text Dictation**: Hands-free FIR filing and witness statement recording using high-accuracy STT.
- **OCR Document Analysis**: Automatic data extraction from handwritten notes, identity cards, and PDF applications.
- **AI Legal Suggester**: Intelligent mapping of incident descriptions to relevant **BNS (Bharatiya Nyaya Sanhita)** and Special Act sections.

### 📊 Strategic Operations
- **Interactive Hotspot Mapping**: Live visualization of crime clusters using geospatial analytics.
- **Semantic Case Search**: Search for cases using intent (e.g., "stolen bike near park") instead of just IDs.
- **Digital Evidence Vault**: Secure storage and preview of photos, videos, and documents linked to case timelines.

### 📄 Legal & Compliance
- **Automated FIR Generator**: One-click generation of professional, secure PDF FIRs ready for official submission.
- **Investigation Timeline**: Automated tracking of case milestones from registration to final resolution.
- **Secure Authentication**: JWT-based access control for different officer ranks (Investigating Officer, Supervisor, Legal Cell).

## 🛠️ Technology Stack

### Backend
- **Core**: Node.js & Express (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Document Engine**: PDFKit & pdf-lib
- **AI/ML**: Simulated NLP Patterns & Tesseract-ready OCR pipeline
- **Security**: JWT, BcryptJS, Helmet, CORS

### Frontend (Web Portal)
- **Framework**: React.js with Vite
- **Animations**: Framer Motion
- **UI Components**: Custom Glassmorphism System with Tailwind-inspired Vanilla CSS
- **Icons**: Lucide React

### Mobile (Android)
- **Language**: Java/Kotlin
- **Architecture**: MVVM with Retrofit for API sync

## 📂 Project Structure

```text
SmartPoliceApp/
├── android/            # Native Android Application
├── backend/            # Express API Server (Node.js)
│   ├── src/
│   │   ├── controllers/ # AI, Complaint, Legal, and Auth logic
│   │   ├── routes/      # Secure API Endpoints
│   │   └── middleware/  # Auth & File Upload guards
└── frontend-web/       # React Admin Dashboard
    ├── src/
    │   ├── pages/       # Dashboard, Case List, AI Tools
    │   └── components/  # Layout and Shared components
```

## ⚙️ Installation & Setup

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend-web
npm install
npm run dev
```

## 📜 Legal Disclaimer
This system is a technological demonstration designed for research and prototype purposes. All AI suggestions (Legal Sections) must be verified by a qualified legal officer before final submission.

---
**Developed with ❤️ for the Law Enforcement Community.**
