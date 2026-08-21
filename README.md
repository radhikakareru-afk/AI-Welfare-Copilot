# AI Welfare Copilot

> **Tagline:** Find Government Schemes You're Eligible For.

The **AI Welfare Copilot** is a production-quality, centralized digital platform designed to help Indian citizens discover, check eligibility for, compare, and apply for government welfare schemes. 

By utilizing a modular **Eligibility Engine** and an automated, provider-based **Synchronization Service**, this application solves the problem of information fragmentation and eligibility confusion across state and central government portals.

---

## 🌟 Key Features

### 👤 Citizen Features
- **Secure Authentication:** JWT-based user registration, login, and secure password management.
- **Personalized Profile:** Complete a profile detailing age, income, state, district, occupation, category, education, and disability status.
- **Automated Eligibility Engine:** Instant evaluation of user profiles against scheme criteria (Eligible, Partially Eligible, Ineligible).
- **Search & Filters:** Search schemes by keywords or filter by department, benefits, deadlines, or categories.
- **Scheme Comparison:** Select and compare up to three schemes side-by-side on benefits, required documents, and eligibility.
- **Personalized Dashboard:** Track saved (bookmarked) schemes, recently viewed schemes, notifications, and application deadlines.
- **Step-by-Step Guidance:** Plain-english application instructions and mandatory/optional documents checklists.
- **Deadline Notifications:** Reminders for upcoming application deadlines.

### 🔑 Administrator Features
- **Synchronization Dashboard:** Monitor the health, status, and history of automated scheme data sources.
- **Synchronization Logs:** Audit records of schemes added, updated, or failed syncs.
- **Analytics & Health Metrics:** View total registered users, overall scheme counts, provider sync success rates, and basic system diagnostics.
- **Application Settings:** Manage system settings and synchronization intervals.

---

## 🛠️ Technology Stack

- **Frontend:** React.js (Vite), Tailwind CSS, React Router DOM, Fetch API
- **Backend:** Python, FastAPI (Asynchronous framework)
- **Database:** PostgreSQL (Relational schema, indexes for search query optimization)
- **Authentication:** JWT (JSON Web Tokens) with `passlib` (bcrypt) password hashing
- **Deployment:** 
  - Frontend: Vercel / Netlify
  - Backend: Render / Railway / Fly.io
  - Database: Neon PostgreSQL / Railway PostgreSQL

---

## 📂 Project Directory Structure

```
AI-Welfare-Copilot/
├── backend/
│   └── app/
│       ├── database/      # Connection setup, base models, database migrations
│       ├── models/        # SQLAlchemy database model definitions
│       ├── schemas/       # Pydantic schemas for request/response validation
│       ├── routers/       # FastAPI route controllers (auth, profile, schemes, sync, admin)
│       ├── services/      # Business logic (eligibility_engine, sync_service, notification_service)
│       ├── providers/     # External scheme data connectors (e.g., MyScheme API, State API)
│       ├── scheduler/     # Background tasks and periodic scheduler setup
│       ├── middleware/    # CORS, security headers, request logging
│       └── utils/         # Helper functions (JWT helpers, hashing, custom exceptions)
│
└── frontend/
    └── src/
        ├── assets/        # Static assets (images, icons, default styles)
        ├── components/    # Reusable UI components (buttons, cards, modals, tables, badges)
        ├── layouts/       # Persistent page layouts (CitizenLayout, AdminLayout, AuthLayout)
        ├── pages/         # Application pages (Dashboard, Search, Compare, Admin, Profile, Login)
        ├── routes/        # Router configuration, public and protected route handlers
        ├── services/      # API communication clients (fetch wrapper, auth, schemes, sync APIs)
        ├── hooks/         # Custom React hooks (useAuth, useFetch, useDebounce)
        ├── contexts/      # Context providers (AuthContext, NotificationContext, UIThemeContext)
        └── utils/         # Frontend helper utilities (validators, date formatting)
```

---

## 🚀 Installation & Setup Guide

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up your environment variables by copying `.env.example` to `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/ai_welfare_copilot
   JWT_SECRET=your_jwt_super_secret_key
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   ```
5. Run migrations (if applicable) and start the Uvicorn development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env.local`:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## ☁️ Deployment Guide

### Database (Neon / Railway)
1. Spin up a new PostgreSQL database instance on Neon.tech or Railway.app.
2. Copy the connection string and apply it as the `DATABASE_URL` environment variable on your backend server.

### Backend (Render)
1. Link your GitHub repository to Render.
2. Create a new **Web Service** pointing to the `backend/` directory.
3. Use the following start command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
4. Configure all environment variables (`DATABASE_URL`, `JWT_SECRET`, etc.) in the Render dashboard.

### Frontend (Vercel)
1. Link your GitHub repository to Vercel.
2. Create a new project, setting the root directory to `frontend/`.
3. Configure the build command to `npm run build` and output directory to `dist`.
4. Set `VITE_API_URL` to point to your deployed backend URL.
