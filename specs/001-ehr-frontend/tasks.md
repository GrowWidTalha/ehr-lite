# Tasks: EHR Frontend

**Input**: Design documents from `/specs/001-ehr-frontend/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.yaml ✅, quickstart.md ✅

**Tests**: Manual testing checklist included in spec.md. Test tasks included for key user stories.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

**Web app structure**: `frontend/src/`, `frontend/public/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create frontend directory structure: frontend/src/{app,components,lib,hooks}, frontend/public
- [X] T002 Initialize Next.js 14 project with TypeScript: npx create-next-app@latest with App Router, ESLint, Tailwind
- [X] T003 Install core dependencies: npm install react-hook-form zod @hookform/resolvers @tanstack/react-query date-fns clsx tailwind-merge class-variance-authority lucide-react
- [X] T004 [P] Initialize shadcn/ui: npx shadcn-ui@latest init (select TypeScript, Default style, Slate color, CSS variables)
- [X] T005 [P] Install required shadcn/ui components: npx shadcn-ui@latest add button input label select textarea form card accordion tabs separator toast alert dialog alert-dialog sheet scroll-area badge avatar pagination
- [X] T006 [P] Configure Tailwind for shadcn/ui: Update tailwind.config.ts with content paths and darkMode
- [X] T007 [P] Create environment file: frontend/.env.local with NEXT_PUBLIC_API_URL=http://localhost:4000/api
- [X] T008 [P] Configure TypeScript strict mode: Update tsconfig.json with strict: true, paths aliases
- [X] T009 [P] Update globals.css: Import shadcn/ui CSS variables and base styles in frontend/src/app/globals.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T010 Create TypeScript type definitions in frontend/src/lib/db.types.ts (Patient, Vitals, History, Habits, Diagnosis, Report, API types)
- [X] T011 Create Zod validation schemas in frontend/src/lib/validations.ts (patientSchema, vitalsSchema, historySchema, habitsSchema, diagnosisSchema, reportSchema)
- [X] T012 Create API client wrapper in frontend/src/lib/api.ts with fetch wrapper, error handling, typed responses
- [X] T013 Create utility functions in frontend/src/lib/utils.ts (cn for classnames, formatDate, formatPhoneNumber)
- [X] T014 [P] Create use-patients hook in frontend/src/hooks/use-patients.ts (usePatientList, usePatient, useCreatePatient, useUpdatePatient)
- [X] T015 [P] Create use-diagnosis hook in frontend/src/hooks/use-diagnosis.ts (useDiagnoses, useCreateDiagnosis, useUpdateDiagnosis)
- [X] T016 [P] Create use-reports hook in frontend/src/hooks/use-reports.ts (useReports, useUploadReport, useDeleteReport)
- [X] T017 Create root layout with sidebar in frontend/src/app/layout.tsx (Sidebar component, navigation structure)
- [X] T018 [P] Create Sidebar component in frontend/src/components/layout/sidebar.tsx (NavMenu, OfflineIndicator, PatientSummary)
- [X] T019 [P] Create OfflineIndicator component in frontend/src/components/layout/offline-indicator.tsx (green dot + "Offline Mode")
- [X] T020 Create Toast provider in frontend/src/components/ui/toast.tsx for success/error notifications
- [X] T021 Create ErrorBoundary component in frontend/src/components/shared/error-boundary.tsx for error handling
- [X] T022 Create LoadingSpinner component in frontend/src/components/shared/loading-spinner.tsx for loading states

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Find Existing Patient (Priority: P1) 🎯 MVP

**Goal**: Staff can search for patients by name, phone, or CNIC and see matching results

**Independent Test**: Staff can search for patients by name, phone, or CNIC and see matching results

- [X] T023 [P] [US1] Create SearchBar component in frontend/src/components/patients/search-bar.tsx with Input and debounced search
- [X] T024 [P] [US1] Create PatientCard component in frontend/src/components/patients/patient-card.tsx displaying Name, Age, Sex, Phone, Reg Date, Report Count
- [X] T025 [P] [US1] Create PatientTable component in frontend/src/components/patients/patient-table.tsx with columns: Name, Age, Sex, Phone, CNIC, Reg Date, Actions
- [X] T026 [P] [US1] Create ViewToggle component in frontend/src/components/patients/view-toggle.tsx for Card/Table switch
- [X] T027 [US1] Create patient list page in frontend/src/app/page.tsx with search, view toggle, pagination, quick actions
- [X] T028 [US1] Integrate use-patients hook with patient list page for search and filtering
- [X] T029 [US1] Add "No patients found" empty state with "Register New Patient" button
- [X] T030 [US1] Add pagination component (50 patients per page) to patient list page
- [ ] T031 [US1] Test patient search: Verify search by name returns matching results, search by phone works, "No patients found" message displays
- [ ] T032 [US1] Test view toggle: Verify Card/Table switch works instantly (< 100ms)

**Checkpoint**: At this point, User Story 1 should be fully functional - staff can search and view patients

---

## Phase 4: User Story 2 - Register New Patient (Priority: P1) 🎯 MVP

**Goal**: Staff can create a new patient record with basic demographics

**Independent Test**: Staff can create a new patient record with basic demographics and complete the workflow

- [X] T033 [P] [US2] Create NewPatientForm component in frontend/src/components/patients/new-patient-form.tsx with React Hook Form + Zod validation
- [X] T034 [P] [US2] Create search-first prompt UI in frontend/src/components/patients/patient-search-prompt.tsx ("Check if patient exists...")
- [X] T035 [US2] Create patient registration form accordions in frontend/src/components/patients/patient-registration-form.tsx (Basic info required, optional sections collapsed)
- [X] T036 [US2] Add required field markers (red asterisk *) to all required inputs in patient form
- [X] T037 [US2] Implement inline validation errors with helpful messages for all form fields
- [X] T038 [US2] Create new patient page in frontend/src/app/patients/new/page.tsx with search prompt and form
- [ ] T039 [US2] Add duplicate patient check: Search API call before form submission, show AlertDialog if matches found
- [X] T040 [US2] Add success toast after patient creation with redirect to patient detail page
- [ ] T041 [US2] Test patient registration: Verify required fields validation works, duplicate check prevents duplicates, success message displays
- [ ] T042 [US2] Test form accordions: Verify optional sections collapse/expand, basic section expanded by default

**Checkpoint**: At this point, User Story 2 should be fully functional - staff can register new patients

---

## Phase 5: User Story 3 - View Patient Details (Priority: P1) 🎯 MVP

**Goal**: Staff views comprehensive patient information organized in tabs

**Independent Test**: Staff can navigate through patient demographics, history, habits, diagnoses, reports

- [X] T043 [P] [US3] create patient detail page layout in frontend/src/app/patients/[id]/page.tsx with Tabs component
- [X] T044 [P] [US3] Create OverviewTab component in frontend/src/components/patients/tabs/overview-tab.tsx (basic info + vitals + diagnoses)
- [X] T045 [P] [US3] Create HistoryTab component in frontend/src/components/patients/tabs/history-tab.tsx (medical history, comorbidities, family history)
- [X] T046 [P] [US3] Create HabitsTab component in frontend/src/components/patients/tabs/habits-tab.tsx (smoking, tobacco, alcohol)
- [X] T047 [P] [US3] Create DiagnosesTab component in frontend/src/components/patients/tabs/diagnoses-tab.tsx (list diagnoses, "New Diagnosis" button)
- [X] T048 [P] [US3] Create ReportsTab component in frontend/src/components/patients/tabs/reports-tab.tsx (reports grouped by type with count badges)
- [X] T049 [US3] Create PatientInfoCard component in frontend/src/components/patients/patient-info-card.tsx for Overview tab
- [X] T050 [US3] Create VitalsCard component in frontend/src/components/patients/vitals-card.tsx showing latest vitals
- [X] T051 [US3] Add tab navigation with TabsList and TabsTrigger components (Overview, History, Habits, Diagnoses, Reports)
- [X] T052 [US3] Add report count badges to Reports tab: "Pathology (2), Imaging (2), Lab (1)"
- [ ] T053 [US3] Test patient detail tabs: Verify all tabs load correctly, tab switching works, data displays properly
- [ ] T054 [US3] Test report grouping: Verify reports grouped by type with count badges

**Checkpoint**: At this point, User Story 3 should be fully functional - staff can view patient details

---

## Phase 6: User Story 4 - Upload Patient Reports (Priority: P1) 🎯 MVP

**Goal**: Staff can capture/upload report images using camera or file picker

**Independent Test**: Staff can upload images via camera or file picker, assign to report type, and view them later

- [X] T055 [P] [US4] Create use-camera hook in frontend/src/hooks/use-camera.ts (startCamera, stopCamera, capturePhoto, error handling)
- [X] T056 [P] [US4] Create CameraCapture component in frontend/src/components/reports/camera-capture.tsx with video preview and capture button
- [X] T057 [P] [US4] Create ImagePreview component in frontend/src/components/reports/image-preview.tsx with retake option
- [X] T058 [P] [US4] Create ReportUploadForm component in frontend/src/components/reports/report-upload-form.tsx with type selector, title, notes fields
- [X] T059 [US4] Create report upload page in frontend/src/app/patients/[id]/reports/new/page.tsx with camera capture and form
- [X] T060 [US4] Implement file picker fallback: <input type="file" capture="environment" accept="image/*"> when camera unavailable
- [X] T061 [US4] Add image preview before upload with Object URL for instant display
- [X] T062 [US4] Implement FormData upload to /api/patients/:id/reports endpoint with multipart/form-data
- [X] T063 [US4] Add file size validation (5MB max) with error message
- [X] T064 [US4] Add file type validation (jpg, png only) with error message
- [ ] T065 [US4] Test camera capture: Verify camera opens on supported devices, preview displays, upload completes
- [ ] T066 [US4] Test file fallback: Verify file picker works when camera unavailable
- [ ] T067 [US4] Test report upload: Verify uploaded report appears in Reports tab under correct type

**Checkpoint**: At this point, User Story 4 should be fully functional - staff can upload reports
**MVP COMPLETE**: All P1 stories (US1-US4) are now complete. System is ready for initial demo.

---

## Phase 7: User Story 5 - Create Cancer Diagnosis (Priority: P2)

**Goal**: Staff creates cancer diagnosis using guided multi-step wizard

**Independent Test**: Staff can create a diagnosis with basic info first, then add pathology, biomarker, and imaging details

- [X] T068 [P] [US5] Create DiagnosisWizard component in frontend/src/components/diagnosis/diagnosis-wizard.tsx with step navigation
- [X] T069 [P] [US5] Create WizardProgress component in frontend/src/components/diagnosis/wizard-progress.tsx (stepper UI showing 5 steps)
- [X] T070 [P] [US5] Create BasicStep component in frontend/src/components/diagnosis/steps/basic-step.tsx (cancer type, stage, grade, WHO, date)
- [X] T071 [P] [US5] Create PathologyStep component in frontend/src/components/diagnosis/steps/pathology-step.tsx with collapsible accordions
- [X] T072 [P] [US5] Create BiomarkerStep component in frontend/src/components/diagnosis/steps/biomarker-step.tsx (ER, PR, HER2, Ki-67, IHC markers)
- [X] T073 [P] [US5] Create ImagingStep component in frontend/src/components/diagnosis/steps/imaging-step.tsx (study type, date, findings, indication)
- [X] T074 [P] [US5] Create TreatmentStep component in frontend/src/components/diagnosis/steps/treatment-step.tsx (plan type, surgery, chemo options)
- [X] T075 [US5] Create diagnosis wizard page in frontend/src/app/patients/[id]/diagnoses/new/page.tsx
- [X] T076 [US5] Implement wizard state management: Track current step, completed steps, form data across steps
- [X] T077 [US5] Add accordion components for optional fields in Pathology and Biomarker steps (collapsed by default)
- [X] T078 [US5] Add Next/Previous/Finish navigation with validation before proceeding
- [X] T079 [US5] Add success confirmation after diagnosis completion with redirect to Diagnoses tab
- [ ] T080 [US5] Test diagnosis wizard: Verify all 5 steps display correctly, data persists between steps, validation works
- [ ] T081 [US5] Test accordions: Verify optional sections collapse/expand, collapsed by default

**Checkpoint**: At this point, User Story 5 should be fully functional - staff can create diagnoses

---

## Phase 8: User Story 6 - Edit Patient Information (Priority: P2)

**Goal**: Staff can update existing patient information

**Independent Test**: Staff can edit any field in patient record and changes persist after save

- [X] T082 [P] [US6] Create EditPatientForm component in frontend/src/components/patients/edit-patient-form.tsx (reuse NewPatientForm with pre-filled values)
- [X] T083 [US6] Add Edit button to Overview tab that opens edit form with current values pre-filled
- [X] T084 [US6] Implement form pre-population from patient data using React Hook Form defaultValues
- [X] T085 [US6] Add Cancel button that discards changes and returns to view mode
- [X] T086 [US6] Add validation for required fields on edit (show error if required field cleared)
- [X] T087 [US6] Update useUpdatePatient hook to handle patient updates via API
- [X] T088 [US6] Add success toast after patient update with refreshed data display
- [ ] T089 [US6] Test patient edit: Verify form pre-fills with current data, changes persist after save, cancel discards changes

**Checkpoint**: At this point, User Story 6 should be fully functional - staff can edit patients

---

## Phase 9: User Story 7 - Update Patient Vitals (Priority: P2)

**Goal**: Staff can record new vital signs measurements

**Independent Test**: Staff can add new vitals record and see history of all previous measurements

- [X] T090 [P] [US7] Create VitalsForm component in frontend/src/components/patients/vitals-form.tsx (height, weight, blood pressure, blood group)
- [X] T091 [P] [US7] Create VitalsHistory component in frontend/src/components/patients/vitals-history.tsx (list in reverse chronological order)
- [X] T092 [US7] Create use-vitals hook in frontend/src/hooks/use-vitals.ts (useVitalsList, useCreateVitals)
- [X] T093 [US7] Add "Add Vitals" button to Overview tab that opens vitals form
- [X] T094 [US7] Implement vitals form with number inputs for height (cm), weight (kg), blood pressure (systolic/diastolic)
- [X] T095 [US7] Add blood group Select dropdown (A+, A-, B+, B-, AB+, AB-, O+, O-)
- [X] T096 [US7] Add validation: positive numbers only for height and weight
- [X] T097 [US7] Display vitals history with timestamps showing latest first
- [ ] T098 [US7] Test vitals recording: Verify form validates inputs, new vitals save with timestamp, history displays in reverse order

**Checkpoint**: At this point, User Story 7 should be fully functional - staff can record vitals

---

## Phase 10: User Story 8 - Record Patient History (Priority: P2)

**Goal**: Staff documents medical history, comorbidities, and family cancer history

**Independent Test**: Staff can add/edit comorbidities and family history on History tab

- [X] T099 [P] [US8] Create HistoryForm component in frontend/src/components/patients/history-form.tsx (presenting complaint, comorbidities, family history)
- [X] T100 [P] [US8] Create ComorbiditiesList component in frontend/src/components/patients/comorbidities-list.tsx with add/edit
- [X] T101 [P] [US8] Create FamilyHistoryList component in frontend/src/components/patients/family-history-list.tsx with add/edit
- [X] T102 [US8] Update History tab with editable sections for comorbidities and family history
- [X] T103 [US8] Add "Add Comorbidity" button with form fields: condition name, diagnosis date, status (Active/Resolved)
- [X] T104 [US8] Add "Add Family History" button with form fields: relationship, cancer type, notes
- [X] T105 [US8] Implement save functionality for history updates via API
- [ ] T106 [US8] Test history recording: Verify comorbidities save and display, family history saves and displays

**Checkpoint**: At this point, User Story 8 should be fully functional - staff can record history

---

## Phase 11: User Story 9 - Record Patient Habits (Priority: P2)

**Goal**: Staff records smoking, tobacco, and alcohol consumption patterns

**Independent Test**: Staff can record habits with quantities and duration

- [X] T107 [P] [US9] Create HabitsForm component in frontend/src/components/patients/habits-form.tsx with sections for smoking, tobacco, alcohol
- [X] T108 [US9] Update Habits tab with editable form sections (Smoking, Tobacco/pan/gutka/naswar, Alcohol)
- [X] T109 [US9] Add smoking status dropdown (Never/Former/Current) with conditional quantity fields
- [X] T110 [US9] Add tobacco use sections (pan, gutka, naswar) with status and quantity fields
- [X] T111 [US9] Add alcohol use section with status (Never/Former/Current) and quantity fields
- [X] T112 [US9] Add "Other habits" and "Quit period" text fields for additional information
- [X] T113 [US9] Implement save functionality for habits updates via API
- [X] T114 [US9] Display formatted habits summary: "Current smoker - 10 cigarettes/day for 15 years" or "Non-smoker"
- [ ] T115 [US9] Test habits recording: Verify status changes display correctly, quantities save, summary formats properly

**Checkpoint**: At this point, User Story 9 should be fully functional - staff can record habits

---

## Phase 12: User Story 10 - View/Edit Diagnosis Details (Priority: P2)

**Goal**: Staff views full diagnosis details and can edit incomplete information

**Independent Test**: Staff can view all diagnosis fields and update them with new information

- [X] T116 [P] [US10] Create DiagnosisDetail component in frontend/src/components/diagnosis/diagnosis-detail.tsx (read-only view)
- [X] T117 [P] [US10] Create DiagnosisCard component in frontend/src/components/diagnosis/diagnosis-card.tsx for Diagnoses tab list
- [X] T118 [US10] Add click handler to DiagnosisCard that opens full diagnosis detail view
- [ ] T119 [US10] Add Edit button to diagnosis detail that reopens wizard at current step
- [ ] T120 [US10] Implement wizard state persistence: Load existing diagnosis data when editing
- [ ] T121 [US10] Update diagnosis wizard to handle both create and edit modes
- [X] T122 [US10] Add diagnosis summary to card: Basic + Pathology + Biomarkers + Imaging + Treatment Plan status
- [ ] T123 [US10] Test diagnosis view/edit: Verify detail view shows all fields, edit loads existing data, updates persist

**Checkpoint**: At this point, User Story 10 should be fully functional - staff can view/edit diagnoses

---

## Phase 13: User Story 12 - View and Delete Reports (Priority: P2)

**Goal**: Staff views uploaded reports and can remove incorrect uploads

**Independent Test**: Staff can view report images in lightbox and delete with confirmation

- [X] T124 [P] [US12] Create ImageGallery component in frontend/src/components/reports/image-gallery.tsx with thumbnails
- [X] T125 [P] [US12] Create ImageLightbox component in frontend/src/components/reports/image-lightbox.tsx for full-size view with zoom
- [X] T126 [US12] Add ReportCard component to Reports tab with thumbnail, title, type, date
- [X] T127 [US12] Add click handler to ReportCard that opens ImageLightbox with full-size image
- [X] T128 [US12] Add Delete button to ReportCard with AlertDialog confirmation ("Are you sure? This cannot be undone.")
- [X] T129 [US12] Implement delete functionality via useDeleteReport hook
- [X] T130 [US12] Update report count badges after deletion (Pathology (3) → (2))
- [ ] T131 [US12] Test report viewing: Verify thumbnails display, lightbox opens with full-size image, zoom works
- [ ] T132 [US12] Test report deletion: Verify confirmation dialog shows, deletion removes report, count badges update

**Checkpoint**: At this point, User Story 12 should be fully functional - staff can view/delete reports

---

## Phase 14: User Story 11 - Delete Diagnosis (Priority: P3)

**Goal**: Staff removes incorrectly entered diagnosis with confirmation

**Independent Test**: Staff can delete diagnosis with confirmation dialog preventing accidental deletion

- [X] T133 [US11] Add Delete button to DiagnosisCard component with AlertDialog trigger
- [X] T134 [US11] Create confirmation dialog: "Are you sure? This cannot be undone." with Cancel/Confirm buttons
- [X] T135 [US11] Implement delete functionality via API call to DELETE /diagnoses/:id
- [X] T136 [US11] Show success toast after deletion and remove from Diagnoses tab list
- [X] T137 [US11] Display "No diagnoses recorded" empty state when last diagnosis deleted
- [ ] T138 [US11] Test diagnosis deletion: Verify confirmation shows, deletion works, empty state displays

**Checkpoint**: At this point, User Story 11 should be fully functional - staff can delete diagnoses

---

## Phase 15: User Story 13 - Advanced Patient Search (Priority: P3)

**Goal**: Staff searches patients using multiple filters for specific cohorts

**Independent Test**: Staff can apply multiple search filters and see matching results

- [ ] T139 [P] [US13] Create AdvancedFilters component in frontend/src/components/patients/advanced-filters.tsx with collapsible panel
- [ ] T140 [US13] Add filter fields: diagnosis type dropdown, stage dropdown, date range picker, age range inputs
- [ ] T141 [US13] Add "Advanced Filters" toggle button to patient list page that expands filter panel
- [ ] T142 [US13] Implement filter state management with use-patients hook filter parameters
- [ ] T143 [US13] Add Clear Filters button that resets all filters to default
- [ ] T144 [US13] Update patient list query to include filter parameters
- [ ] T145 [US13] Test advanced search: Verify filters apply correctly, multiple filters work together, clear resets filters

**Checkpoint**: At this point, User Story 13 should be fully functional - staff can use advanced filters

---

## Phase 16: User Story 14 - Export Patient Data (Priority: P3)

**Goal**: Staff exports patient data to CSV for backup or analysis

**Independent Test**: Staff can export patient list with basic information to CSV file

- [ ] T146 [P] [US14] Create ExportButton component in frontend/src/components/patients/export-button.tsx
- [ ] T147 [US14] Add CSV export utility function in frontend/src/lib/utils.ts that converts patient data to CSV format
- [ ] T148 [US14] Add "Export" button to patient list page that triggers CSV download
- [ ] T149 [US14] Implement CSV columns: name, age, sex, phone, registration date, diagnosis
- [ ] T150 [US14] Include current filters in export (only export filtered results)
- [ ] T151 [US14] Add large export warning: "Exporting 5000 records may take a moment..." for >1000 records
- [ ] T152 [US14] Test data export: Verify CSV downloads with correct data, filtered exports work, warning shows for large datasets

**Checkpoint**: At this point, User Story 14 should be fully functional - staff can export data

---

## Phase 17: User Story 15 - System Settings (Priority: P3)

**Goal**: Admin configures basic system settings

**Independent Test**: Admin can access settings page and modify configuration

- [ ] T153 [P] [US15] Create Settings page in frontend/src/app/settings/page.tsx with tabs for General, Data, Appearance
- [ ] T154 [P] [US15] Create GeneralSettings component in frontend/src/components/settings/general-settings.tsx (items per page, default values)
- [ ] T155 [P] [US15] Create DataSettings component in frontend/src/components/settings/data-settings.tsx (backup functionality)
- [ ] T156 [P] [US15] Create AppearanceSettings component in frontend/src/components/settings/appearance-settings.tsx (theme options)
- [ ] T157 [US15] Add Settings link to Sidebar navigation menu
- [ ] T158 [US15] Implement items per page setting: Save to localStorage, apply to patient list pagination
- [ ] T159 [US15] Implement default blood group setting: Pre-fill in new patient/vitals forms
- [ ] T160 [US15] Add "Backup Data" button that triggers backend backup download
- [ ] T161 [US15] Test settings page: Verify settings save and persist, default values pre-fill in forms

**Checkpoint**: At this point, User Story 15 should be fully functional - admin can configure settings

---

## Phase 18: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T162 [P] Add loading states to all forms and data fetching operations (use LoadingSpinner)
- [ ] T163 [P] Add error boundaries to all pages and major components (use ErrorBoundary)
- [ ] T164 [P] Implement keyboard navigation: Enter to submit forms, Escape to close modals
- [ ] T165 [P] Add ARIA labels to all icon-only buttons for screen reader accessibility
- [ ] T166 [P] Add focus management to modals and wizards (trap focus, return to trigger)
- [ ] T167 Add responsive design breakpoints for tablet (768px) and mobile (375px)
- [ ] T168 Test camera capture on different devices: laptop webcam, tablet, mobile phone browsers
- [ ] T169 Run manual testing checklist from spec.md for all user stories
- [ ] T170 Verify color contrast ratios meet WCAG 2.1 AA standards
- [ ] T171 Test offline indicator displays correctly (green dot + "Offline Mode")
- [ ] T172 Verify all critical functions accessible within 2 clicks from home screen
- [ ] T173 Performance test: Patient list loads first 50 records in <500ms
- [ ] T174 Performance test: Form submission feedback within 500ms
- [ ] T175 Performance test: Image upload preview appears within 2 seconds
- [ ] T176 Run production build: npm run build and verify no errors
- [ ] T177 Test start-app.bat workflow: frontend starts on localhost:3000, backend on localhost:4000

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-17)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 18)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Extends US1 (new patient appears in search)
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Depends on US2 (needs existing patient to view)
- **User Story 4 (P1)**: Can start after Foundational (Phase 2) - Depends on US3 (Reports tab in patient detail)
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Depends on US3 (Diagnoses tab in patient detail)
- **User Story 6 (P2)**: Can start after US3 (needs patient detail page)
- **User Story 7 (P2)**: Can start after US3 (needs Overview tab)
- **User Story 8 (P2)**: Can start after US3 (needs History tab)
- **User Story 9 (P2)**: Can start after US3 (needs Habits tab)
- **User Story 10 (P2)**: Can start after US5 (needs diagnosis creation)
- **User Story 11 (P3)**: Can start after US5 (needs diagnosis to delete)
- **User Story 12 (P2)**: Can start after US4 (needs report upload)
- **User Story 13 (P3)**: Can start after US1 (extends patient list)
- **User Story 14 (P3)**: Can start after US1 (extends patient list)
- **User Story 15 (P3)**: Can start after Foundational (independent settings page)

### Within Each User Story

- Models/hooks before components
- Components before pages
- Core implementation before integration
- Tests (if included) verify functionality
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (Phase 1) marked [P] can run in parallel
- All Foundational tasks (Phase 2) marked [P] can run in parallel within Phase 2
- Once Foundational phase completes, P1 user stories (US1-US4) can be worked on in parallel
- P2 user stories can start after US3 completes (most depend on patient detail page)
- P3 user stories are largely independent and can run in parallel
- All component tasks marked [P] within a story can run in parallel

---

## Parallel Example: User Story 1 (Find Existing Patient)

```bash
# Launch all components for User Story 1 together:
Task: "Create SearchBar component in frontend/src/components/patients/search-bar.tsx"
Task: "Create PatientCard component in frontend/src/components/patients/patient-card.tsx"
Task: "Create PatientTable component in frontend/src/components/patients/patient-table.tsx"
Task: "Create ViewToggle component in frontend/src/components/patients/view-toggle.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1-4 Only)

1. Complete Phase 1: Setup (T001-T009)
2. Complete Phase 2: Foundational (T010-T022) - CRITICAL
3. Complete Phase 3: User Story 1 (T023-T032) - Patient search
4. Complete Phase 4: User Story 2 (T033-T042) - New patient
5. Complete Phase 5: User Story 3 (T043-T054) - Patient details
6. Complete Phase 6: User Story 4 (T055-T067) - Report upload
7. **STOP and VALIDATE**: Test all P1 stories independently
8. Deploy/demo MVP

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (Search) → Test → Deploy/Demo
3. Add US2 (Register) → Test → Deploy/Demo
4. Add US3 (View Details) → Test → Deploy/Demo (MVP Complete!)
5. Add US4 (Reports) → Test → Deploy/Demo
6. Add US5 (Diagnosis) → Test → Deploy/Demo
7. Add US6-US10 (P2 features) → Test → Deploy/Demo
8. Add US11, US13-US15 (P3 features) → Test → Deploy/Demo
9. Polish (Phase 18) → Final deployment

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (Search) + US2 (Register)
   - Developer B: US3 (View Details) + US7 (Vitals) + US8 (History)
   - Developer C: US4 (Reports) + US12 (View/Delete Reports)
3. After P1 stories complete:
   - Developer A: US5 (Diagnosis) + US10 (Edit Diagnosis)
   - Developer B: US6 (Edit Patient) + US9 (Habits)
   - Developer C: US11 (Delete Diagnosis) + US13 (Advanced Search)
4. Final phase: All developers work on Polish tasks

---

## Summary

- **Total Tasks**: 177
- **Tasks per User Story**:
  - US1: 10 tasks (Find Existing Patient)
  - US2: 10 tasks (Register New Patient)
  - US3: 12 tasks (View Patient Details)
  - US4: 13 tasks (Upload Patient Reports)
  - US5: 14 tasks (Create Cancer Diagnosis)
  - US6: 8 tasks (Edit Patient Information)
  - US7: 9 tasks (Update Patient Vitals)
  - US8: 8 tasks (Record Patient History)
  - US9: 9 tasks (Record Patient Habits)
  - US10: 8 tasks (View/Edit Diagnosis Details)
  - US11: 6 tasks (Delete Diagnosis)
  - US12: 9 tasks (View and Delete Reports)
  - US13: 7 tasks (Advanced Patient Search)
  - US14: 7 tasks (Export Patient Data)
  - US15: 9 tasks (System Settings)
- **Parallel Opportunities**: 65+ tasks marked [P]
- **MVP Scope**: Phases 1-6 (Tasks T001-T067) = 67 tasks for P1 stories
- **Independent Test Criteria**: Each user story phase includes verification tasks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- MVP = US1-US4 (Phases 1-6), P1 features only
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
