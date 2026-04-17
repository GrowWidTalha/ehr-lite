---
id: "0002"
title: "excel-data-ops-implementation-plan"
stage: "plan"
date: "2026-03-02"
surface: "agent"
model: "claude-opus-4-6"
feature: "002-excel-data-ops"
branch: "002-excel-data-ops"
user: "groww"
command: "/sp.plan"
labels: ["excel-import", "excel-export", "automated-backup", "implementation-plan"]
links:
  spec: "/home/groww/development/ehr-lite/specs/002-excel-data-ops/spec.md"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
 - /home/groww/development/ehr-lite/specs/002-excel-data-ops/plan.md
 - /home/groww/development/ehr-lite/specs/002-excel-data-ops/research.md
 - /home/groww/development/ehr-lite/specs/002-excel-data-ops/data-model.md
 - /home/groww/development/ehr-lite/specs/002-excel-data-ops/contracts/api.yaml
 - /home/groww/development/ehr-lite/specs/002-excel-data-ops/quickstart.md
tests:
 - No tests created (planning phase)
---

## Prompt

User ran `/sp.plan a commplete userr interface and feature is not really needed for excel to db mmigration bbecause that is not gogin to be used often even a python or jjs script will work too.`

User clarification: Excel to DB import should be implemented as a simple script (Node.js) rather than a full UI feature since it will be used infrequently.

## Response snapshot

Created implementation plan for Excel Data Operations & Automated Backup feature with the following key decisions:

**Architecture Adjustments Based on User Feedback**:
- Excel Import: Simplified to standalone Node.js script instead of full UI feature
- Excel Export: Backend API + frontend button (UI required per spec)
- Automated Backup: Backend scheduler + frontend status display

**Technology Choices** (from research.md):
- Excel I/O: `xlsx` (SheetJS) - simple API, good performance
- Scheduling: `node-schedule` - in-process, Windows-friendly
- Compression: `archiver` - streaming support, directory handling

**Data Model** (from data-model.md):
- Import Log: JSON file tracking at `/data/logs/import-YYYY-MM-DD.json`
- Export Job: JSON file tracking at `/data/logs/export-YYYY-MM-DD.json`
- Backup: JSON index at `/data/backups/index.json` with per-backup metadata
- Excel Column Mapping: 82-column configuration in `backend/src/utils/excel.mapper.js`

**API Contracts** (from contracts/api.yaml):
- GET /api/export/patients - Export all patients to Excel
- GET /api/backup/status - Get current backup status
- POST /api/backup/create - Trigger manual backup
- GET /api/backup/list - List available backups

**Project Structure**:
- Backend: New routes (export.js, backup.js), services (export.service.js, backup.service.js), jobs (backup.job.js), utils (excel.mapper.js), scripts (import-excel.js)
- Frontend: New components (ExportButton.tsx, BackupStatus.tsx), hooks (use-backup.ts)

**Constitution Check**: All gates passed
- Local-First: No cloud dependencies, all operations local
- Single-Click Startup: Import via npm script, backup auto-starts with server
- Healthcare Data Protection: Validation on Excel import, file type checks
- Data Portability: All data at /data/backups/, exports in portable Excel format

## Outcome

- ✅ Impact: High - Enables data migration (script), data portability (export), and data safety (automated backups)
- 🧪 Tests: No tests created (planning phase) - test strategy defined in plan
- 📁 Files: plan.md (implementation architecture), research.md (technology decisions), data-model.md (entity definitions), contracts/api.yaml (API spec), quickstart.md (user guide)
- 🔁 Next prompts: /sp.tasks to generate implementation task list
- 🧠 Reflection: User feedback to simplify Excel import to a script significantly reduced implementation complexity. This keeps the UI focused on frequently-used features (export, backup status) while still enabling one-time migration via console.

## Evaluation notes (flywheel)

- Failure modes observed: None - planning completed successfully
- Graders run and results (PASS/FAIL): PASSED - All constitution gates validated, research completed, contracts defined
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Consider adding a simple web UI for import in future if user feedback indicates need, but script approach aligns with infrequent usage pattern
