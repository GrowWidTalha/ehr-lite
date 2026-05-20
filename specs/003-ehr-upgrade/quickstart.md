# Quickstart: EHR Schema Migration

**Feature**: 003-ehr-upgrade
**Date**: 2026-04-28

## Overview

This guide walks through the schema migration from old snake_case/UUID schema to new PascalCase/integer schema.

## Prerequisites

- Node.js 20+ installed
- Git branch: `003-ehr-upgrade`
- Backend and frontend dependencies installed

## Step 1: Update Database Schema

**File**: `backend/src/db/schema.sql`

1. Backup existing database (if important):
   ```bash
   cp backend/data/database.db backend/data/database.db.backup
   ```

2. Rewrite `schema.sql` to:
   - Drop all old tables at the top
   - Keep all new tables with `CREATE TABLE IF NOT EXISTS`
   - Add new views at the end

3. Key changes:
   ```sql
   -- At the top, add:
   DROP TABLE IF EXISTS report_images;
   DROP TABLE IF EXISTS reports;
   -- ... (drop all old tables in reverse dependency order)

   -- Use CREATE TABLE IF NOT EXISTS for all new tables
   -- (Patient, LabTestCBCHB, etc.)
   ```

## Step 2: Update Database Initialization

**File**: `backend/src/db/init.js`

Change the table existence check from any table to specifically the `Patient` table:

```javascript
// Old check:
const result = db.exec(`SELECT name FROM sqlite_master WHERE type='table' LIMIT 1`);

// New check:
const result = db.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='Patient'`);
if (result.length > 0 && result[0].values.length > 0) {
  tablesAlreadyExist = true;
}
```

## Step 3: Rewrite Patients Route

**File**: `backend/src/routes/patients.js`

Implement new endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/patients` | GET | List patients with pagination |
| `/api/patients/:id` | GET | Get patient details |
| `/api/patients` | POST | Create patient |
| `/api/patients/:id` | PUT | Update patient |
| `/api/patients/:id` | DELETE | Delete patient |
| `/api/patients/:id/labs` | GET | Get lab results |
| `/api/patients/:id/imaging` | GET | Get imaging |
| `/api/patients/:id/treatments` | GET | Get treatments |
| `/api/patients/:id/pathology` | GET | Get pathology |
| `/api/patients/:id/lifestyle` | GET | Get lifestyle data |

Key changes:
- Use `PatientID` instead of `id`
- Use `PatientName` instead of `full_name`
- Query from `vw_patient_list` and `vw_patient_detail` views
- Group lab/imaging/treatment results by type

## Step 4: Add Lookups Route

**File**: `backend/src/routes/lookups.js` (new)

Create endpoint that returns all lookup tables:

```javascript
GET /api/lookups
```

Returns JSON with all lookup table data.

**File**: `backend/src/server.js`

Register the route:
```javascript
import lookupsRouter from './routes/lookups.js';
app.use('/api/lookups', lookupsRouter);
```

## Step 5: Update Frontend Types

**File**: `frontend/lib/db.types.ts`

Replace old type definitions with new ones:

```typescript
export interface Patient {
  PatientID: number;
  RegistrationNo?: string;
  RegistrationDate?: string;
  PatientName: string;
  Age?: number;
  Gender?: string;
  // ... all other Patient fields (60+ total)
}

export interface LookupItem {
  ID: number;
  [key: string]: string | number;
}

export interface LookupsResponse {
  bloodGroups: LookupItem[];
  hospitals: LookupItem[];
  // ... etc
}
```

## Step 6: Update Frontend API Client

**File**: `frontend/lib/api.ts`

Update API calls:
- Change `id` to `PatientID`
- Add new endpoint functions: `getPatientLabs`, `getPatientImaging`, etc.
- Add `getLookups` function

## Step 7: Update Frontend Hooks

**Files**:
- `frontend/hooks/use-patients.ts` — Update field names
- `frontend/hooks/use-lookups.ts` — Create new hook

## Step 8: Update Components (Minimal Changes)

**Files**:
- `frontend/components/patients/patient-table.tsx` — Column keys
- `frontend/components/patients/patient-form.tsx` — Add lookup dropdowns

## Testing

1. Start backend:
   ```bash
   cd backend
   npm start
   ```

2. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Verify:
   - Patient list loads at `http://localhost:3000/patients`
   - Create patient works
   - `/api/lookups` returns data
   - Patient details show correctly

## Verification Checklist

- [ ] Old tables dropped from database
- [ ] Patient list loads with correct field names
- [ ] Create patient accepts foreign key IDs
- [ ] Lookup dropdowns show data
- [ ] Patient details display correctly
- [ ] Export/import functions work
- [ ] No TypeScript errors in frontend

## Rollback

If issues occur:
1. Restore database backup
2. Revert branch changes
3. Clear browser cache

## Next Steps

After migration verified:
1. Run `sp.tasks` to generate implementation tasks
2. Implement tasks in order
3. Test thoroughly before merging
