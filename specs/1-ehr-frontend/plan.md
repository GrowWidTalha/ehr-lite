# Implementation Plan: Frontend

**Branch**: `1-ehr-frontend` | **Date**: 2026-02-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/1-ehr-frontend/spec.md`

## Summary

Build a Next.js 14 frontend for EHR Lite oncology system using shadcn/ui components. The frontend provides a local-first, camera-first interface for clinic staff to manage patients, capture oncology data via progressive wizard, and upload multiple report images. All data persists via local backend API at `localhost:4000` with SQLite storage.

## Technical Context

**Language/Version**: TypeScript 5.3+, JavaScript ES2022+
**Primary Dependencies**:
- Next.js 14.2+ (App Router)
- React 18.3+
- shadcn/ui (Radix UI primitives + Tailwind CSS)
- React Hook Form 7.x
- Zod 3.x (schema validation)
- Axios or native fetch (API client)

**Storage**: No direct storage - communicates with backend API (SQLite via Express)
**Testing**: Vitest or Jest, React Testing Library for component tests
**Target Platform**: Modern browsers (Chrome, Edge, Firefox) on desktop/laptop, responsive for tablets
**Project Type**: Web application (backend + frontend)
**Performance Goals**:
- Patient list renders first 50 records in <500ms
- Form submission feedback within 500ms
- Image upload preview appears within 2 seconds
- Camera capture to upload <10 seconds

**Constraints**:
- Local-first architecture (no external APIs)
- Camera capture must work on laptop webcams and mobile browsers
- File size limit: 5MB per image
- Offline-capable (localhost only)

**Scale/Scope**:
- ~10,000 patients in database
- 7 main pages (Home, New Patient, Patient Detail, 5 diagnosis wizard steps)
- 40+ form fields for oncology data (progressive capture)
- 13 database entities with images

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Local-First**: No cloud dependencies? All data local?
  - Frontend communicates only with local backend at `localhost:4000`
  - All patient data stored in SQLite at `/data/database.db`
  - Images stored at `/data/patient-images/`
- [x] **Single-Click Startup**: Can be started via `.bat` file?
  - Next.js dev server script will be included in `start-app.bat`
  - Frontend starts on `http://localhost:3000`
- [x] **Healthcare Data Protection**: Input validation on all endpoints? File validation?
  - Zod schemas validate all form inputs before submission
  - File type validation (jpg/png/pdf only)
  - File size limit enforced (5MB)
- [x] **Data Portability**: All data in `/data/` folder? Easy backup?
  - Frontend has no data - all in backend `/data/` folder
  - Backup by copying `/data/` folder
- [x] **Camera-First**: Camera capture prioritized? File fallback included?
  - `navigator.mediaDevices.getUserMedia` for camera access
  - File picker fallback via `<input type="file">`
  - Primary action: "Capture" button
- [x] **Fail-Safe Errors**: Clear error messages? Structured error responses?
  - API returns `{ success, data, error }` structure
  - User-friendly error messages (no stack traces)
  - Inline form validation errors

## Project Structure

### Documentation (this feature)

```text
specs/1-ehr-frontend/
├── plan.md              # This file
├── research.md          # Technology decisions
├── data-model.md        # Frontend data types
├── quickstart.md        # Development setup
├── contracts/           # API contracts
│   ├── patients.yaml    # Patient API
│   ├── reports.yaml     # Reports API
│   └── images.yaml      # Images API
└── tasks.md             # Implementation tasks (Phase 2)
```

### Source Code (repository root)

```text
# Option 2: Web application
backend/                        # EXISTING
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/                       # TO BE CREATED
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout with sidebar
│   │   ├── page.tsx           # Home/Patient list
│   │   ├── patients/
│   │   │   ├── page.tsx       # Patient list (alternative)
│   │   │   ├── new/page.tsx   # New patient form
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # Patient detail tabs
│   │   │       ├── diagnoses/
│   │   │       │   ├── new/page.tsx  # Diagnosis wizard
│   │   │       │   └── [diagnosisId]/page.tsx
│   │   │       └── reports/
│   │   │           ├── new/page.tsx  # Report upload
│   │   │           └── [reportId]/page.tsx
│   │   ├── api/               # API route handlers (if needed)
│   │   └── globals.css        # Tailwind + shadcn/ui styles
│   ├── components/
│   │   ├── ui/                # shadcn/ui base components
│   │   ├── layout/
│   │   │   ├── sidebar.tsx    # Sidebar navigation
│   │   │   ├── header.tsx     # Page header
│   │   │   └── offline-indicator.tsx
│   │   ├── patients/
│   │   │   ├── patient-card.tsx
│   │   │   ├── patient-table.tsx
│   │   │   ├── search-bar.tsx
│   │   │   └── new-patient-form.tsx
│   │   ├── diagnosis/
│   │   │   ├── diagnosis-wizard.tsx
│   │   │   ├── basic-step.tsx
│   │   │   ├── pathology-step.tsx
│   │   │   ├── biomarker-step.tsx
│   │   │   ├── imaging-step.tsx
│   │   │   └── treatment-step.tsx
│   │   ├── reports/
│   │   │   ├── camera-capture.tsx
│   │   │   ├── report-upload.tsx
│   │   │   └── image-gallery.tsx
│   │   └── shared/
│   │       ├── loading-spinner.tsx
│   │       ├── error-boundary.tsx
│   │       └── confirmation-dialog.tsx
│   ├── lib/
│   │   ├── api.ts             # API client (fetch wrapper)
│   │   ├── db.types.ts        # TypeScript types from DB schema
│   │   ├── validations.ts     # Zod schemas
│   │   └── utils.ts           # Helper functions
│   └── hooks/
│       ├── use-patients.ts    # Patient data hooks
│       ├── use-diagnosis.ts   # Diagnosis data hooks
│       └── use-camera.ts      # Camera capture hook
├── public/
├── tests/
│   ├── integration/
│   └── contract/
├── components.json            # shadcn/ui config
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── package.json
```

**Structure Decision**: Web application with separate frontend/ and backend/ directories. Frontend uses Next.js 14 App Router for optimal performance and shadcn/ui for component consistency. API communication via HTTP fetch wrapper to local backend.

## Complexity Tracking

> **No constitution violations** - All principles satisfied. This section left empty.

## Phase 0: Research & Decisions

See [research.md](./research.md) for:
- Next.js vs React comparison (chose Next.js for routing/optimization)
- shadcn/ui vs other component libraries (chose shadcn/ui for customization)
- Form state management (chose React Hook Form + Zod)
- Image capture approach (chose native getUserMedia API)

## Phase 1: Design Artifacts

### Data Model
See [data-model.md](./data-model.md) for:
- Frontend TypeScript types matching database schema
- Form validation schemas (Zod)
- Component prop types

### API Contracts
See [contracts/](./contracts/) directory for:
- OpenAPI specifications for all backend endpoints
- Request/response formats
- Error handling contracts

### Quickstart Guide
See [quickstart.md](./quickstart.md) for:
- Development environment setup
- Running frontend locally
- Adding new shadcn/ui components
- Testing procedures

## Implementation Phases

### Phase 2: Core Pages (MVP)
- [ ] Home page with patient list (card/table view toggle)
- [ ] New patient form with validation
- [ ] Patient detail page with tabs
- [ ] Basic navigation and layout

### Phase 3: Data Entry
- [ ] History and habits forms
- [ ] Vitals recording
- [ ] Diagnosis wizard (5 steps)

### Phase 4: Report Management
- [ ] Camera capture component
- [ ] Report upload with type grouping
- [ ] Image gallery with lightbox

### Phase 5: Polish
- [ ] Loading states and error handling
- [ ] Offline indicator
- [ ] Responsive design refinement
- [ ] Accessibility audit

## Non-Functional Requirements

### Performance
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Patient list pagination: 50 records per page

### Security
- No sensitive data in localStorage
- XSS prevention via React escaping
- CSRF protection via same-origin policy

### Accessibility
- WCAG 2.1 Level AA compliant
- Keyboard navigation for all forms
- Screen reader support via ARIA labels
- Focus management in modals/wizards

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Camera API not supported | High | File picker fallback always available |
| Large image uploads slow performance | Medium | Client-side compression before upload |
| Browser compatibility issues | Medium | Target modern browsers only (Chrome/Edge/Firefox) |
| Form validation UX friction | Low | Inline validation with helpful messages |

## Definition of Done

- All user stories from spec.md implemented
- API contract tests pass
- Manual testing checklist completed
- shadcn/ui components properly configured
- Camera capture works on test devices
- Build produces production-ready bundle
