---
id: 001
title: EHR Upgrade Implementation Plan
stage: plan
date: 2026-04-28
surface: agent
model: claude-opus-4-7
feature: 003-ehr-upgrade
branch: 003-ehr-upgrade
user: groww
command: /sp.plan specs/003-ehr-upgrade/spec.md
labels: ehr,schema-migration,database
links:
  spec: specs/003-ehr-upgrade/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/003-ehr-upgrade/plan.md
 - specs/003-ehr-upgrade/research.md
 - specs/003-ehr-upgrade/data-model.md
 - specs/003-ehr-upgrade/quickstart.md
 - specs/003-ehr-upgrade/contracts/patients.yaml
 - specs/003-ehr-upgrade/contracts/lookups.yaml
tests:
 - No tests run (planning phase)
---

## Prompt

specs/003-ehr-upgrade/spec.md

## Response snapshot

Generated complete implementation plan for EHR schema migration including:
- plan.md: Technical context, constitution check, project structure, migration strategy
- research.md: Schema migration approach, primary key decisions, API contract strategy
- data-model.md: Complete new schema with Patient entity (60+ fields), lookup tables, relationships
- contracts/: OpenAPI specs for patients and lookups endpoints
- quickstart.md: Step-by-step migration guide with verification checklist

Constitution check passed with no violations. Migration involves dropping 13 old tables (snake_case/UUID) and using existing new tables (PascalCase/integer). Key changes: PatientID (integer) replaces id (UUID), PatientName replaces full_name, new sub-resource endpoints (/labs, /imaging, /treatments, /pathology, /lifestyle), and single /api/lookups endpoint.

## Outcome

- ✅ Impact: Architecture plan completed, ready for task breakdown
- 🧪 Tests: No tests (planning phase)
- 📁 Files: 6 files created (plan, research, data-model, quickstart, 2 contracts)
- 🔁 Next prompts: Run `/sp.tasks` to generate implementation tasks
- 🧠 Reflection: Clean migration path - new tables already exist in DB, old tables unused

## Evaluation notes (flywheel)

- Failure modes observed: Setup script used wrong branch (002-excel-data-ops) instead of feature context, worked around by manual path handling
- Graders run and results (PASS/FAIL): No graders (planning phase)
- Prompt variant (if applicable): N/A
- Next experiment (smallest to try): Consider passing feature flag to setup script to avoid branch dependency
