---
id: 016
title: Patient Onboarding Wizard
stage: green
date: 2026-02-26
surface: agent
model: claude-opus-4-6
feature: 1-ehr-frontend
branch: 001-ehr-frontend
user: groww
command: Create patient onboarding wizard
labels: ["onboarding", "wizard", "patient", "complete-flow"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/app/onboarding/new/page.tsx
  - frontend/components/onboarding/steps/basic-info-step.tsx
  - frontend/components/onboarding/steps/history-step.tsx
  - frontend/components/onboarding/steps/habits-step.tsx
  - frontend/components/onboarding/steps/vitals-step.tsx
  - frontend/components/onboarding/steps/diagnosis-summary-step.tsx
  - frontend/components/onboarding/steps/reports-step.tsx
  - frontend/app/page.tsx
tests:
  - Manual testing: Complete onboarding flow with all steps
  - Manual testing: Verify data persists correctly in patient profile
---

## Prompt

Create a step by step add new patient wizard that starts from creating new patient then adds every detail in one flow. like habits, info, reports, historyy, diagnosis, in an ordered way. as we have in the excel sheet

## Response snapshot

Implemented a comprehensive 6-step patient onboarding wizard:

1. **Main Wizard Page** (`/onboarding/new`):
   - 6 steps: Basic Info → Medical History → Habits → Vitals → Diagnosis → Reports
   - Progress indicator and step navigation
   - Patient created on first step, other details saved on completion
   - Success screen with options to view patient or add another

2. **Step Components**:
   - BasicInfoStep: Full demographics (name required, rest optional)
   - HistoryStep: Presenting complaint, comorbidities, family history
   - HabitsStep: Smoking, pan, gutka, naswar, alcohol with quantities
   - VitalsStep: Height, weight, BP, blood group with BMI auto-calculation
   - DiagnosisSummaryStep: Simplified cancer diagnosis (cancer type, stage, grade, date)
   - ReportsStep: Add multiple reports with image uploads

3. **Home Page Updates**:
   - Added "Complete Onboarding" button (primary action)
   - Changed "New Patient" to "Quick Add Patient" (secondary)
   - Updated sidebar navigation

## Outcome

- ✅ Impact: Users can now add patients in one complete flow matching the Excel sheet structure
- 🧪 Tests: Manual testing required - complete full onboarding, verify all data saves correctly
- 📁 Files: 8 files created/updated (1 page, 6 step components, 1 home page update)
- 🔁 Next prompts: None - onboarding wizard is complete
- 🧠 Reflection: The wizard saves data incrementally (patient first) to ensure we have a patientId for subsequent saves

## Evaluation notes (flywheel)

- Failure modes observed: Had to fix hook imports (useUpdateHistory vs useCreateHistory, useUpdateHabits vs useHabitsApi)
- Graders run and results (PASS/FAIL): Not run
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add ability to save and continue later (resume incomplete onboarding)
