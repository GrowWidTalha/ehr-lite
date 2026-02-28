---
id: 015
title: Diagnosis Details Modal and Edit Page
stage: green
date: 2026-02-26
surface: agent
model: claude-opus-4-6
feature: 1-ehr-frontend
branch: 001-ehr-frontend
user: groww
command: Diagnosis edit implementation
labels: ["diagnosis", "modal", "edit", "wizard"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/routes/patients.js
  - frontend/lib/db.types.ts
  - frontend/lib/api.ts
  - frontend/hooks/use-diagnosis.ts
  - frontend/components/patients/tabs/diagnoses-tab.tsx
  - frontend/components/diagnosis/diagnosis-detail-dialog.tsx
  - frontend/app/patients/[id]/diagnoses/[diagnosisId]/edit/page.tsx
tests:
  - Manual testing: View diagnosis details in modal
  - Manual testing: Edit existing diagnosis via wizard
  - Manual testing: Save changes and verify data persists
---

## Prompt

implement the diagnosis details modal and edit page for diagnosis

## Response snapshot

Implemented diagnosis details modal and edit functionality:

1. **Backend Updates** (patients.js):
   - Modified GET /patients/:id/diagnoses to JOIN all related tables (pathology, biomarkers, imaging, treatment)
   - Added GET /patients/:id/diagnoses/:diagnosisId for fetching single diagnosis
   - Added PUT /patients/:id/diagnoses/:diagnosisId for updating diagnosis with all related records

2. **Frontend Types** (db.types.ts):
   - Extended CancerDiagnosis interface with pathology, biomarker, imaging, and treatment fields

3. **API Client** (api.ts):
   - Updated diagnosisApi.get(patientId, id) for single diagnosis fetch
   - Updated diagnosisApi.update(patientId, id, data) for updates

4. **Hooks** (use-diagnosis.ts):
   - Updated useDiagnosis to accept patientId parameter
   - Updated useUpdateDiagnosis to pass patientId to API

5. **Components**:
   - Created DiagnosisDetailDialog component for modal view
   - Updated DiagnosesTab to use modal instead of inline view
   - Created edit page at /[id]/diagnoses/[diagnosisId]/edit with wizard pre-filling existing data

## Outcome

- ✅ Impact: Users can now view diagnosis details in modal and edit existing diagnoses
- 🧪 Tests: Manual testing required - verify modal opens, edit page loads data, changes save correctly
- 📁 Files: 7 files created/modified (1 new component, 1 new page, 5 updates)
- 🔁 Next prompts: None - User Story 10 (View/Edit Diagnosis Details) is now complete
- 🧠 Reflection: The edit wizard reuses the same step components as create mode, just pre-fills data from existing diagnosis

## Evaluation notes (flywheel)

- Failure modes observed: None encountered during implementation
- Graders run and results (PASS/FAIL): Not run
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test the edit flow with actual diagnosis data to ensure all fields load and save correctly
