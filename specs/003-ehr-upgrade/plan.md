# Implementation Plan: EHR Schema Migration

**Branch**: `003-ehr-upgrade` | **Date**: 2026-04-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-ehr-upgrade/spec.md`

## Summary

Migrate EHR Lite from old snake_case/UUID schema to new PascalCase/integer schema. The new schema tables already exist in the database; this migration removes old tables and updates all frontend/backend code to use the new schema. Key tasks: rewrite schema.sql to drop old tables, update patients.js route with new endpoints, update frontend types and API calls.

## Technical Context

**Language/Version**: Node.js 20+ (backend), TypeScript 5.3+ (frontend)
**Primary Dependencies**: Express.js (backend), Next.js 14 (frontend), sql.js (SQLite), Zod (validation)
**Storage**: SQLite at `/backend/data/database.db`
**Testing**: Manual testing via browser
**Target Platform**: Windows 10/11, local browser (localhost:3000)
**Project Type**: web (backend + frontend)
**Performance Goals**: p95 <200ms for patient list, <100ms for single patient fetch
**Constraints**: Must maintain offline operation, single-click startup, healthcare data validation
**Scale/Scope**: ~50 new schema tables, 13 old tables to drop, 25+ API endpoints to update

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Local-First**: No cloud dependencies? All data local? — YES, SQLite remains local
- [x] **Single-Click Startup**: Can be started via `.bat` file? — YES, no startup changes
- [x] **Healthcare Data Protection**: Input validation on all endpoints? File validation? — YES, validation preserved
- [x] **Data Portability**: All data in `/data/` folder? Easy backup? — YES, database still in /data/
- [x] **Camera-First**: Camera capture prioritized? File fallback included? — YES, images unchanged
- [x] **Fail-Safe Errors**: Clear error messages? Structured error responses? — YES, error handling unchanged

**Result**: All checks pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/003-ehr-upgrade/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── patients.yaml    # Patient API contract
│   └── lookups.yaml     # Lookups API contract
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── db/
│   │   ├── schema.sql    # Rewrite: drop old tables, keep new
│   │   ├── init.js       # Update: check for Patient table
│   │   ├── connection.js # No changes needed
│   │   └── query.js      # Update if old refs exist
│   ├── routes/
│   │   ├── patients.js   # Rewrite: all endpoints for Patient table
│   │   ├── lookups.js    # Create: GET /api/lookups
│   │   ├── dashboard.js  # Update: new table names
│   │   └── [others]      # Update SQL queries only
│   ├── services/
│   │   ├── export.service.js  # Update column mappings
│   │   └── import.service.js  # Update column mappings
│   └── utils/
│       └── excel.mapper.js    # Update field mappings
└── data/
    └── database.db         # SQLite database (new tables already exist)

frontend/
├── lib/
│   ├── db.types.ts    # Rewrite: new Patient interface, lookups
│   └── api.ts         # Update: new endpoints, field names
├── hooks/
│   ├── use-patients.ts   # Update: PatientID, PatientName etc.
│   ├── use-diagnosis.ts  # Remap to new endpoints
│   ├── use-habits.ts     # Remap to lifestyle
│   ├── use-history.ts    # Remap to family history
│   ├── use-vitals.ts     # Remap to Patient fields
│   └── use-lookups.ts    # Create: fetch lookups
└── components/patients/
    ├── patient-table.tsx   # Update column keys
    ├── patient-card.tsx    # Update field refs
    └── patient-form.tsx    # Add lookup dropdowns
```

**Structure Decision**: Web application (backend + frontend). New schema follows oncology Access database pattern with denormalized Patient table and specialized lab/imaging/treatment tables.

## Phase 0: Research Findings

See [research.md](./research.md) for:
- Old vs new schema mapping
- sql.js migration considerations
- Frontend type migration strategy
- API backward compatibility notes

## Phase 1: Design Decisions

### Data Model

See [data-model.md](./data-model.md) for:
- Complete new schema entity definitions
- Lookup tables structure
- Relationship mappings

### API Contracts

See [contracts/](./contracts/) for:
- `patients.yaml`: CRUD endpoints for Patient
- `lookups.yaml`: Lookup data endpoint

### Quickstart Guide

See [quickstart.md](./quickstart.md) for:
- Running the migration
- Testing endpoints
- Verification checklist

## Migration Strategy

1. **Database**: Drop old tables, keep new tables (already exist)
2. **Backend Routes**: Rewrite endpoints to use new tables
3. **Frontend Types**: Update interfaces to match new schema
4. **Frontend Components**: Update field references only (no UI redesign)
5. **Testing**: Verify patient list, create, lookup endpoints work

## Key Changes

### Backend
- `patients.id` → `Patient.PatientID` (TEXT → INTEGER AUTOINCREMENT)
- `patients.full_name` → `Patient.PatientName`
- Foreign keys now use integer IDs referencing lookup tables
- New sub-resource endpoints: `/labs`, `/imaging`, `/treatments`, `/pathology`, `/lifestyle`

### Frontend
- Type `Patient` now has 60+ fields matching new schema
- Add `useLookups()` hook for dropdown data
- Update all API calls to use new field names

## Risk Analysis

| Risk | Mitigation |
|------|------------|
| Data loss during migration | Old tables dropped AFTER code updates verified |
| Breaking existing UI | Field name changes only, no UI redesign |
| Missing lookup data | Lookup tables already seeded with data |
| Cascade delete issues | Foreign key constraints tested manually |

## Definition of Done

- [ ] Old tables dropped from schema.sql
- [ ] init.js checks for `Patient` table
- [ ] All endpoints use new schema
- [ ] Frontend types updated
- [ ] Patient list loads correctly
- [ ] Patient create works with lookups
- [ ] /api/lookups returns data
- [ ] Export/import functions work
