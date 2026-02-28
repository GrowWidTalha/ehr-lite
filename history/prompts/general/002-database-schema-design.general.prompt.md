---
id: 002
title: Database Schema Design from Oncology Excel
stage: general
date: 2026-02-24
surface: agent
model: claude-opus-4-6
feature: none
branch: master
user: groww
command: General analysis
labels: ["database","schema","oncology","design"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/database-schema.md
tests:
  - None (schema design only)
---

## Prompt

Now read the Onco 2026.xlsx file and design the database schema

## Response snapshot

Analyzed "Onco 2026.xlsx" containing 103 columns of oncology patient registry data.

Designed normalized schema with 12 core tables:
1. **patients** - Core demographics (name, age, sex, phone, CNIC, etc.)
2. **patient_vitals** - Height, weight, blood group (updateable)
3. **patient_history** - Comorbidities, family history, presenting complaint
4. **patient_habits** - Smoking, pan, gutka, naswar, alcohol with quantities
5. **cancer_diagnoses** - Cancer type, stage, grade, WHO classification
6. **previous_treatments** - Prior chemo, RT, surgery, hormonal, immunotherapy
7. **pathology_reports** - Surgical pathology (tumor size, margins, lymph nodes, LVI, PNI)
8. **biomarker_tests** - ER, PR, HER2, Ki-67, IHC markers
9. **imaging_studies** - CT, MRI, PET, US, mammogram, bone scan, echo, BSC
10. **treatment_plans** - Planned surgery, chemo (neo/adj/induction), intent
11. **treatment_sessions** - Actual treatments delivered with details
12. **reports** - Document/image storage with file paths

Key design decisions:
- Patients can have multiple cancer diagnoses (new primaries, recurrences)
- Habits stored with status (Never/Former/Current) and quantity fields
- Biomarker tests support breast cancer markers (ER/PR/HER2/Ki-67)
- Treatment sessions track multiple modalities over time
- File storage: `/data/patient-images/{patient_uuid}/{report_uuid}.jpg`

Created views: vw_patient_summary, vw_diagnosis_detail for common queries

## Outcome

- ✅ Impact: Comprehensive oncology EHR schema supporting full patient journey
- 📁 Files: 1 file created (.specify/memory/database-schema.md)
- 🔁 Next prompts: Create feature specs, implement API endpoints
- 🧠 Reflection: Schema balances normalization (12 tables) with query efficiency (views, indexes). Handles 103 Excel columns in logical groups for better UX.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): None
- Next experiment: Validate schema against actual clinical workflow before implementation
