# Research: EHR Schema Migration

**Feature**: 003-ehr-upgrade
**Date**: 2026-04-28

## Overview

Research findings for migrating from old snake_case/UUID schema to new PascalCase/integer schema.

## Decision: Schema Migration Approach

**Chosen**: Drop old tables, keep new tables (already exist in DB)

**Rationale**:
- New schema tables already created and seeded in database
- No data migration needed (old tables unused)
- Clean break prevents confusion between parallel schemas

**Alternatives Considered**:
- Migrate data from old to new: Rejected because old tables unused
- Keep both schemas longer: Rejected because adds maintenance burden

## Decision: Primary Key Type Change

**Chosen**: INTEGER AUTOINCREMENT (PatientID) instead of UUID (id)

**Rationale**:
- Matches Access database pattern being mirrored
- Simpler joins with lookup tables (also integer IDs)
- No external sharing of IDs (local-only system)

**Alternatives Considered**:
- Keep UUID for Patient: Rejected to match Access schema
- Use composite keys: Rejected for complexity

## Decision: API Contract Changes

**Chosen**: Breaking changes (field renames) acceptable

**Rationale**:
- Frontend and backend updated together in same feature branch
- No external API consumers (local-only application)
- Type safety (TypeScript) prevents runtime errors

**Alternatives Considered**:
- Maintain backward compatibility aliases: Rejected for code complexity
- Versioned API (/v2/): Rejected for local-only app

## Decision: Denormalized Patient Table

**Chosen**: Keep Patient table with 60+ columns (as designed in Access schema)

**Rationale**:
- Mirrors existing Access database used by clinic
- Simpler queries for common patient data
- Normalized data stored in specialized tables (labs, imaging, etc.)

**Alternatives Considered**:
- Normalize Patient table: Rejected to match Access schema

## Decision: Lookup Data Strategy

**Chosen**: Single `/api/lookups` endpoint returning all lookup tables

**Rationale**:
- Lookup data small (<1000 rows total)
- Single call reduces frontend complexity
- Lookups change infrequently (can cache on frontend)

**Alternatives Considered**:
- Separate endpoint per lookup type: Rejected for N+1 query problem
- Dynamic lookup loading: Rejected for complexity

## Technical Considerations

### sql.js Migration
- `DROP TABLE IF EXISTS` safe for non-existent tables
- Foreign key checks need to be disabled during DROP cascade
- Use `db.run()` for DDL statements

### Type System Migration
- TypeScript strict mode will catch field name mismatches
- Use `unknown` type during migration period if needed
- Frontend build will fail on type errors

### Database Operations
- All writes must call `saveDatabase()` after changes
- Use `db.exec()` for SELECT, `db.run()` for INSERT/UPDATE/DELETE
- Parameterized queries via sql.js prepared statements

## Open Questions (Resolved)

**Q**: Should we export data from old tables before dropping?
**A**: No — old tables unused, no real data to preserve

**Q**: How to handle image references (entity_type + entity_id)?
**A**: No changes needed — pattern works with both UUID and integer IDs

**Q**: Should we validate foreign key constraints exist?
**A**: Yes — ensure lookup tables seeded before Patient inserts

## References

- Old schema: `backend/src/db/schema.sql` (lines 12-430)
- New schema tables: Already exist in database (verified via sqlite_master)
- Frontend types: `frontend/lib/db.types.ts`
- API client: `frontend/lib/api.ts`
