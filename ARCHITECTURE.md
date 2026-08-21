# AI Welfare Copilot - Architectural Documentation

This document describes the design patterns, system architecture, data flow, and components of the **AI Welfare Copilot**.

---

## 🏛️ System Architecture

The application is structured as a decoupled, multi-tier system with the following layout:

```mermaid
graph TD
    subgraph Government Sources
        GovAPI["Official Portals & Open APIs"]
    end

    subgraph Backend Core (FastAPI)
        SyncService["Synchronization Service"]
        Validation["Pydantic Validation / Normalization"]
        DB[(PostgreSQL Database)]
        Engine["Eligibility Engine"]
        API["FastAPI REST APIs"]
    end

    subgraph Frontend (React)
        UI["React Client / Tailwind UI"]
    end

    GovAPI -->|Raw JSON/CSV| SyncService
    SyncService -->|Parse| Validation
    Validation -->|Structured SQL| DB
    UI -->|HTTP Requests / Profile Input| API
    API -->|Evaluate against Profile| Engine
    Engine -->|Query Scheme Criteria| DB
    Engine -->|Results & Explanations| API
    API -->|JSON Response| UI
```

1. **Data Acquisition & Sync Service**: In the background, scheduled synchronization scripts pull scheme data from configured provider APIs.
2. **Validation & Normalization**: Data from various providers is validated via Pydantic schemas and normalized into a unified PostgreSQL schema.
3. **Database Layer (PostgreSQL)**: Holds the user records, profiles, synchronized schemes, eligibility criteria rules, logs, notifications, and bookmarks.
4. **Eligibility Engine**: A modular engine that evaluates a citizen’s profile against active scheme eligibility rules.
5. **REST API Gateway (FastAPI)**: Serves endpoints for registration, profile management, scheme querying, eligibility checks, comparison, notifications, and administration.
6. **Frontend Web App (React + Vite + Tailwind CSS)**: The client application that citizens use to navigate schemes and manage their profiles, and admins use to monitor system health.

---

## 🔄 Scheme Synchronization Service

Rather than manual CRUD editing, schemes are fetched automatically using a **Provider-Based Architecture**. This makes it easy to integrate new state-level or central-level portal sources.

### Architecture Structure

The sync service relies on a standard interface for all providers:

```
backend/app/providers/
├── __init__.py
├── base_provider.py       # Abstract Base Provider
├── myscheme_provider.py   # Central government portal scraper/API provider
└── state_api_provider.py   # State-specific API integration provider
```

### 1. Abstract Base Class (`BaseProvider`)
All custom providers must inherit from `BaseProvider` and implement its core methods:

```python
from abc import ABC, abstractmethod
from typing import List, Dict

class BaseProvider(ABC):
    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return the unique identifier for the provider."""
        pass

    @abstractmethod
    async def fetch_raw_schemes(self) -> List[Dict]:
        """Fetch raw data payload from the government source."""
        pass

    @abstractmethod
    def normalize(self, raw_data: Dict) -> Dict:
        """Transform provider-specific format into standard application schema."""
        pass
```

### 2. Synchronization Flow
The global `SyncService` is triggered manually by an Admin or automatically via a cron scheduler (`backend/app/scheduler/`):

1. **Initiate Run:** Create a new record in the `sync_logs` table (status: `IN_PROGRESS`).
2. **Execute Providers:** Instantiate all active providers, calling `fetch_raw_schemes()` concurrently.
3. **Normalize and Validate:** Run each raw scheme through `normalize()` and validate it against the Pydantic validator `SchemeCreateSchema`.
4. **Upsert Database:** 
   - If the scheme (identified by a unique official code/identifier) doesn't exist, insert it.
   - If the scheme exists, check for changes in deadlines, eligibility rules, or text. If differences exist, update the record.
5. **Finalize Logs:** Update `sync_logs` with final counts of added/updated schemes and status (`SUCCESS` or `FAILED`).

---

## 🧠 Eligibility Engine

The Eligibility Engine is a rules-matching service designed to determine which schemes a citizen qualifies for. It is decoupled from the rest of the app, allowing us to swap the rules-matching strategy or implement AI-based querying later.

### Evaluated Criteria
The engine matches the client profile against the following constraints stored in the database:
- **Age**: Min and max boundaries.
- **Income**: Annual threshold cap.
- **Location**: State and district restrictions.
- **Demographics**: Occupation, category (e.g., General, OBC, SC, ST), gender, and education.
- **Vulnerability**: Disability status (True/False or degree of disability).

### Engine Interface

```python
from typing import List, Dict
from app.schemas.profile import ProfileSchema
from app.models.scheme import Scheme

class EligibilityEngine:
    @staticmethod
    def evaluate(profile: ProfileSchema, scheme: Scheme) -> Dict:
        """
        Evaluate a single profile against a scheme's rules.
        Returns:
            {
                "status": "ELIGIBLE" | "PARTIALLY_ELIGIBLE" | "INELIGIBLE",
                "reasons": List[str],      # Detailed plain English explanations
                "score": float             # Match confidence score
            }
        """
        pass
```

### Matching Design Patterns
The evaluation uses a **Specification Pattern** or **Chain of Responsibility** where individual validators check specific constraints (e.g., `AgeSpecification`, `IncomeSpecification`).

- **Eligible**: The profile meets all mandatory criteria.
- **Partially Eligible**: The profile meets some key criteria, but lacks optional data (e.g., specific certificates) or falls slightly outside primary bounds (e.g., education matches, but occupation is a borderline case).
- **Ineligible**: The profile explicitly violates a hard constraint (e.g., income exceeds limit, or the user resides in a different state).

### Future AI Enhancement Path
The eligibility architecture is designed with AI integrations in mind:
1. **Semantic Search:** We can embed scheme descriptions using models (like HuggingFace/SentenceTransformers) and save them in a vector extension (e.g., `pgvector`) to perform semantic searches based on citizen search queries.
2. **LLM Explanations:** The engine's structured outputs (`reasons`) can be sent to an LLM context to construct a personalized cover letter and application assistant for the citizen.
