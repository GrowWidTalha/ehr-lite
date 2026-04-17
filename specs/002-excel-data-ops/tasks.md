# Tasks: Excel Data Operations & Automated Backup

**Input**: Design documents from `/specs/002-excel-data-ops/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml

**Tests**: Tests are NOT explicitly requested in this specification. Test tasks are not included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths reflect the actual project structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [X] T001 Install backend dependencies (xlsx, node-schedule, archiver) in backend/package.json
- [X] T002 Create backend/scripts directory for import script in backend/scripts/
- [X] T003 Create backend/src/jobs directory for backup scheduler in backend/src/jobs/
- [X] T004 Create backend/src/utils directory for excel mapper in backend/src/utils/
- [X] T005 [P] Create /data/logs directory for import/export tracking logs in /data/logs/
- [X] T006 [P] Create /data/backups directory for backup storage in /data/backups/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Create excel column mapping configuration (82 columns) in backend/src/utils/excel.mapper.js
- [X] T008 [P] Implement JSON log file writer for import tracking in backend/src/utils/log-writer.js
- [X] T009 [P] Implement JSON log file writer for export tracking in backend/src/utils/log-writer.js
- [X] T010 Implement backup index manager for /data/backups/index.json in backend/src/utils/backup-index.js

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Excel Data Import (Priority: P1) 🎯 MVP

**Goal**: Standalone Node.js script to import patient data from Onco-format Excel files (82 columns) into normalized database schema with validation and interactive prompts.

**Independent Test**: Run `node backend/scripts/import-excel.js path/to/file.xlsx` with a sample Excel file containing 100 patient records. Verify patients are created in database with all data (demographics, vitals, history, habits, diagnoses) correctly mapped from flat Excel structure to normalized tables.

### Implementation for User Story 1

- [X] T011 [US1] Implement Excel file reader with sheet parsing in backend/scripts/import-excel.js
- [X] T012 [US1] Implement file structure validation (required columns: Name & Sur Name, Age, Sex) in backend/scripts/import-excel.js
- [X] T013 [US1] Implement row-level validation with error collection in backend/scripts/import-excel.js
- [X] T014 [US1] Implement interactive console prompts for error confirmation in backend/scripts/import-excel.js
- [X] T015 [US1] Implement Excel row to normalized database mapper using excel.mapper.js in backend/scripts/import-excel.js
- [X] T016 [US1] Implement patient creation with related records (vitals, history, habits, diagnoses) in backend/scripts/import-excel.js
- [X] T017 [US1] Implement progress indicator (rows processed/remaining) in backend/scripts/import-excel.js
- [X] T018 [US1] Implement import log file creation at /data/logs/import-YYYY-MM-DD.json in backend/scripts/import-excel.js
- [X] T019 [US1] Add npm script "import-excel" to package.json for easy script execution in backend/package.json

**Checkpoint**: At this point, User Story 1 (Excel Import Script) should be fully functional and testable independently. Run `npm run import-excel ../data/Onco-2025.xlsx` to validate.

---

## Phase 4: User Story 2 - Excel Data Export (Priority: P2)

**Goal**: Backend API endpoint and frontend button to export all patient data to Onco-format Excel files (82 columns) with timestamp filenames.

**Independent Test**: Click "Export to Excel" button on dashboard with 50 patients in database. Verify downloaded Excel file has 82 columns with data correctly flattened from normalized database structure.

### Implementation for User Story 2

- [X] T020 [P] [US2] Implement database query to fetch all patients with related data in backend/src/services/export.service.js
- [X] T021 [P] [US2] Implement normalized data to flat Excel structure mapper (reverse of import) in backend/src/services/export.service.js
- [X] T022 [US2] Implement Excel file generator with 82 columns using xlsx library in backend/src/services/export.service.js
- [X] T023 [US2] Implement export job logging to /data/logs/export-YYYY-MM-DD.json in backend/src/services/export.service.js
- [X] T024 [US2] Implement GET /api/export/patients endpoint with binary file response in backend/src/routes/export.js
- [X] T025 [US2] Register export routes with Express app in backend/src/server.js
- [X] T026 [P] [US2] Create ExportButton component with download functionality in frontend/src/components/ExportButton.tsx
- [X] T027 [US2] Add ExportButton to dashboard page in frontend/src/app/page.tsx
- [ ] T028 [US2] Add ExportButton to patients list page in frontend/src/app/patients/page.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Export button generates downloadable Excel files with 82 columns.

---

## Phase 5: User Story 3 - Automated Daily Backup (Priority: P3)

**Goal**: Scheduled daily backups of database and images to /data/backups/ with unlimited retention and status display in UI.

**Independent Test**: Wait for 2:00 AM or manually trigger backup job. Verify zip file is created at /data/backups/YYYY-MM-DD/backup-HHMMSS.zip containing database.db and patient-images/ folder. Verify status displays correctly in UI.

### Implementation for User Story 3

- [X] T029 [P] [US3] Implement disk space check function (2x current data size) in backend/src/services/backup.service.js
- [X] T030 [P] [US3] Implement zip archive creation using archiver (database.db + patient-images/) in backend/src/services/backup.service.js
- [X] T031 [US3] Implement backup integrity verification (archive can be opened) in backend/src/services/backup.service.js
- [X] T032 [US3] Implement backup index update (atomic write to /data/backups/index.json) in backend/src/services/backup.service.js
- [X] T033 [US3] Implement GET /api/backup/status endpoint in backend/src/routes/backup.js
- [X] T034 [US3] Implement POST /api/backup/create endpoint (manual trigger) in backend/src/routes/backup.js
- [X] T035 [US3] Implement GET /api/backup/list endpoint in backend/src/routes/backup.js
- [X] T036 [US3] Register backup routes with Express app in backend/src/server.js
- [X] T037 [P] [US3] Implement backup scheduler using node-schedule (daily at 2:00 AM) in backend/src/jobs/backup.job.js
- [X] T038 [US3] Implement missed backup check on server startup in backend/src/jobs/backup.job.js
- [ ] T039 [US3] Start backup scheduler when Express server starts in backend/src/server.js
- [X] T040 [P] [US3] Create use-backup hook for fetching backup status in frontend/src/hooks/use-backup.ts
- [X] T041 [US3] Create BackupStatus component to display last backup, total backups, next scheduled in frontend/src/components/BackupStatus.tsx
- [X] T042 [US3] Add BackupStatus component to dashboard page in frontend/src/app/page.tsx

**Checkpoint**: At this point, all user stories should now be independently functional. Daily automatic backups run at 2:00 AM, status displays in UI, manual backup works via API.

---

## Phase 6: User Story 4 - Manual Backup Trigger (Priority: P3)

**Goal**: "Backup Now" button in settings UI for on-demand backups with progress indication and error handling.

**Independent Test**: Click "Backup Now" button in settings. Verify backup starts immediately, button shows in-progress state, success message displays with file path on completion.

### Implementation for User Story 4

- [X] T043 [P] [US4] Implement backup in-progress state tracking (prevent concurrent backups) in backend/src/services/backup.service.js
- [X] T044 [US4] Implement POST /api/backup/create error responses (409 if in progress, 500 on failure) in backend/src/routes/backup.js
- [ ] T045 [P] [US4] Create BackupNowButton component with in-progress state and error display in frontend/src/components/BackupNowButton.tsx
- [X] T046 [US4] Add BackupNowButton to settings page in frontend/src/app/settings/page.tsx

**Checkpoint**: All user stories complete. Manual backup button works with proper state management and error handling.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T047 [P] Add error handling for Excel formulas vs values in backend/scripts/import-excel.js
- [ ] T048 [P] Add error handling for encoding issues (special characters) in backend/scripts/import-excel.js
- [X] T049 [P] Add disk space validation before backup starts in backend/src/services/backup.service.js
- [X] T050 [P] Handle missing images during backup (log warning, continue) in backend/src/services/backup.service.js
- [ ] T051 Update README.md with import/export/backup usage instructions in README.md
- [ ] T052 Run quickstart.md validation (test all user scenarios) in specs/002-excel-data-ops/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3/US4)
- **Polish (Phase 7)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Uses excel.mapper.js from Foundational phase
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P3)**: Depends on User Story 3 (shares backup service and routes)

### Within Each User Story

- Setup functions before core logic
- Core logic before UI integration
- Service layer before route/endpoint
- Backend endpoint before frontend component

### Parallel Opportunities

- Phase 1: All tasks marked [P] can run in parallel
- Phase 2: T008, T009 can run in parallel
- Phase 3 (US1): No parallel opportunities (sequential script building)
- Phase 4 (US2): T020, T021 can run in parallel; T026, T027, T028 can run in parallel after backend
- Phase 5 (US3): T029, T030 can run in parallel; T040, T041 can run in parallel
- Phase 6 (US4): T043, T045 can run in parallel after US3 backend complete

---

## Parallel Example: User Story 2

```bash
# Launch service implementations in parallel:
Agent: "Implement database query to fetch all patients with related data in backend/src/services/export.service.js"
Agent: "Implement normalized data to flat Excel structure mapper in backend/src/services/export.service.js"

# After services complete, launch frontend components in parallel:
Agent: "Create ExportButton component with download functionality in frontend/src/components/ExportButton.tsx"
Agent: "Add ExportButton to dashboard page in frontend/src/app/page.tsx"
Agent: "Add ExportButton to patients list page in frontend/src/app/patients/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T010) - CRITICAL
3. Complete Phase 3: User Story 1 (T011-T019)
4. **STOP and VALIDATE**: Test import script with sample Excel file
5. Demo/ship MVP if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **MVP complete!** (Excel import works)
3. Add User Story 2 → Test independently → Export functionality available
4. Add User Story 3 → Test independently → Automatic backups running
5. Add User Story 4 → Test independently → Manual backup button available
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Import script)
   - Developer B: User Story 2 (Export API + UI)
   - Developer C: User Story 3 (Backup system)
3. Stories complete and integrate independently

---

## Summary

| Metric | Count |
|--------|-------|
| **Total Tasks** | 52 |
| **Setup Phase** | 6 tasks (T001-T006) |
| **Foundational Phase** | 4 tasks (T007-T010) |
| **User Story 1 (P1)** | 9 tasks (T011-T019) 🎯 MVP |
| **User Story 2 (P2)** | 9 tasks (T020-T028) |
| **User Story 3 (P3)** | 14 tasks (T029-T042) |
| **User Story 4 (P3)** | 4 tasks (T043-T046) |
| **Polish Phase** | 6 tasks (T047-T052) |
| **Parallel Opportunities** | 15 tasks marked [P] |

### Suggested MVP Scope

**Phase 1 + Phase 2 + Phase 3 (User Story 1)** = 19 tasks

This delivers:
- ✅ Excel import script that works from command line
- ✅ 82-column field mapping
- ✅ Validation with interactive prompts
- ✅ Append-only mode
- ✅ Import logging

**Value**: Clinics can import their existing patient data and start using the system.
