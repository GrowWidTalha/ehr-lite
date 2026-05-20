---
id: 002
title: EHR Upgrade Task Generation
stage: tasks
date: 2026-04-28
surface: agent
model: claude-opus-4-7
feature: 003-ehr-upgrade
branch: 003-excel-data-ops
user: groww
command: /sp.tasks
labels: ehr,schema-migration,tasks
links:
  spec: specs/003-ehr-upgrade/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/003-ehr-upgrade/tasks.md
tests:
 - Manual verification per quickstart.md
---

## Prompt

## Response snapshot

Generated tasks.md with 60 tasks organized into 8 phases:

**Phase 1: Setup** (3 tasks) - Environment verification and database backup

**Phase 2: Foundational** (5 tasks) - Database schema migration - DROPS old tables, keeps new tables, updates init.js

**Phase 3: User Story 1 - Backend CRUD** (14 tasks) - Rewrite patients.js with all CRUD endpoints, add 5 sub-resource endpoints (/labs, /imaging, /treatments, /pathology, /lifestyle), create lookups route, update dashboard

**Phase 4: User Story 2 - Backend Services** (3 tasks) - Update export/import services and Excel mapper

**Phase 5: User Story 3 - Frontend Types & API** (18 tasks) - Rewrite Patient interface (60+ fields), add LookupItem/LookupsResponse, update all API calls

**Phase 6: User Story 4 - Frontend Hooks** (6 tasks) - Update all hooks, create use-lookups hook

**Phase 7: User Story 5 - Frontend Components** (5 tasks) - Update component field references, add lookup dropdowns

**Phase 8: Polish** (6 tasks) - Verification and testing

Tasks follow checklist format with [P] markers for parallelizable work and [US#] labels for user story mapping.

## Outcome

- ✅ Impact: 60 actionable tasks generated, organized by user story for independent implementation
- 🧪 Tests: Manual verification (not TDD)
- 📁 Files: 1 file created (tasks.md with 60 tasks across 8 phases)
- 🔁 Next prompts: Run `/sp.implement` to execute tasks or implement manually per phase
- 🧠 Reflection: Clear dependency chain - Foundational blocks all, Backend CRUD enables Frontend work

## Evaluation notes (flywheel)

- Failure modes observed: Setup script detected wrong feature branch (002 vs 003) - worked around by manual path handling
- Graders run and results (PASS/FAIL): Format validated - all tasks follow checklist format
- Prompt variant (if applicable): N/A
- Next experiment (smallest to try): Add feature flag parameter to setup script to avoid branch dependency
