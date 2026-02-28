<!--
Sync Impact Report:
- Version change: Initial → 1.0.0
- Created: New constitution for EHR Lite project
- Templates reviewed: spec-template.md ✅, plan-template.md ✅, tasks-template.md ✅
- No dependent template updates required at this time
-->

# EHR Lite Constitution

## Core Principles

### I. Local-First Architecture

**Mandatory**: System MUST operate fully offline with zero cloud dependencies.

- All patient data stored locally in SQLite database at `/data/database.db`
- All report images stored locally at `/data/patient-images/`
- Application MUST be functional without internet connectivity
- Browser-based UI communicates with local backend only (localhost:4000)
- No external APIs, telemetry, or data transmission

**Rationale**: Healthcare data sensitivity and clinic environments require complete data sovereignty. Offline operation ensures reliability in areas with unstable connectivity and guarantees patient privacy.

### II. Single-Click Startup

**Mandatory**: Application MUST start via double-click on `.bat` file.

- `start-app.bat` handles all initialization automatically
- Backend starts on `http://localhost:4000`
- Frontend starts on `http://localhost:3000`
- No manual command-line operations required for end users
- Database and image directories created automatically if missing

**Rationale**: Clinic staff may not be technical. Single-click startup reduces training overhead and minimizes operational errors.

### III. Healthcare Data Protection

**Mandatory**: All patient data MUST be validated, sanitized, and safely persisted.

- Input validation using Zod schemas on all API endpoints
- File type validation (images: jpg/png only)
- File size limits enforced (5MB default per image)
- SQL injection prevention through parameterized queries
- Path traversal prevention on file operations
- Atomic database transactions for multi-record operations

**Rationale**: Even in local systems, healthcare data requires rigorous protection against corruption, injection, and accidental loss.

### IV. Data Portability & Backup

**Mandatory**: All user data MUST be easily backupable and portable.

- All persistent data contained within `/data/` folder
- Database is a single SQLite file (portable)
- Images use standard filesystem structure
- User can backup by copying `/data/` folder to USB or external drive
- No proprietary binary formats or embedded data stores

**Rationale**: Clinics must protect against data loss through simple, understandable backup procedures. Portability enables data migration between systems.

### V. Camera-First Documentation

**Mandatory**: Report upload MUST prioritize camera capture with file upload fallback.

- Primary flow: Camera capture via `navigator.mediaDevices.getUserMedia`
- Supports: Laptop webcams, mobile browsers, tablets
- Fallback: Standard file picker for existing images
- Images stored in patient-specific folders by UUID
- Database stores only file paths (not binary data)

**Rationale**: Healthcare workflows often involve physical reports, prescriptions, and lab results. Camera capture is faster than scanning.

### VI. Fail-Safe Error Handling

**Mandatory**: All operations MUST have clear error paths with user-friendly messages.

- Backend returns structured error responses
- Frontend displays actionable error messages (no stack traces to users)
- Database connection failures are surfaced clearly
- File write failures prevent partial saves
- Network errors between frontend/backend are handled gracefully
- Operations log failures for troubleshooting

**Rationale**: Medical workflows cannot afford silent failures. Clear error communication enables staff to correct issues promptly.

## Technology Constraints

### Mandatory Stack

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS, React Hook Form, Zod
- **Backend**: Node.js + Express
- **Database**: SQLite with Drizzle ORM (or better-sqlite3)
- **Platform**: Windows 10/11, 4GB RAM minimum

### Prohibited

- Cloud services, APIs, or SDKs (Firebase, AWS, Auth0, etc.)
- External authentication providers
- Telemetry or analytics services
- Remote data synchronization
- Docker or containerization requirements

### Allowed (Optional)

- Local authentication (username/password stored in database)
- Image compression libraries (local only)
- PDF generation for reports (local only)

## Development Standards

### Code Quality

- TypeScript strict mode enabled
- ESLint and Prettier configured
- No `any` types without justification
- Component prop validation with TypeScript or Zod

### API Design

- RESTful endpoints following `/api/resource/:id` pattern
- Consistent response format: `{ data, error }`
- HTTP status codes used correctly (200, 201, 400, 404, 500)
- CORS configured for localhost only

### Database Operations

- All queries through ORM or parameterized statements
- Transactions for multi-table operations
- Indexes on frequently queried fields (patient name, phone, CNIC)
- Foreign key constraints enforced

## Testing Requirements

### Critical Paths (Must Test)

- Patient creation, retrieval, update, deletion
- Report image upload and storage
- Image retrieval and display
- Database and filesystem error handling
- Camera capture across device types

### Test Organization

- API contract tests for all endpoints
- Integration tests for patient-report relationships
- File upload/download validation tests
- Error injection tests for failure modes

## Deployment & Distribution

### Runtime Requirements

- Node.js must be installed on target machine
- `start-app.bat` handles startup
- No build process required for end users (pre-built frontend)
- Database auto-initializes on first run

### Distribution Format

- Single folder containing: `start-app.bat`, `backend/`, `frontend/`, `data/`
- Data folder initially empty (auto-created)
- No installation wizard or registry entries

## Governance

### Amendment Process

1. Any change to Core Principles requires documented ADR (Architecture Decision Record)
2. Technology constraints may be updated with technical justification
3. Development standards evolve with team consensus
4. All amendments increment version per semantic versioning

### Compliance

- All features MUST pass Constitution Check in plan template
- Pull requests violating principles MUST be rejected
- Complexity justifications documented in Complexity Tracking table
- When in doubt, favor simplicity over optimization

### Version History

**Version 1.0.0** (2026-02-24): Initial constitution establishing local-first architecture for EHR Lite
