# AI Welfare Copilot - Python Flask Authentication & OTP Service

This directory (`backend-python/`) contains the dedicated **Python Flask Authentication REST API** for the **AI Welfare Copilot** platform. It handles email OTP verification using Gmail SMTP, secure user registration, and authentication against the existing PostgreSQL database (`AI-Welfare-Copilot`).

---

## 🛠️ Architecture

- **Port**: `5001` (Configurable via `FLASK_PORT`)
- **Database**: Shared PostgreSQL (`AI-Welfare-Copilot`), tables `users`, `user_profiles`, and `email_verifications`.
- **Email Dispatch**: Gmail SMTP (`smtp.gmail.com:587` with TLS).
- **Express Coexistence**: Node.js backend remains active on port `5000` for all non-auth resources (schemes, eligibility, comparisons, admin).

---

## 🚀 Setup & Installation (Windows PowerShell)

### 1. Create and Activate Virtual Environment
```powershell
cd "d:\My TY Project\AI-WELFARE-COPILOT\backend-python"
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 3. Run Database Migration
```powershell
python migrations/migrate.py
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your details:
```powershell
cp .env.example .env
```

Ensure `.env` contains:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=AI-Welfare-Copilot
DB_USER=postgres
DB_PASSWORD=your_postgres_password

FLASK_PORT=5001
FLASK_DEBUG=True
FRONTEND_URL=http://localhost:5173

# OTP Delivery Mode
# Use 'local_demo' for local development (prints OTP to Flask terminal)
# Use 'email' for production (sends OTP via Gmail SMTP)
OTP_MODE=local_demo

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_APP_PASSWORD=your_16_character_app_password
```

### 5. Start the Flask Server
```powershell
python app.py
```

---

## 📧 Gmail App Password Configuration

Google accounts require a dedicated 16-character **App Password** for SMTP access:

1. Visit your [Google Account Security Settings](https://myaccount.google.com/security).
2. Enable **2-Step Verification** if not already enabled.
3. Search for or navigate to **App passwords** (or visit `https://myaccount.google.com/apppasswords`).
4. Enter an App Name (e.g. `AI Welfare Copilot`).
5. Click **Create**. Google will display a 16-character passcode (e.g. `abcd efgh ijkl mnop`).
6. Paste this code (without spaces) into `backend-python/.env` as `SMTP_APP_PASSWORD`.
7. Set `SMTP_EMAIL` to your Gmail address.

---

## 📡 API Endpoints

### 1. Request Verification OTP
- **Endpoint**: `POST /api/auth/request-otp`
- **Request Body**:
  ```json
  { "email": "citizen@example.com" }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "A 6-digit verification code has been sent to citizen@example.com.",
    "expires_in_minutes": 5,
    "cooldown_seconds": 60
  }
  ```

### 2. Verify OTP
- **Endpoint**: `POST /api/auth/verify-otp`
- **Request Body**:
  ```json
  {
    "email": "citizen@example.com",
    "otp": "123456"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Email address verified successfully.",
    "verification_token": "a8f3...secure_token..."
  }
  ```

### 3. Complete Registration
- **Endpoint**: `POST /api/auth/register` (also aliased as `/api/users`)
- **Request Body**:
  ```json
  {
    "email": "citizen@example.com",
    "password": "Password123",
    "full_name": "Rajesh Kumar",
    "state": "Maharashtra",
    "district": "Pune",
    "verification_token": "a8f3...secure_token..."
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Registration completed successfully.",
    "user": {
      "id": 13,
      "full_name": "Rajesh Kumar",
      "email": "citizen@example.com",
      "role": "citizen",
      "is_active": true,
      "is_verified": true,
      "created_at": "...",
      "updated_at": "..."
    }
  }
  ```

### 4. User Login
- **Endpoint**: `POST /api/auth/login` (also aliased as `/api/users/login`)
- **Request Body**:
  ```json
  {
    "email": "citizen@example.com",
    "password": "Password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": 13,
      "full_name": "Rajesh Kumar",
      "email": "citizen@example.com",
      "role": "citizen",
      "is_active": true,
      "is_verified": true,
      "created_at": "...",
      "updated_at": "...",
      "last_login": "..."
    }
  }
  ```

### 5. Health & Diagnostic Checks
- `GET /api/health`: Service health check.
- `GET /api/auth/test-db`: PostgreSQL database connectivity verification.
