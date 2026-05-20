---

description: "Task list for EHR Schema Migration - migrating from snake_case/UUID schema to PascalCase/integer schema"
---

# Tasks: EHR Schema Migration (003-ehr-upgrade)

**Input**: Design documents from `/specs/003-ehr-upgrade/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests not explicitly requested - manual verification per quickstart.md

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`
- **Frontend**: `frontend/`
- **Database**: `backend/data/database.db`

---

## Phase 1: Setup

**Purpose**: Verify environment and prerequisites

- [X] T001 Verify Node.js 20+ installed and backend dependencies available
- [X] T002 Verify TypeScript 5.3+ installed and frontend dependencies available
- [X] T003 Create backup of existing database at backend/data/database.db.backup

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema changes that BLOCK all subsequent work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Rewrite backend/src/db/schema.sql - drop old tables (report_images, reports, treatment_sessions, treatment_plans, imaging_studies, biomarker_tests, pathology_reports, previous_treatments, cancer_diagnoses, patient_habits, patient_history, patient_vitals, patients) at top, drop old views (vw_patient_summary, vw_diagnosis_detail), keep all new tables with CREATE TABLE IF NOT EXISTS, add vw_patient_list and vw_patient_detail views
- [X] T005 Update backend/src/db/init.js - change table existence check from any table to specifically `Patient` table (SELECT name FROM sqlite_master WHERE type='table' AND name='Patient')
- [X] T006 [P] Verify backend/src/db/connection.js - confirm dbPath resolves to backend/data/database.db correctly
- [X] T007 [P] Check backend/src/db/query.js - update any hardcoded references to old table names (patients, patient_vitals, etc.)
- [X] T008 Run database initialization to apply schema changes (node backend/src/db/init.js)

**Checkpoint**: Database migrated to new schema - patient table exists with PatientID (integer), old tables dropped

---

## Phase 3: User Story 1 - Backend CRUD Routes (Priority: P1) 🎯 MVP

**Goal**: Implement patient CRUD and lookup endpoints using new Patient table

**Independent Test**: Start backend, call GET /api/patients - should return empty array or patients with PatientID/PatientName fields; call GET /api/lookups - should return all lookup data

### Implementation for User Story 1

- [X] T009 Rewrite GET /api/patients endpoint in backend/src/routes/patients.js - query from vw_patient_list, support page/limit/search params (searches PatientName, RegistrationNo, ContactNo), return {patients, total, page, limit, totalPages}
- [X] T010 Rewrite GET /api/patients/:id endpoint in backend/src/routes/patients.js - query from vw_patient_detail, return full patient with resolved lookup names
- [X] T011 Rewrite POST /api/patients endpoint in backend/src/routes/patients.js - accept all Patient fields, auto-set RegistrationDate if not provided, return created patient with PatientID
- [X] T012 Rewrite PUT /api/patients/:id endpoint in backend/src/routes/patients.js - accept partial Patient fields, update only provided fields, return updated patient
- [X] T013 Rewrite DELETE /api/patients/:id endpoint in backend/src/routes/patients.js - delete patient (cascade handles related records), return {success: true}
- [X] T014 Implement GET /api/patients/:id/labs endpoint in backend/src/routes/patients.js - query all lab tables (LabTestCBCHB, LFT, BloodUrea, etc.), group by type, return {cbc: [...], lft: [...], bloodSugar: [...], ...}
- [X] T015 [P] Implement GET /api/patients/:id/imaging endpoint in backend/src/routes/patients.js - query all imaging tables (xRay, CTScan, MRI, etc.), group by type, return {xray: [...], ctScan: [...], mri: [...], ...}
- [X] T016 [P] Implement GET /api/patients/:id/treatments endpoint in backend/src/routes/patients.js - query all treatment tables (ChemoTherapy, RadioTherapy, etc.), group by type, return {chemo: [...], radio: [...], ...}
- [X] T017 [P] Implement GET /api/patients/:id/pathology endpoint in backend/src/routes/patients.js - query pathology tables (BoneMarrowBiopsy, Cytogenetics, immunophenotyping, MolecularTest) and ImagingTestFooter, return grouped results
- [X] T018 [P] Implement GET /api/patients/:id/lifestyle endpoint in backend/src/routes/patients.js - query PatientAddictions, PatientDrinks, PatientFoods, FamilyHistory with joins to lookup tables, return {addictions: [...], drinks: [...], foods: [...], familyHistory: [...]}
- [X] T019 Create backend/src/routes/lookups.js - new route file with GET /api/lookups endpoint that queries all lookup tables and returns {bloodGroups: [...], hospitals: [...], laboratories: [...], occupations: [...], qualifications: [...], motherTongues: [...], districts: [...], provinces: [...], relations: [...], sports: [...], durations: [...], typeOfSamples: [...], diseases: [...], addictions: [...], drinks: [...], foods: [...], cancerTypes: {brainTumors: [...], breastCancer: [...], ...}}
- [X] T020 Register lookups route in backend/src/server.js - add import and app.use('/api/lookups', lookupsRouter)
- [X] T021 Update GET /api/dashboard/stats endpoint in backend/src/routes/dashboard.js - change queries to use Patient table (COUNT(*), date('now') filter, FollowUp = 1 filter), group by cancer type columns
- [X] T022 Update GET /api/dashboard/recent endpoint in backend/src/routes/dashboard.js - query vw_patient_list ORDER BY RegistrationDate DESC LIMIT 5

**Checkpoint**: Backend CRUD complete - patient list/details/create/update/delete work, lookups endpoint returns data, dashboard uses new tables

---

## Phase 4: User Story 2 - Backend Services (Priority: P2)

**Goal**: Update export/import services to use new schema columns

**Independent Test**: Create patient with various fields, export to Excel - should have new column headers; import from Excel - should map to new Patient fields

### Implementation for User Story 2

- [X] T023 Update column name mappings in backend/src/utils/excel.mapper.js - map old headers (full_name, age, sex) to new (PatientName, Age, Gender), add mappings for all 60+ Patient fields
- [X] T024 Update INSERT query in backend/src/services/import.service.js - use new Patient table columns (PatientID, PatientName, etc.) instead of old (id, full_name, etc.)
- [X] T025 Update SELECT query in backend/src/services/export.service.js - query Patient table with new column names for Excel export

**Checkpoint**: Export/import services work with new schema

---

## Phase 5: User Story 3 - Frontend Types & API (Priority: P3)

**Goal**: Update TypeScript types and API client for new schema

**Independent Test**: Frontend compiles without TypeScript errors, API calls return correctly typed data

### Implementation for User Story 3

- [X] T026 [P] Rewrite Patient interface in frontend/lib/db.types.ts - change id to PatientID (number), full_name to PatientName, registration_number to RegistrationNo, add all 60+ Patient fields (BloodGroup, Hospital, Qualifications, Occupation, etc.), add lookup name fields (BloodGroupName, HospitalName, etc.)
- [X] T027 [P] Update PatientListItem interface in frontend/lib/db.types.ts - use PatientID, PatientName, RegistrationNo, Age, Gender, ContactNo, RegistrationDate, ExaminationDate, DoctorName, BloodGroup, HospitalName, FollowUp
- [X] T028 [P] Update CreatePatientInput/UpdatePatientInput in frontend/lib/db.types.ts - use new field names, foreign key fields as integers (BloodGroup, Hospital, etc.)
- [X] T029 [P] Add LookupItem interface to frontend/lib/db.types.ts - {ID: number, [key: string]: string | number}
- [X] T030 [P] Add LookupsResponse interface to frontend/lib/db.types.ts - {bloodGroups: LookupItem[], hospitals: LookupItem[], laboratories: LookupItem[], ...}
- [X] T031 [P] Remove old types from frontend/lib/db.types.ts - PatientVitals, PatientHistory, PatientHabits (data now in Patient or lifestyle endpoints)
- [X] T032 Update patientApi.list() in frontend/lib/api.ts - handle new response structure {patients: [...], total, page, limit, totalPages}
- [X] T033 Update patientApi.get(id) in frontend/lib/api.ts - id is now number (PatientID), response has new field names
- [X] T034 Update patientApi.create() in frontend/lib/api.ts - send new field names (PatientName, etc.)
- [X] T035 Update patientApi.update() in frontend/lib/api.ts - send new field names
- [X] T036 Update patientApi.delete() in frontend/lib/api.ts - id is now number
- [X] T037 Add getPatientLabs(id: number) to frontend/lib/api.ts - GET /api/patients/:id/labs
- [X] T038 [P] Add getPatientImaging(id: number) to frontend/lib/api.ts
- [X] T039 [P] Add getPatientTreatments(id: number) to frontend/lib/api.ts
- [X] T040 [P] Add getPatientPathology(id: number) to frontend/lib/api.ts
- [X] T041 [P] Add getPatientLifestyle(id: number) to frontend/lib/api.ts
- [X] T042 Add getLookups() to frontend/lib/api.ts - GET /api/lookups, returns LookupsResponse
- [X] T043 Remove unused API functions from frontend/lib/api.ts - vitalsApi, historyApi, habitsApi (replaced by patient fields and lifestyle endpoint)

**Checkpoint**: Frontend types updated, API client uses new endpoints and field names

---

## Phase 6: User Story 4 - Frontend Hooks (Priority: P4)

**Goal**: Update React hooks to use new field names and endpoints

**Independent Test**: Browser console shows no errors, patient list displays, lookups load

### Implementation for User Story 4

- [X] T044 Update use-patients.ts in frontend/hooks/ - change id to PatientID, full_name to PatientName, registration_number to RegistrationNo, use new API response structure
- [X] T045 Rewrite use-habits.ts in frontend/hooks/ to use-lifestyle.ts - call getPatientLifestyle(), return {addictions, drinks, foods, familyHistory}
- [X] T046 Update use-history.ts in frontend/hooks/ - remap to FamilyHistory data from lifestyle endpoint
- [X] T047 Update use-vitals.ts in frontend/hooks/ - remap to Patient fields (height → Height/Weight from Patient table)
- [X] T048 Update use-diagnosis.ts in frontend/hooks/ - remap to new treatment/pathology endpoints (getPatientTreatments, getPatientPathology)
- [X] T049 Create frontend/hooks/use-lookups.ts - new hook that calls getLookups(), caches result, returns {bloodGroups, hospitals, laboratories, ...}

**Checkpoint**: All hooks updated to use new schema and endpoints

---

## Phase 7: User Story 5 - Frontend Components (Priority: P5)

**Goal**: Update React components to use new field names and add lookup dropdowns

**Independent Test**: Patient list renders, patient form shows with dropdowns, create patient works

### Implementation for User Story 5

- [X] T050 Update column keys in frontend/components/patients/patient-table.tsx - change id to PatientID, full_name to PatientName, registration_number to RegistrationNo, phone to ContactNo
- [X] T051 Update field references in frontend/components/patients/patient-card.tsx - use PatientID, PatientName, Age, Gender, ContactNo
- [X] T052 Update field names in frontend/components/patients/patient-form.tsx - use new Patient field names, add select dropdowns for BloodGroup, Hospital, Qualifications, Occupation, MotherTongue, PlaceOfBirth, Sports (use useLookups hook for options)
- [X] T053 Update form submission in frontend/app/patients/new/page.tsx - send new field names to API
- [X] T054 Update form submission in frontend/app/onboarding/new/page.tsx - send new field names to API

**Checkpoint**: Frontend components display and work with new schema

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [X] T055 Run backend and verify patient list loads at http://localhost:4000/api/patients
- [X] T056 Run frontend and verify patient list displays at http://localhost:3000/patients
- [X] T057 Test patient creation with lookup dropdowns (BloodGroup, Hospital, etc.)
- [X] T058 Verify export functionality works with new schema
- [X] T059 Verify import functionality works with new schema
- [X] T060 Run validation checklist from quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - Core CRUD (MVP)
- **User Story 2 (Phase 4)**: Depends on Foundational - Can run parallel with US1
- **User Story 3 (Phase 5)**: Depends on US1 completion (needs working API)
- **User Story 4 (Phase 6)**: Depends on US3 completion (needs types and API)
- **User Story 5 (Phase 7)**: Depends on US4 completion (needs hooks)
- **Polish (Phase 8)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (Backend CRUD)**: Foundation for all other stories
- **User Story 2 (Backend Services)**: Independent of US1, can parallel
- **User Story 3 (Frontend Types)**: Requires US1 (API contracts)
- **User Story 4 (Frontend Hooks)**: Requires US3 (types and API)
- **User Story 5 (Frontend Components)**: Requires US4 (hooks)

### Within Each User Story

- Backend routes: endpoints can be implemented in any order within a story
- Frontend types: all type updates (T026-T031) can run in parallel
- Frontend API: all API function updates can run in parallel after types complete
- Frontend components: component updates are independent

### Parallel Opportunities

- **Phase 2**: T006, T007 can run in parallel
- **Phase 3**: T015, T016, T017, T018 can run in parallel (different sub-resource endpoints)
- **Phase 5**: T026-T031 (all type updates) can run in parallel
- **Phase 5**: T038-T041 (new endpoint functions) can run in parallel

---

## Parallel Example: User Story 3 (Frontend Types)

```bash
# Launch all type updates together (same file, independent sections):
Task: "Rewrite Patient interface in frontend/lib/db.types.ts"
Task: "Update PatientListItem interface in frontend/lib/db.types.ts"
Task: "Update CreatePatientInput/UpdatePatientInput in frontend/lib/db.types.ts"
Task: "Add LookupItem interface to frontend/lib/db.types.ts"
Task: "Add LookupsResponse interface to frontend/lib/db.types.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (database migration)
3. Complete Phase 3: User Story 1 (Backend CRUD)
4. Complete Phase 4: User Story 2 (Backend Services)
5. **STOP and VALIDATE**: Backend fully functional
6. Test with Postman/curl before frontend work

### Incremental Delivery

1. Backend Complete (Phases 1-4) → Test API endpoints
2. Add Frontend Types + API (Phase 5) → Verify TypeScript compiles
3. Add Frontend Hooks (Phase 6) → Test hooks individually
4. Add Frontend Components (Phase 7) → Full E2E test
5. Polish (Phase 8) → Deploy ready

### Parallel Team Strategy

With multiple developers:

1. **Together**: Complete Setup + Foundational (Phases 1-2)
2. Once Foundational complete:
   - **Developer A**: User Story 1 (Backend CRUD)
   - **Developer B**: User Story 2 (Backend Services) - parallel!
3. After US1 complete:
   - **Developer A**: User Story 3 (Frontend Types + API)
   - **Developer B**: User Story 4 (Frontend Hooks) - can start after US3 types done
4. After US4 complete:
   - **Developer A**: User Story 5 (Frontend Components)
   - **Developer B**: Polish testing

---

## Notes

- [P] tasks = different files or independent sections, no conflicts
- [Story] label maps task to specific user story
- Each checkpoint represents a stopping point for validation
- Run `node backend/src/db/init.js` to apply schema changes
- After backend changes: always restart server
- After frontend changes: check browser console for errors
- TypeScript strict mode will catch field name mismatches
- PatientID is integer (not UUID) - update any ID handling code
- Foreign key fields accept integer IDs (not objects)
