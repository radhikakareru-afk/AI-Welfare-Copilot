# AI Welfare Copilot — Automatic Scheme Synchronization System

## Overview

The **Automatic Scheme Synchronization System** provides a reliable, safe, and auditable pipeline for keeping the AI Welfare Copilot scheme catalog synchronized with official central and state government welfare portals.

The system is designed with strict **safety-first guarantees**:
- **Preservation First**: Existing scheme records (all 26 verified schemes), user profiles, eligibility criteria, benefits, and required documents are **never deleted automatically**.
- **Change Detection & Validation**: Updates from external feeds must pass strict validation before modifying database records.
- **Overlap & Concurrency Locks**: Overlapping runs (concurrent cron executions or simultaneous admin triggers) are strictly blocked by an in-memory execution lock.
- **Auditable History**: Every synchronization cycle records its start time, completion time, duration, status, and record metrics in the PostgreSQL `sync_logs` table.
- **Truthful Status Reporting**: The public dashboard reports only genuine real-time system states (`Active`, `Syncing`, `Standby`, `Inactive`, or `Error`).

---

## Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                            AI WELFARE COPILOT BACKEND                             |
+-----------------------------------------------------------------------------------+
                                        |
                  +---------------------+---------------------+
                  |                                           |
         [Daily node-cron]                             [Admin Manual]
       (SYNC_CRON_SCHEDULE)                         (POST /api/admin/sync)
                  |                                           |
                  +---------------------+---------------------+
                                        |
                                        v
                          [SyncScheduler Engine]
                       (app/scheduler/syncScheduler.js)
                                        |
               +------------------------+------------------------+
               | Concurrency Lock: Prevents Overlapping Runs     |
               | Creates 'in_progress' record in sync_logs       |
               +------------------------+------------------------+
                                        |
                                        v
                            [Provider Registry]
                         (app/providers/index.js)
                                        |
        +-------------------------------+-------------------------------+
        |                               |                               |
        v                               v                               v
[PortalHealthProvider]       [DataGovInProvider]           [MahaDbtProvider]
- Official domain checks     - data.gov.in API             - mahadbt.maharashtra.gov.in
- All 26 schemes' URLs       - Requires API Key            - Requires State MoU/Key
- Latency & uptime audit     - Scheme structure check      - Portal verification
- Non-destructive updates    - Preservation guards         - Non-destructive updates
        |                               |                               |
        +-------------------------------+-------------------------------+
                                        |
                                        v
                            [SchemeValidator Service]
                        (app/services/schemeValidator.js)
                                        |
                    +-------------------+-------------------+
                    | - Validate structure & types          |
                    | - Forbid destructive child nulls      |
                    | - Detect field-level diffs            |
                    +-------------------+-------------------+
                                        |
                                        v
                           [PostgreSQL Database]
                                        |
            +---------------------------+---------------------------+
            |                                                       |
            v                                                       v
     [schemes Table]                                        [sync_logs Table]
   - Updates `last_synced_at`                             - Started/ended timestamp
   - 26 schemes preserved                                 - Success/failed status
   - Zero deletions                                       - Records count & duration
                                        |
                                        v
                        [GET /api/public/statistics]
                                        |
                                        v
                      [Homepage "Auto-Synchronized"]
                     (Active | Standby | Syncing | Inactive)
```

---

## Configuration & Environment Variables

Create or configure `backend/.env` based on `backend/.env.example`:

| Environment Variable | Default Value | Description |
|----------------------|---------------|-------------|
| `SYNC_CRON_SCHEDULE` | `0 2 * * *` | 5-field cron expression (default: 02:00 AM daily). |
| `SYNC_AUTO_ENABLED` | `true` | Set to `false` to disable automatic cron execution. |
| `DATA_GOV_IN_API_KEY` | *(empty)* | Optional API key for Open Government Data Platform India (`data.gov.in`). |
| `MAHADBT_API_KEY` | *(empty)* | Optional authorization token for Maharashtra State DBT Gateway. |
| `MYSCHEME_API_KEY` | *(empty)* | Optional institutional partner API key for MyScheme India. |

---

## Providers & Government Access Policies

### 1. Official Government Portal Reachability Verifier (`PortalHealthProvider`)
- **Status**: **Fully Operational (Publicly Accessible)**
- **Role**: Automatically verifies DNS resolution, TLS certificates, and HTTP uptime across the official government domains registered in the 26 scheme records (e.g. `mahadbt.maharashtra.gov.in`, `pmkisan.gov.in`, `pmjay.gov.in`, `krishi.maharashtra.gov.in`, `ladkibahin.maharashtra.gov.in`).
- **Safety**: Employs lightweight HTTP HEAD checks with a 5-second timeout and domain-level deduplication so no portal is flooded.

### 2. Open Government Data Platform India (`DataGovInProvider`)
- **Status**: **Requires Credentials (`DATA_GOV_IN_API_KEY`)**
- **Requirements**: Requires developer registration at [https://data.gov.in/](https://data.gov.in/).
- **Behavior**: If the key is not set, the connector logs the diagnostic requirement and cleanly marks status as `requires_credentials` without crashing or interrupting other providers.

### 3. MahaDBT State Welfare Platform (`MahaDbtProvider`)
- **Status**: **Requires Departmental Authorization (`MAHADBT_API_KEY`)**
- **Requirements**: MahaDBT is a restricted state government system. Machine-to-machine REST API access requires an official inter-departmental Memorandum of Understanding (MoU) with the Directorate of Information Technology (DIT), Government of Maharashtra.
- **Behavior**: Verifies portal availability and documents the authorization requirement.

### 4. MyScheme National Platform (`MySchemeProvider`)
- **Status**: **Requires Institutional Credentials (`MYSCHEME_API_KEY`)**
- **Requirements**: Official partner integration with the National e-Governance Division (NeGD) and MeitY.

---

## Status Dynamics Lifecycle

The status reported by `GET /api/public/statistics` and displayed on the homepage follows strict real-time criteria:

1. **`Inactive`**: Exactly 0 synchronization operations have been recorded in the database.
2. **`Syncing`**: An active synchronization run is in progress.
3. **`Active`**: A synchronization run succeeded within the last 24 hours.
4. **`Standby`**: A previous synchronization succeeded, but more than 24 hours have elapsed. The system is idle awaiting its next scheduled cycle.
5. **`Error`**: The most recent synchronization run encountered an unrecoverable failure.

---

## API Endpoints

### Public
- `GET /api/public/statistics`: Returns live platform aggregate counts and synchronization telemetry. Publicly accessible and read-only.

### Administrator Only (Requires `x-user-id` with `admin` role)
- `POST /api/admin/sync`: Triggers an immediate catalog synchronization run. Returns HTTP 409 Conflict if another sync is already running.
- `GET /api/admin/sync/status`: Returns scheduler configuration, cron state, and provider diagnostics.
- `GET /api/admin/sync/logs`: Returns recent synchronization history from PostgreSQL `sync_logs`.
