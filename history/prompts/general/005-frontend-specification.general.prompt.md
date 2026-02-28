---
id: 005
title: Frontend Specification Creation
stage: spec
date: 2026-02-25
surface: agent
model: claude-opus-4-6
feature: 1-ehr-frontend
branch: 1-ehr-frontend
user: groww
command: /sp.specify
labels: ["specification","frontend","shadcn-ui","ehr"]
links:
  spec: specs/1-ehr-frontend/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/1-ehr-frontend/spec.md
  - specs/1-ehr-frontend/checklists/requirements.md
tests:
  - None (specification only)
---

## Prompt

Ask me interactive questions and then when yyou have enough context write spec for the frontend. Make sure to use shadcn ui componenents whereevver needed

## Response snapshot

Gathered requirements through 5 rounds of interactive Q&A about the EHR Lite frontend:

**User Context Discovered:**
- Target users: Nurses/Staff (need simple, intuitive UI)
- Device: Desktop/Laptop
- Workflow: Search existing patients first to avoid duplicates
- UI Style: Simple & Functional
- Image Upload: Camera capture primary, file picker fallback
- Data Entry: Dropdown menus for common values
- Oncology Data (82+ fields): Logical grouping + Simplified views
- Patient Details: Tabs + Accordion sections
- Reports: Grouped by type (Pathology, Imaging, Lab)
- Diagnosis Entry: Multi-step wizard
- Search: Name, Multi-field, Advanced filters
- Quick Actions: Always visible buttons
- Oncology Capture: Progressive (basic first, detailed later)
- Patient List: Toggle card/table view
- Offline: Visible indicator required

**Specification Created:**
- 5 User Stories with priorities (P1 MVP + P2)
- 14 Functional Requirements
- 14 UI/UX Requirements
- 10 Key Entities
- 7 Page Structures with detailed component breakdowns
- shadcn/ui components specified for consistency
- 8 Success Criteria (measurable, technology-agnostic)
- 9 Edge Cases addressed

**Key Features Specified:**
1. Home/Patient List - Search, card/table toggle, quick actions
2. New Patient - Search-first, basic form with accordions
3. Patient Detail - Tabbed view (Overview, History, Habits, Diagnoses, Reports)
4. Diagnosis Wizard - 5-step progressive entry (Basic → Pathology → Biomarkers → Imaging → Treatment)
5. Report Upload - Camera capture with type grouping
6. Sidebar Navigation - Collapsible with offline indicator
7. Complete design system with colors, typography, spacing

## Outcome

- ✅ Impact: Complete frontend specification ready for implementation
- 📁 Files: 2 files created
- 🔁 Next prompts: Use `/sp.plan` to create implementation plan
- 🧠 Reflection: Multi-step wizard and progressive capture approach will make 82-field oncology data entry manageable. shadcn/ui ensures UI consistency.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Requirements checklist - ALL PASSED
- Prompt variant (if applicable): Interactive Q&A approach worked well to gather detailed requirements
- Next experiment: Consider patient photo feature for easy identification
