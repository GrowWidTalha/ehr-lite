# Implementation Plan: Excel Data Operations & Automated Backup

**Branch**: `002-excel-data-ops` | **Date**: 2026-03-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-excel-data-ops/spec.md`

**User Clarification**: Excel to DB import will be implemented as a simple Node.js script (not a full UI feature) since it's used infrequently.

## Summary

This feature adds three data operations capabilities to EHR Lite:

1. **Excel Import Script**: A standalone Node.js script to import patient data from Onco-format Excel files (82 columns) into the normalized database schema. Uses append-only mode with console-based validation prompts.

2. **Excel Export API & UI**: Backend API endpoint and frontend button to export all patient data to Onco-format Excel files (82 columns). Accessible from dashboard and patients list.

3. **Automated Backup System**: Scheduled daily backups of database and images to `/data/backups/` with manual trigger support, status display, and unlimited retention.

## Technical Context

**Language/Version**: Node.js 20+ (backend), TypeScript 5.3+ (frontend)
**Primary Dependencies**:
- Backend: `xlsx` or `exceljs` (Excel parsing/generation), `node-schedule` (backup scheduling), `archiver` (zip compression)
- Frontend: Existing stack (Next.js, React, Tailwind)
- Storage: SQLite (sql.js) at `/data/database.db`, images at `/data/patient-images/`
**Testing**: Jest for backend scripts, existing test patterns for frontend
**Target Platform**: Windows 10/11, local server (localhost:4000)
**Project Type**: Web application (backend + frontend)
**Performance Goals**: Import 1,000 records in <5 min, export 1,000 patients in <60 sec, backup completes in <2 min
**Constraints**: Must use local-only operations, no cloud dependencies, offline-capable
**Scale/Scope**: Support up to 10,000 Excel rows, unlimited backup retention

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Local-First**: No cloud dependencies? All data local?
  - **PASS**: Excel operations use local files only. Backups stored locally at `/data/backups/`. No external services.
- [x] **Single-Click Startup**: Can be started via `.bat` file?
  - **PASS**: Import script runs via npm script. Backup scheduler starts automatically with backend server.
- [x] **Healthcare Data Protection**: Input validation on all endpoints? File validation?
  - **PASS**: Excel import validates required fields (name, age, sex). File type validation for .xlsx only. Error handling for malformed data.
- [x] **Data Portability**: All data in `/data/` folder? Easy backup?
  - **PASS**: Backups stored at `/data/backups/`. Export creates portable Excel files. All data remains local.
- [x] **Camera-First**: Camera capture prioritized? File fallback included?
  - **N/A**: This feature does not involve camera operations.
- [x] **Fail-Safe Errors**: Clear error messages? Structured error responses?
  - **PASS**: Validation shows specific row/column errors. Backup failures show clear messages. Console prompts for import script.

**All gates passed**. No complexity tracking required.

## Project Structure

### Documentation (this feature)

```text
specs/002-excel-data-ops/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── api.yaml         # OpenAPI spec for export/backup endpoints
│   └── schema.sql       # Database schema for job/backup tracking
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Existing structure - adding new files

backend/
├── src/
│   ├── routes/
│   │   ├── export.js           # NEW: Excel export endpoint
│   │   └── backup.js           # NEW: Backup management endpoints
│   ├── services/
│   │   ├── export.service.js   # NEW: Excel generation logic
│   │   └── backup.service.js   # NEW: Backup scheduling/execution
│   ├── jobs/
│   │   └── backup.job.js       # NEW: Scheduled backup job
│   └── utils/
│       └── excel.mapper.js     # NEW: 82-column field mapping
├── scripts/
│   └── import-excel.js         # NEW: Standalone import script
└── tests/
    └── integration/
        ├── export.test.js      # NEW: Export endpoint tests
        └── backup.test.js      # NEW: Backup service tests

frontend/
├── src/
│   ├── components/
│   │   ├── ExportButton.tsx    # NEW: Export button component
│   │   └── BackupStatus.tsx    # NEW: Backup status display
│   ├── hooks/
│   │   └── use-backup.ts       # NEW: Backup status hook
│   └── app/
│       └── (dashboard)/
│         └── page.tsx          # MODIFY: Add export/backup UI
└── tests/
    └── components/
        ├── ExportButton.test.tsx
        └── BackupStatus.test.tsx
```

**Structure Decision**: Web application pattern (Option 2). Backend uses existing Express structure with new routes, services, and a scripts directory for the import utility. Frontend follows existing Next.js app router pattern with new components and hooks.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | All constitution gates passed | No violations to justify |

---

## Phase 0: Research & Technical Decisions

*Output: `research.md`*

### Research Tasks

1. **Excel Library Selection**: Evaluate `xlsx` vs `exceljs` for Node.js
   - Requirements: Read/write .xlsx files, handle 82 columns, performance for 10k rows
   - Decision criteria: Memory efficiency, API simplicity, streaming support

2. **Backup Scheduling**: Evaluate `node-schedule` vs `cron` patterns
   - Requirements: Daily execution at configurable time, persist on restart
   - Decision criteria: In-process scheduling, error recovery, Windows compatibility

3. **File Validation Patterns**: Best practices for validating Excel file structure
   - Requirements: Detect column mismatches, handle encoding issues, validate data types
   - Decision criteria: Clear error messages, performance for large files

4. **82-Column Mapping Strategy**: Data transformation patterns
   - Requirements: Map flat Excel structure to normalized DB schema, handle nulls, preserve relationships
   - Decision criteria: Maintainability, testability, performance

### Deliverables

- `research.md` documenting technology choices with rationale
- All NEEDS CLARIFICATION items resolved
- Performance benchmarks for chosen libraries

---

## Phase 1: Design & Contracts

*Output: `data-model.md`, `contracts/`, `quickstart.md`*

### Data Model

**New Entities** (for tracking):

1. **Import Log** (for script execution tracking)
   - id, timestamp, source_file, rows_processed, rows_imported, rows_skipped, errors

2. **Export Job** (for export tracking)
   - id, timestamp, patient_count, file_name, status, created_by

3. **Backup** (for backup management)
   - id, timestamp, path, size_bytes, status, type (automatic/manual)

4. **Excel Column Mapping** (configuration)
   - excel_column, table_name, field_name, data_type, required, transform_function

**No schema changes needed** - using existing patient tables. Tracking logs stored in new tables or JSON log files.

### API Contracts

**New Endpoints** (see `contracts/api.yaml`):

```
GET  /api/export/patients        # Export all patients to Excel
GET  /api/backup/status           # Get current backup status
POST /api/backup/create           # Trigger manual backup
GET  /api/backup/list             # List available backups
```

### Quickstart Guide

**For Developers**:

```bash
# Import Excel data (one-time setup)
cd backend
node scripts/import-excel.js ../data/Onco-2025.xlsx

# Start backend with backup scheduler
npm start

# Test export endpoint
curl http://localhost:4000/api/export/patients -o export.xlsx
```

**For End Users**:

1. Click "Export to Excel" on dashboard → downloads `ehr-export-YYYY-MM-DD.xlsx`
2. Automatic daily backups at 2:00 AM (configurable)
3. Click "Backup Now" in settings for immediate backup

### Deliverables

- `data-model.md` with entity definitions and relationships
- `contracts/api.yaml` with OpenAPI specification
- `quickstart.md` with setup and usage instructions
- Agent context updated via `.specify/scripts/bash/update-agent-context.sh`

---

## Phase 2: Implementation Tasks

*Output: `tasks.md` (created by `/sp.tasks` command, NOT by `/sp.plan`)*

**Note**: Run `/sp.tasks` after completing Phase 1 to generate the implementation task list. This phase is not executed by `/sp.plan`.

---

## Appendix: Excel Column Mapping Reference

*For quick reference during implementation*

| Excel Column | Target Table | Target Field | Notes |
|--------------|--------------|--------------|-------|
| Reg No | patients | registration_number | External reference |
| Reg. Date | patients | registration_date | Date type |
| Name & Sur Name | patients | full_name | Required |
| Age | patients | age | Integer, Required |
| Sex | patients | sex | 'M'/'F', Required |
| Height | patient_vitals | height_cm | Numeric |
| Weight | patient_vitals | weight_kg | Numeric |
| Blood Group | patient_vitals | blood_group | String |
| Type of Cancer | cancer_diagnoses | cancer_type | Required |
| Stage | cancer_diagnoses | stage | String |
| Grade | cancer_diagnoses | grade | String |
| ... | ... | ... | (69 more columns) |

*Complete mapping documented in `backend/src/utils/excel.mapper.js`*
