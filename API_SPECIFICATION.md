# AI Welfare Copilot - API Specification

This document details the RESTful API endpoints for the **AI Welfare Copilot** backend built using FastAPI.

---

## 🔒 Security & Request Headers

All protected endpoints require a JSON Web Token (JWT) sent via the `Authorization` header:

```http
Authorization: Bearer <jwt_access_token>
```

### Response Formats
- **Success:** JSON objects conforming to standard schemas.
- **Client Error (400, 422, 401, 403, 404):**
  ```json
  {
    "detail": "Detailed message explaining the error."
  }
  ```

---

## 🔑 Authentication Endpoints `/api/auth`

### 1. Register User
- **Method:** `POST`
- **URL:** `/api/auth/register`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPassword123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": "e4b2d35d-00ff-4b10-85f7-4183d2d85a11",
    "email": "user@example.com",
    "role": "citizen"
  }
  ```

### 2. Login User
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Request Body (URL-encoded form or JSON):**
  ```json
  {
    "username": "user@example.com",
    "password": "StrongPassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "token_type": "bearer",
    "role": "citizen"
  }
  ```

### 3. Forgot Password
- **Method:** `POST`
- **URL:** `/api/auth/forgot-password`
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Password reset instructions have been sent to your email."
  }
  ```

### 4. Reset Password
- **Method:** `POST`
- **URL:** `/api/auth/reset-password`
- **Request Body:**
  ```json
  {
    "token": "reset_token_from_email",
    "new_password": "NewStrongPassword456"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Password has been reset successfully."
  }
  ```

---

## 👤 Profile Management `/api/profile`

### 1. Get Profile Details (Protected)
- **Method:** `GET`
- **URL:** `/api/profile`
- **Response (200 OK):**
  ```json
  {
    "full_name": "Rajesh Kumar",
    "date_of_birth": "1994-08-15",
    "gender": "male",
    "annual_income": 120000.00,
    "state": "Maharashtra",
    "district": "Pune",
    "occupation": "Farmer",
    "category": "OBC",
    "education": "Secondary Education",
    "is_disabled": false,
    "disability_percentage": 0
  }
  ```

### 2. Update Profile Details (Protected)
- **Method:** `PUT`
- **URL:** `/api/profile`
- **Request Body:**
  ```json
  {
    "full_name": "Rajesh Kumar",
    "date_of_birth": "1994-08-15",
    "gender": "male",
    "annual_income": 115000.00,
    "state": "Maharashtra",
    "district": "Pune",
    "occupation": "Farmer",
    "category": "OBC",
    "education": "Secondary Education",
    "is_disabled": false,
    "disability_percentage": 0
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Profile updated successfully.",
    "profile": {
      "full_name": "Rajesh Kumar",
      "date_of_birth": "1994-08-15",
      "gender": "male",
      "annual_income": 115000.00,
      "state": "Maharashtra",
      "district": "Pune",
      "occupation": "Farmer",
      "category": "OBC",
      "education": "Secondary Education",
      "is_disabled": false,
      "disability_percentage": 0
    }
  }
  ```

---

## 🌾 Government Schemes `/api/schemes`

### 1. Search and Filter Schemes (Public or Protected)
- **Method:** `GET`
- **URL:** `/api/schemes`
- **Query Parameters:**
  - `q` (string, optional) - text search query
  - `category` (string, optional) - filter by scheme category (e.g. Agriculture)
  - `state` (string, optional) - filter by state (central or specific state)
  - `page` (int, optional, default: 1)
  - `limit` (int, optional, default: 10)
- **Response (200 OK):**
  ```json
  {
    "items": [
      {
        "id": "7a35e892-0b1a-4712-a1f9-90656a8dfa1c",
        "official_id": "SCH-PM-KISAN",
        "name": "PM-Kisan Samman Nidhi",
        "tagline": "Direct income support for farmers",
        "category": "Agriculture",
        "department": "Ministry of Agriculture and Farmers Welfare",
        "application_deadline": "2026-12-31T23:59:59Z"
      }
    ],
    "total": 45,
    "page": 1,
    "pages": 5
  }
  ```

### 2. Get Scheme Details (Public or Protected)
- **Method:** `GET`
- **URL:** `/api/schemes/{id}`
- **Response (200 OK):**
  ```json
  {
    "id": "7a35e892-0b1a-4712-a1f9-90656a8dfa1c",
    "official_id": "SCH-PM-KISAN",
    "name": "PM-Kisan Samman Nidhi",
    "tagline": "Direct income support for farmers",
    "description": "Pradhan Mantri Kisan Samman Nidhi is a central sector scheme to provide income support to all landholding farmers' families in the country.",
    "benefits": "Financial benefit of ₹6,000 per year in three equal installments of ₹2,000.",
    "category": "Agriculture",
    "department": "Ministry of Agriculture and Farmers Welfare",
    "portal_url": "https://pmkisan.gov.in",
    "application_deadline": "2026-12-31T23:59:59Z",
    "documents": [
      {
        "document_name": "Aadhaar Card",
        "description": "Proof of identity and citizenship verification.",
        "is_mandatory": true
      },
      {
        "document_name": "Landholding Documents",
        "description": "Proof of ownership of agricultural land.",
        "is_mandatory": true
      }
    ],
    "steps": [
      {
        "step_number": 1,
        "title": "Visit Official Portal",
        "description": "Go to the PM-Kisan portal at https://pmkisan.gov.in."
      },
      {
        "step_number": 2,
        "title": "New Farmer Registration",
        "description": "Click on the New Farmer Registration link and input Aadhaar number."
      }
    ]
  }
  ```

### 3. Compare Schemes (Public or Protected)
- **Method:** `GET`
- **URL:** `/api/schemes/compare`
- **Query Parameters:**
  - `ids` (string, required) - comma-separated list of UUIDs (e.g. `?ids=id1,id2,id3`)
- **Response (200 OK):**
  ```json
  [
    {
      "id": "7a35e892-0b1a-4712-a1f9-90656a8dfa1c",
      "name": "PM-Kisan Samman Nidhi",
      "category": "Agriculture",
      "benefits": "₹6,000 per year directly to bank account.",
      "application_deadline": "2026-12-31T23:59:59Z",
      "documents": ["Aadhaar Card", "Landholding Documents"],
      "eligibility_summary": "Open to all landholder farmer families."
    },
    {
      "id": "60bc9d1a-43d9-4f76-8051-f2549a1adccb",
      "name": "PM Shram Yogi Maan-dhan",
      "category": "Pension & Insurance",
      "benefits": "Assured monthly pension of ₹3,000 after attaining age of 60.",
      "application_deadline": null,
      "documents": ["Aadhaar Card", "Savings Bank Account details"],
      "eligibility_summary": "Unorganized workers aged 18 to 40 with income under ₹15,000/month."
    }
  ]
  ```

---

## 🧠 Eligibility Checker `/api/eligibility`

### 1. Perform Eligibility Check (Protected)
Automatically evaluates the authenticated citizen's saved profile data against all active schemes.

- **Method:** `POST`
- **URL:** `/api/eligibility/check`
- **Response (200 OK):**
  ```json
  {
    "checked_at": "2026-08-01T20:15:00Z",
    "eligible_schemes": [
      {
        "id": "7a35e892-0b1a-4712-a1f9-90656a8dfa1c",
        "name": "PM-Kisan Samman Nidhi",
        "reasons": ["User is registered as a Farmer.", "Income satisfies general agriculture rules."]
      }
    ],
    "partially_eligible_schemes": [
      {
        "id": "60bc9d1a-43d9-4f76-8051-f2549a1adccb",
        "name": "PM Shram Yogi Maan-dhan",
        "reasons": ["Age lies in the 18-40 threshold.", "Requires self-declaration certificate for unorganized worker sector."]
      }
    ],
    "ineligible_schemes": [
      {
        "id": "30ac8f5d-7a6c-489e-9d2a-438910b8cf8d",
        "name": "Post-Matric Scholarship Scheme",
        "reasons": ["User age exceeds the student limit.", "User education status is Graduate, scheme targets school level."]
      }
    ]
  }
  ```

---

## ⭐ Favorites / Bookmarks `/api/favorites`

### 1. Get Bookmarked Schemes (Protected)
- **Method:** `GET`
- **URL:** `/api/favorites`
- **Response (200 OK):**
  ```json
  [
    {
      "favorite_id": "1111d35d-00ff-4b10-85f7-4183d2d85a00",
      "scheme_id": "7a35e892-0b1a-4712-a1f9-90656a8dfa1c",
      "name": "PM-Kisan Samman Nidhi",
      "category": "Agriculture"
    }
  ]
  ```

### 2. Bookmark a Scheme (Protected)
- **Method:** `POST`
- **URL:** `/api/favorites`
- **Request Body:**
  ```json
  {
    "scheme_id": "7a35e892-0b1a-4712-a1f9-90656a8dfa1c"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "Scheme bookmarked successfully.",
    "favorite_id": "1111d35d-00ff-4b10-85f7-4183d2d85a00"
  }
  ```

### 3. Remove Bookmarked Scheme (Protected)
- **Method:** `DELETE`
- **URL:** `/api/favorites/{scheme_id}`
- **Response (200 OK):**
  ```json
  {
    "message": "Scheme removed from bookmarks."
  }
  ```

---

## 🔔 Notifications `/api/notifications`

### 1. Get Notifications (Protected)
- **Method:** `GET`
- **URL:** `/api/notifications`
- **Response (200 OK):**
  ```json
  [
    {
      "id": "c8b35f29-ea21-46ab-bb12-32a2f96e70ab",
      "title": "Application Deadline Approaching",
      "message": "The application window for PM-Kisan Samman Nidhi closes in 3 days. Prepare your landholding documents.",
      "is_read": false,
      "created_at": "2026-08-01T12:00:00Z"
    }
  ]
  ```

### 2. Mark Notification as Read (Protected)
- **Method:** `PUT`
- **URL:** `/api/notifications/{id}/read`
- **Response (200 OK):**
  ```json
  {
    "message": "Notification marked as read."
  }
  ```

---

## 📊 Administrative Dashboards `/api/admin`

*Note: All endpoints in this category require the logged-in user to have the `'admin'` role.*

### 1. Get Sync Service Status
- **Method:** `GET`
- **URL:** `/api/admin/sync/status`
- **Response (200 OK):**
  ```json
  {
    "is_sync_running": false,
    "last_sync_completed_at": "2026-08-01T06:00:00Z",
    "providers": [
      {
        "provider_name": "MySchemeProvider",
        "status": "active",
        "last_sync_status": "success",
        "last_run_at": "2026-08-01T05:45:00Z"
      }
    ]
  }
  ```

### 2. Trigger Synchronization
Manually triggers the background synchronization pipeline.
- **Method:** `POST`
- **URL:** `/api/admin/sync/trigger`
- **Response (202 Accepted):**
  ```json
  {
    "message": "Synchronization task triggered successfully in the background.",
    "sync_log_id": "78912e5d-00ff-4b10-85f7-4183d2d85aef"
  }
  ```

### 3. Get Sync History Logs
- **Method:** `GET`
- **URL:** `/api/admin/sync/logs`
- **Query Parameters:**
  - `limit` (int, default: 20)
- **Response (200 OK):**
  ```json
  [
    {
      "id": "78912e5d-00ff-4b10-85f7-4183d2d85aef",
      "provider_name": "MySchemeProvider",
      "status": "success",
      "schemes_added": 2,
      "schemes_updated": 15,
      "error_message": null,
      "started_at": "2026-08-01T05:45:00Z",
      "completed_at": "2026-08-01T05:52:00Z"
    }
  ]
  ```

### 4. Get System Analytics & Metrics
- **Method:** `GET`
- **URL:** `/api/admin/analytics/stats`
- **Response (200 OK):**
  ```json
  {
    "total_registered_users": 15240,
    "total_active_schemes": 142,
    "total_favorites_saved": 8632,
    "system_health": {
      "database": "healthy",
      "redis_cache": "healthy",
      "scheduler_status": "running"
    }
  }
  ```
