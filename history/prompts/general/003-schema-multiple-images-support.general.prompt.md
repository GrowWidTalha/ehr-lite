---
id: 003
title: Schema Update - Multiple Images Per Record
stage: general
date: 2026-02-24
surface: agent
model: claude-opus-4-6
feature: none
branch: master
user: groww
command: Schema update request
labels: ["database","schema","images","multiple"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/database-schema.md
  - .specify/memory/image-attachments-guide.md
  - .specify/memory/schema-structure-summary.md
tests:
  - None (schema design only)
---

## Prompt

Update the schema for all off these and one more important thing these can be multiple eg. one patient can bring multiple ct scans or mri reports so we should have option to upload multiple version of the saem report. After doing so update me on the current schema structure.

## Response snapshot

Updated database schema to v1.1.0 with universal multi-image support.

Key changes:
1. Created new `report_images` table (13th table) for universal image storage
2. Uses polymorphic pattern: entity_type + entity_id to link to ANY table
3. Supports unlimited images per record via sequence field
4. 8 tables now support multiple images: patient_vitals, patient_history, previous_treatments, pathology_reports, biomarker_tests, imaging_studies, treatment_sessions, reports
5. patient_vitals now supports multiple records (not 1:1) to track changes over time

report_images table structure:
- entity_type: Table name ('imaging_studies', 'pathology_reports', etc.)
- entity_id: UUID of the record
- image_path: File path
- sequence: Display order (1, 2, 3...)
- caption: Optional description

File naming convention: {entity_type}-{record_id}-{sequence}.jpg

## Outcome

- ✅ Impact: Complete schema with 13 tables supporting unlimited multi-image attachments
- 📁 Files: 3 files (database-schema.md updated, image-attachments-guide.md, schema-structure-summary.md)
- 🔁 Next prompts: Implement with Drizzle ORM, build API endpoints
- 🧠 Reflection: Polymorphic image table is flexible - avoids adding image_path to every table. Multiple vitals and multiple images per record are essential for real clinical workflow.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): None
- Next experiment: Test image query performance with large datasets
