# AI Welfare Copilot - Database Schema

This document details the normalized PostgreSQL database schema designed for the **AI Welfare Copilot**. It outlines table definitions, relationships, data types, constraints, and indexes for optimized query performance.

---

## 🗺️ Entity Relationship Overview

The relationships are organized as follows:
- **`users`** has a 1-to-1 relationship with **`citizen_profiles`**.
- **`schemes`** has a 1-to-1 relationship with **`scheme_eligibility_rules`**.
- **`schemes`** has a 1-to-many relationship with **`scheme_documents`** and **`scheme_steps`**.
- **`users`** connects to **`schemes`** via a many-to-many junction table **`favorites`**.
- **`users`** has a 1-to-many relationship with **`notifications`**.
- **`sync_logs`** is an independent auditing table for tracking background provider tasks.

---

## 💾 Table Definitions (DDL SQL)

### 1. Users Table
Stores credentials, roles, and account statuses.

```sql
CREATE TYPE user_role AS ENUM ('citizen', 'admin');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'citizen',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
```

### 2. Citizen Profiles Table
Stores demographic and socioeconomic details used by the Eligibility Engine to qualify users for schemes.

```sql
CREATE TYPE gender_type AS ENUM ('male', 'female', 'transgender', 'other');

CREATE TABLE citizen_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender gender_type NOT NULL,
    annual_income NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    occupation VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,            -- e.g., General, OBC, SC, ST
    education VARCHAR(100) NOT NULL,           -- e.g., Matriculation, Graduate, etc.
    is_disabled BOOLEAN NOT NULL DEFAULT FALSE,
    disability_percentage INT DEFAULT 0,       -- Range 0-100
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_profiles_user ON citizen_profiles(user_id);
```

### 3. Schemes Table
Stores basic metadata about government schemes synchronized from official sources.

```sql
CREATE TABLE schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    official_id VARCHAR(100) UNIQUE NOT NULL,  -- Unique scheme ID from government source
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    description TEXT NOT NULL,
    benefits TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,           -- e.g., Agriculture, Education, Health
    department VARCHAR(255) NOT NULL,
    portal_url TEXT,
    application_deadline TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_schemes_category ON schemes(category);
CREATE INDEX idx_schemes_official_id ON schemes(official_id);
```

### 4. Scheme Eligibility Rules Table
Detailed criteria rules stored as relational fields, which the engine evaluates.

```sql
CREATE TABLE scheme_eligibility_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID UNIQUE NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    
    -- Numerical Range Filters
    age_min INT,
    age_max INT,
    income_max NUMERIC(12, 2),
    
    -- Geographical constraints (comma-separated or JSON lists of allowed states/districts)
    states_allowed VARCHAR(255)[],           -- Array of allowed states (empty means all)
    districts_allowed VARCHAR(255)[],       -- Array of allowed districts (empty means all)
    
    -- Categorical attributes arrays
    genders_allowed VARCHAR(50)[],          -- Array (male, female, other, transgender)
    occupations_allowed VARCHAR(100)[],     -- Array of occupations
    categories_allowed VARCHAR(50)[],       -- Array of categories (General, OBC, SC, ST)
    educations_allowed VARCHAR(100)[],      -- Array of education levels
    
    -- Vulnerability constraints
    requires_disability BOOLEAN NOT NULL DEFAULT FALSE,
    min_disability_percentage INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_eligibility_rules_scheme ON scheme_eligibility_rules(scheme_id);
```

### 5. Scheme Documents Table
List of documents required to submit applications.

```sql
CREATE TABLE scheme_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    document_name VARCHAR(150) NOT NULL,
    description TEXT,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_documents_scheme ON scheme_documents(scheme_id);
```

### 6. Scheme Application Steps Table
Step-by-step guidance for applying to a scheme.

```sql
CREATE TABLE scheme_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_scheme_step UNIQUE (scheme_id, step_number)
);

CREATE INDEX idx_steps_scheme ON scheme_steps(scheme_id);
```

### 7. Favorites Table (Bookmarks)
Junction table mapping citizen users to saved schemes.

```sql
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_user_favorite_scheme UNIQUE (user_id, scheme_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
```

### 8. Notifications Table
Stores timeline notifications, application reminders, and system updates for citizens.

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
```

### 9. Synchronization Logs Table
Stores history of sync operations performed by background providers for administrative auditing.

```sql
CREATE TYPE sync_status_type AS ENUM ('in_progress', 'success', 'failed');

CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name VARCHAR(100) NOT NULL,
    status sync_status_type NOT NULL DEFAULT 'in_progress',
    schemes_added INT NOT NULL DEFAULT 0,
    schemes_updated INT NOT NULL DEFAULT 0,
    error_message TEXT,
    details JSONB,                          -- Additional sync statistics or list of changed IDs
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_sync_logs_provider ON sync_logs(provider_name);
```
