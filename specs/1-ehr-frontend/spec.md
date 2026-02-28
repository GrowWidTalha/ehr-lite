# Feature Specification: Frontend

**Feature Branch**: `1-ehr-frontend`
**Created**: 2026-02-25
**Status**: Draft
**Input**: Next.js frontend for EHR Lite oncology system

## User Scenarios & Testing

### User Story 1 - Find Existing Patient (Priority: P1) 🎯 MVP

**Description**: Clinic staff searches for an existing patient before registering them as new.

**Why this priority**: First step in any patient interaction - prevents duplicate records and saves time.

**Independent Test**: Staff can search for patients by name, phone, or CNIC and see matching results.

**Acceptance Scenarios**:
1. **Given** Patient "Sarah Johnson" exists in system, **When** Staff searches for "Sarah", **Then** Patient appears in search results with full name and phone
2. **Given** Multiple patients named "Mohammad Ali", **When** Staff searches for "Mohammad", **Then** All matching patients displayed with unique identifiers (phone, CNIC)
3. **Given** Patient does not exist, **When** Staff searches for "John Doe", **Then** "No patients found" message with "Register New Patient" button
4. **Given** Staff searches by phone "0300-1234567", **Then** Patient with matching phone appears in results

---

### User Story 2 - Register New Patient (Priority: P1) 🎯 MVP

**Description**: Staff registers a new patient with basic information, then progressively adds more details.

**Why this priority**: Core functionality - new patients must be registered before any other actions.

**Independent Test**: Staff can create a new patient record with basic demographics and complete the workflow.

**Acceptance Scenarios**:
1. **Given** Staff clicks "New Patient", **When** Form opens, **Then** System shows search prompt to check for existing patients first
2. **Given** Staff confirms patient is new, **When** Basic form displayed (name, age, sex, phone), **Then** Required fields clearly marked with asterisks
3. **Given** Staff enters valid data, **When** Submit clicked, **Then** Patient created and staff can add vitals, history, habits immediately
4. **Given** Staff enters invalid phone number format, **When** Submit attempted, **Then** Inline error shown: "Please enter valid phone number"

---

### User Story 3 - View Patient Details (Priority: P1) 🎯 MVP

**Description**: Staff views comprehensive patient information organized in tabs/sections.

**Why this priority**: Clinicians need to see complete patient history during consultation.

**Independent Test**: Staff can navigate through patient demographics, history, habits, diagnoses, reports.

**Acceptance Scenarios**:
1. **Given** Patient "Sarah Johnson" has data in multiple categories, **When** Staff opens patient detail, **Then** Data organized into tabs: Overview, History, Diagnoses, Reports
2. **Given** Staff is on Overview tab, **When** Page loads, **Then** Shows basic info + latest vitals + active diagnoses at a glance
3. **Given** Staff clicks "Reports" tab, **When** Tab opens, **Then** Reports grouped by type (Pathology, Imaging, Lab) with latest first
4. **Given** Patient has 2 diagnoses, **When** Staff opens Diagnoses tab, **Then** Both diagnoses listed with type, stage, grade visible

---

### User Story 4 - Upload Patient Reports (Priority: P1) 🎯 MVP

**Description**: Staff captures or uploads patient reports (pathology, imaging, lab results) using camera or file picker.

**Why this priority**: Critical for oncology workflow - physical reports must be digitized and attached to patient records.

**Independent Test**: Staff can upload images via camera or file picker, assign to report type, and view them later.

**Acceptance Scenarios**:
1. **Given** Staff has physical pathology report, **When** "Upload Report" clicked, **Then** Camera opens automatically (fallback to file picker)
2. **Given** Staff captures photo of report, **When** Image preview shown, **Then** Staff selects report type (Pathology, Imaging, Lab) and adds title/notes
3. **Given** Staff selects "Pathology" and uploads biopsy report, **When** Upload completes, **Then** Report appears in patient's Reports tab under Pathology section
4. **Given** Patient has 5 reports, **When** Reports tab opened, **Then** Staff sees count badges: "Pathology (2), Imaging (2), Lab (1)"

---

### User Story 5 - Create Cancer Diagnosis (Priority: P2)

**Description**: Staff creates a new cancer diagnosis using a guided multi-step wizard.

**Why this priority**: Capturing oncology data progressively reduces cognitive burden for complex 82-field entry.

**Independent Test**: Staff can create a diagnosis with basic info first, then add pathology, biomarker, and imaging details.

**Acceptance Scenarios**:
1. **Given** Staff clicks "New Diagnosis" on patient detail page, **When** Wizard opens, **Then** Step 1 shown: Basic (cancer type, stage, grade, WHO classification)
2. **Given** Staff enters "Breast Cancer" and clicks Next, **When** Step 2 loads, **Then** Pathology form shown (tumor size, margins, lymph nodes - collapsible sections)
3. **Given** Staff completes Pathology and clicks Next, **When** Step 3 loads, **Then** Biomarker form shown (ER, PR, HER2, Ki-67 with dropdowns)
4. **Given** Staff completes all steps and clicks Finish, **When** Diagnosis saved, **Then** Staff sees confirmation and diagnosis appears in Diagnoses tab

---

### User Story 6 - Edit Patient Information (Priority: P2)

**Description**: Staff updates existing patient information when details change or corrections are needed.

**Why this priority**: Patient information changes over time (phone, address, family status) and data entry errors need correction.

**Independent Test**: Staff can edit any field in patient record and changes persist after save.

**Acceptance Scenarios**:
1. **Given** Patient "Sarah Johnson" has wrong phone number, **When** Staff clicks Edit on Overview tab, **Then** Form opens with current values pre-filled
2. **Given** Staff changes phone to "0300-9999999", **When** Save clicked, **Then** Success message shown and new phone displayed on Overview
3. **Given** Staff cancels edit without saving, **When** Form closed, **Then** Original values remain unchanged
4. **Given** Staff edits required field to empty value, **When** Save attempted, **Then** Validation error shown: "This field is required"

---

### User Story 7 - Update Patient Vitals (Priority: P2)

**Description**: Staff records new vital signs measurements during patient visit.

**Why this priority**: Vitals are tracked over time to monitor patient health status.

**Independent Test**: Staff can add new vitals record and see history of all previous measurements.

**Acceptance Scenarios**:
1. **Given** Staff opens patient Overview tab, **When** "Add Vitals" clicked, **Then** Form shown with fields: height, weight, blood pressure, blood group
2. **Given** Staff enters height=165cm, weight=60kg, blood group=A+, **When** Save clicked, **Then** New vitals record saved with timestamp
3. **Given** Patient has 3 vitals records, **When** Vitals section viewed, **Then** All records shown in reverse chronological order (latest first)
4. **Given** Staff enters invalid weight (negative value), **When** Save attempted, **Then** Inline error shown: "Weight must be positive"

---

### User Story 8 - Record Patient History (Priority: P2)

**Description**: Staff documents medical history, comorbidities, and family cancer history.

**Why this priority**: Complete history is essential for oncology treatment decisions and risk assessment.

**Independent Test**: Staff can add/edit comorbidities and family history on History tab.

**Acceptance Scenarios**:
1. **Given** Staff opens History tab, **When** Tab loads, **Then** Sections shown: Medical History, Comorbidities, Family Cancer History
2. **Given** Staff clicks "Add Comorbidity", **When** Form opens, **Then** Fields shown: condition name, diagnosis date, status (Active/Resolved)
3. **Given** Staff adds diabetes as comorbidity, **When** Saved, **Then** Diabetes appears in comorbidities list
4. **Given** Staff adds family history (mother: breast cancer), **When** Saved, **Then** Family history displayed with relationship and cancer type

---

### User Story 9 - Record Patient Habits (Priority: P2)

**Description**: Staff records smoking, tobacco, and alcohol consumption patterns.

**Why this priority**: Lifestyle factors impact cancer risk and treatment recommendations.

**Independent Test**: Staff can record habits with quantities and duration.

**Acceptance Scenarios**:
1. **Given** Staff opens Habits tab, **When** Tab loads, **Then** Sections shown: Smoking, Tobacco, Alcohol with current status
2. **Given** Staff clicks Edit Smoking, **When** Form opens, **Then** Dropdowns shown: status (Never/Former/Current), cigarettes per day, years smoking
3. **Given** Staff selects status="Current", cigarettes/day=10, years=15, **When** Saved, **Then** Habits tab shows "Current smoker - 10 cigarettes/day for 15 years"
4. **Given** Patient never smoked, **When** Staff sets status="Never", **Then** Habits tab shows "Non-smoker"

---

### User Story 10 - View/Edit Diagnosis Details (Priority: P2)

**Description**: Staff views full diagnosis details and can edit incomplete information later.

**Why this priority**: Diagnosis information often arrives incrementally from different sources.

**Independent Test**: Staff can view all diagnosis fields and update them with new information.

**Acceptance Scenarios**:
1. **Given** Patient has breast cancer diagnosis, **When** Staff clicks on diagnosis card, **Then** Full diagnosis details shown in read-only view
2. **Given** Biomarker results arrive after initial diagnosis, **When** Staff clicks Edit, **Then** Diagnosis wizard opens at current step (Step 3: Biomarkers)
3. **Given** Staff adds HER2=3+ to biomarkers, **When** Saved, **Then** Diagnosis card updated with biomarker status
4. **Given** Staff views diagnosis with all 5 sections complete, **When** Displayed, **Then** Summary shows: Basic + Pathology + Biomarkers + Imaging + Treatment Plan

---

### User Story 11 - Delete Diagnosis (Priority: P3)

**Description**: Staff removes incorrectly entered diagnosis with confirmation.

**Why this priority**: Mistakes happen during data entry; need ability to remove wrong entries.

**Independent Test**: Staff can delete diagnosis with confirmation dialog preventing accidental deletion.

**Acceptance Scenarios**:
1. **Given** Staff views diagnosis that was entered in error, **When** Delete button clicked, **Then** Confirmation dialog shown: "Are you sure? This cannot be undone."
2. **Given** Staff confirms deletion, **When** Dialog confirmed, **Then** Diagnosis removed from list and success message shown
3. **Given** Staff cancels deletion, **When** Dialog cancelled, **Then** Diagnosis remains in list
4. **Given** Patient has only one diagnosis, **When** After deletion, **Then** Diagnoses tab shows "No diagnoses recorded"

---

### User Story 12 - View and Delete Reports (Priority: P2)

**Description**: Staff views uploaded reports and can remove incorrect uploads.

**Why this priority**: Staff need to review uploaded reports and remove blurry/incorrect images.

**Independent Test**: Staff can view report images in lightbox and delete with confirmation.

**Acceptance Scenarios**:
1. **Given** Patient has 3 pathology reports, **When** Reports tab opened, **Then** Pathology section shows 3 report cards with thumbnails
2. **Given** Staff clicks on report thumbnail, **When** Image viewer opens, **Then** Full-size image shown with zoom capability
3. **Given** Staff uploaded blurry image by mistake, **When** Delete clicked, **Then** Confirmation dialog shown
4. **Given** Staff confirms deletion, **When** Report deleted, **Then** Pathology count badge updates from (3) to (2)

---

### User Story 13 - Advanced Patient Search (Priority: P3)

**Description**: Staff searches patients using multiple filters for specific cohorts.

**Why this priority**: Needed for finding patient groups (e.g., all Stage III breast cancer patients).

**Independent Test**: Staff can apply multiple search filters and see matching results.

**Acceptance Scenarios**:
1. **Given** Staff clicks "Advanced Filters" on home page, **When** Filter panel expands, **Then** Filters shown: diagnosis type, stage, date range, age range
2. **Given** Staff selects diagnosis="Breast Cancer" and stage="III", **When** Search clicked, **Then** Results show only breast cancer Stage III patients
3. **Given** Staff sets date range (Jan 2024 - Dec 2024), **When** Search clicked, **Then** Results show patients registered within that range
4. **Given** Staff clears all filters, **When** Search clicked, **Then** All patients shown (default view)

---

### User Story 14 - Export Patient Data (Priority: P3)

**Description**: Staff exports patient data to CSV for backup or analysis.

**Why this priority**: Data backup and external analysis requirements.

**Independent Test**: Staff can export patient list with basic information to CSV file.

**Acceptance Scenarios**:
1. **Given** Staff is on patient list page, **When** "Export" button clicked, **Then** CSV download starts with current patient data
2. **Given** Export completes, **When** File opened, **Then** CSV contains columns: name, age, sex, phone, registration date, diagnosis
3. **Given** Advanced filters are applied, **When** Export clicked, **Then** CSV contains only filtered results
4. **Given** 5000 patients in system, **When** Export clicked, **Then** Large CSV warning shown: "Exporting 5000 records may take a moment..."

---

### User Story 15 - System Settings (Priority: P3)

**Description**: Admin configures basic system settings.

**Why this priority**: Customization for clinic preferences (backup location, default values).

**Independent Test**: Admin can access settings page and modify configuration.

**Acceptance Scenarios**:
1. **Given** Admin clicks Settings in sidebar, **When** Settings page opens, **Then** Sections shown: General, Data, Appearance
2. **Given** Admin changes items per page from 50 to 100, **When** Saved, **Then** Patient list shows 100 items per page
3. **Given** Admin sets default blood group to "O+", **When** New patient form opened, **Then** Blood group field pre-filled with O+
4. **Given** Admin clicks "Backup Data", **When** Backup initiated, **Then** Database backup file downloaded

---

## Requirements

### Functional Requirements

**FR-001**: System SHALL provide patient search functionality accessible from the home screen with search by name, phone, or CNIC.
**FR-002**: System SHALL display "Register New Patient" button always visible on home screen.
**FR-003**: System SHALL validate patient uniqueness by searching for existing records during registration.
**FR-004**: System SHALL use dropdown menus for common values: sex (Male/Female/Other), blood group, cancer stage (I/II/III/IV), smoking status (Never/Former/Current).
**FR-005**: System SHALL organize patient details view into tabs: Overview, History, Habits, Diagnoses, Reports.
**FR-006**: System SHALL support camera capture as default for report upload, with file picker as fallback.
**FR-007**: System SHALL group reports by type: Pathology, Imaging, Lab, with visual count badges.
**FR-008**: System SHALL provide multi-step wizard for new diagnosis entry: Basic → Pathology → Biomarkers → Imaging → Treatment Plan.
**FR-009**: System SHALL support toggle view (Card/Table) for patient list.
**FR-010**: System SHALL display offline indicator showing system is running locally without internet.
**FR-011**: System SHALL use collapsible accordion sections for complex oncology data (82+ fields).
**FR-012**: System SHALL support progressive data capture - basic fields first, advanced fields optional.
**FR-013**: System SHALL display quick action buttons always visible: New Patient, Upload Report, Search.
**FR-014**: System SHALL provide advanced search filters: diagnosis type, stage, date range.

### UI/UX Requirements

**UX-001**: Forms MUST use shadcn/ui components for consistency.
**UX-002**: System MUST use simple, clean design optimized for clinic staff (non-technical users).
**UX-003**: Required fields MUST be marked with red asterisk (*).
**UX-004**: Forms MUST show inline validation errors with helpful messages.
**UX-005**: System MUST use accordions for long forms - sections collapsed by default.
**UX-006**: System MUST show success message after each successful action.
**UX-007**: System MUST use consistent color scheme: Green for success, Red for errors, Amber for warnings.
**UX-008**: Page navigation MUST be sidebar-based for quick access to all sections.

### Key Entities

- **Patient**: Core patient record with demographics, contact info, registration
- **Vitals**: Height, weight, blood group measurements (multiple records allowed)
- **History**: Medical history, comorbidities, family cancer history
- **Habits**: Smoking, tobacco, alcohol use with quantities
- **Diagnosis**: Cancer type, stage, grade, WHO classification
- **Pathology Report**: Tumor details, margins, lymph nodes
- **Biomarker Test**: ER, PR, HER2, Ki-67, IHC markers
- **Imaging Study**: CT, MRI, PET, Ultrasound, Mammogram, Bone Scan, Echo
- **Treatment Plan**: Planned surgery, chemotherapy, radiotherapy
- **Report**: General document with attached images

## Success Criteria

### Measurable Outcomes

- **SC-001**: Staff can register new patient in under 2 minutes.
- **SC-002**: Patient search returns results in under 1 second for 10,000 patients.
- **SC-003**: Report upload (camera or file) completes in under 10 seconds.
- **SC-004**: New diagnosis entry (basic fields) can be completed in under 3 minutes.
- **SC-005**: System works offline without any internet connection - indicator clearly visible.
- **SC-006**: 95% of staff can complete patient registration without training on first use.
- **SC-007**: Toggle between card and table views for patient list is instant (< 100ms).

### Performance

- **SC-008**: Patient list loads first 50 records in under 500ms.
- **SC-009**: Form submission feedback within 500ms.
- **SC-010**: Image upload preview appears within 2 seconds.

### Usability

- **SC-011**: All critical functions accessible within 2 clicks from home screen.
- **SC-012**: Error messages use plain language (no technical jargon).
- **SC-013**: All forms support keyboard navigation (Enter to submit, Escape to cancel).
- **SC-014**: Camera capture works on laptop webcam, tablet, and mobile phone browsers.

## Page Structure

### 1. Home / Patient List (`/`)

**Components**:
- Header with app title, offline indicator (green dot + "Offline Mode")
- Quick action buttons: [New Patient] [Upload Report]
- Search bar: Name/Phone/CNIC search with advanced filters toggle
- View toggle: [Cards] | [Table]
- Patient list (50 per page with pagination)

**shadcn/ui Components**:
- `Input` - Search bar
- `Button` - Quick actions, view toggle
- `Card` - Patient cards in card view
- `Table` - Patient table in table view
- `Badge` - Report counts, status indicators
- `Pagination` - Page navigation

**Card View Fields**: Name, Age, Sex, Phone, Registration Date, Report Count, Diagnosis (if any)
**Table View Columns**: Name, Age, Sex, Phone, CNIC, Reg Date, Actions (View, Edit)

---

### 2. New Patient (`/patients/new`)

**Components**:
- Search-first prompt: "Check if patient exists..."
- Basic patient form (required fields marked with *)
- Accordions for optional sections: Demographics, Contact, Family Info

**shadcn/ui Components**:
- `Form` - Patient registration form
- `Input` - All text inputs
- `Select` - Sex dropdown, Marital Status, Education
- `Label` - Field labels
- `Accordion`, `AccordionItem` - Optional advanced sections
- `Button` - Submit, Cancel
- `AlertDialog` - Duplicate patient warning

**Required Fields**: Full Name (*), Age (*), Sex (*), Phone
**Optional Fields**: CNIC, Marital Status, Education, Language, Territory, Children, Sibling

---

### 3. Patient Detail (`/patients/[id]`)

**Layout**: Sidebar navigation + Tab content area

**Components**:
- Sidebar: Patient summary card + Navigation tabs
- Tab content: Dynamic based on selected tab

**shadcn/ui Components**:
- `Tabs`, `TabsList`, `TabsTrigger` - Tab navigation
- `Card` - Patient info cards
- `Badge` - Status badges
- `Button` - Action buttons
- `Accordion`, `AccordionItem` - Collapsible sections

**Tabs**:
1. **Overview**: Basic info + Latest vitals + Active diagnoses
2. **History**: Medical history, comorbidities, family history (editable)
3. **Habits**: Smoking, tobacco, alcohol (editable)
4. **Diagnoses**: List of all diagnoses with [New Diagnosis] button
5. **Reports**: Reports grouped by type with [Upload Report] button

---

### 4. Patient Registration Form (`/patients/new`)

**Field Groups (Accordions)**:

**Basic Information** (Expanded by default):
- Full Name * | Input
- Age * | Input (number)
- Sex * | Select (Male/Female/Other)
- Phone * | Input
- CNIC | Input

**Optional Information** (Collapsed):
- Marital Status | Select
- Education | Select
- Language | Input
- Territory | Input
- Children Count | Input (number)
- Sibling Count | Input (number)

**shadcn/ui Components**:
- `Form` - Form container
- `Input` - Text, number inputs
- `Select` - Dropdowns
- `Label` - Field labels
- `Accordion`, `AccordionItem` - Section grouping
- `Button` - Submit, Cancel

---

### 5. Diagnosis Wizard (`/patients/[id]/diagnoses/new`)

**Multi-step form with progress indicator**:

**shadcn/ui Components**:
- `Stepper`, `Step` - Progress indicator
- `Form` - Each step's form
- `Input` - Text inputs
- `Select` - Dropdowns for stage, grade, WHO
- `Textarea` - Notes fields
- `Accordion`, `AccordionItem` - Optional advanced fields
- `Button` - Next, Previous, Finish, Cancel

**Step 1 - Basic Diagnosis** (Required):
- Cancer Type * | Text input with autocomplete
- Stage | Select (I, II, III, IV)
- Grade | Select (1, 2, 3)
- WHO Classification | Text input
- Diagnosis Date | Date picker

**Step 2 - Pathology** (Optional - Collapsible):
- Tumor Size | Input
- Depth | Input
- Margins | Select (Clear, Close, Involved)
- LVI | Select (Yes/No)
- PNI | Select (Yes/No)
- Nodes Recovered | Input (number)
- Nodes Involved | Input (number)
- Extra Nodal Extension | Select (Yes/No)
- Surgery Adequacy | Select (Adequate, Inadequate)
- Recurrence | Text input

**Step 3 - Biomarkers** (Optional):
- ER Status | Select (Positive/Negative) + Percentage
- PR Status | Select (Positive/Negative) + Percentage
- HER2 Status | Select (0, 1+, 2+, 3+)
- Ki-67 Percentage | Input (number)
- Mitosis/10HPF | Input (number)
- IHC Markers | Textarea
- Tumor Markers | Textarea

**Step 4 - Imaging** (Optional):
- Study Type | Select (CT, MRI, PET, US, Mammogram, Bone Scan, Echo, BSC)
- Study Date | Date picker
- Findings | Textarea
- Indication | Textarea
- Upload Images | Camera capture or file picker

**Step 5 - Treatment Plan** (Optional):
- Plan Type | Select (Curative, Palliative)
- Surgery Planned | Select (Yes/No)
- Radical Surgery | Select (Yes/No)
- Neoadjuvant Chemo | Select (Yes/No)
- Adjuvant Chemo | Select (Yes/No)
- Induction Chemo | Select (Yes/No)

---

### 6. Report Upload (`/patients/[id]/reports/new`)

**Components**:
- Camera capture (primary action)
- File picker (fallback)
- Report type selector
- Title and notes fields
- Image preview with option to retake

**shadcn/ui Components**:
- `Form` - Upload form
- `Select` - Report type dropdown
- `Input` - Title, notes
- `Button` - Capture, Upload, Cancel
- `AlertDialog` - Confirm before delete

**Report Types**: Pathology, Imaging (CT, MRI, PET, US, Mammogram, Bone Scan, Echo), Lab, Consultation, Other

---

### 7. Sidebar Navigation

**Components**:
- App logo/title
- Offline indicator
- Navigation menu
- Patient summary card (when viewing patient)

**shadcn/ui Components**:
- `Sheet`, `SheetTrigger` - Collapsible sidebar
- `ScrollArea` - Scrollable content

**Navigation Items**:
- Home / Patients
- New Patient
- Upload Report
- Settings (future)

---

## Design System

### Colors (shadcn/ui default theme)

```css
/* Primary - Blue for actions */
--primary: 221 83% 53%
--primary-foreground: 210 40% 98%

/* Secondary - Gray for secondary actions */
--secondary: 210 40% 96%
--secondary-foreground: 222 47% 11%

/* Destructive - Red for delete actions */
--destructive: 0 84% 60%
--destructive-foreground: 210 40% 98%

/* Background */
--background: 0 0% 100%
--foreground: 222 47% 11%

/* Card */
--card: 0 0% 100%
--card-foreground: 222 47% 11%

/* Border */
--border: 214 20% 91%
--input: 214 20% 91%

/* Offline indicator - Green */
--success: 142 76% 36%
```

### Typography

```css
/* Font: Inter (default shadcn/ui) */
--font-sans: "Inter", sans-serif;

/* Sizes */
text-4xl: 36pt - Page headings
text-2xl: 24pt - Section headings
text-xl: 20pt - Card titles
text-base: 16pt - Body text
text-sm: 14pt - Labels, captions
text-xs: 12pt - Fine print
```

### Component Spacing

```css
/* Spacing scale */
--radius: 0.5rem;  /* 8px rounded corners */
--spacing: 0.5rem; /* 8px unit spacing */
```

## Edge Cases

1. **Duplicate Patient**: System searches for existing patients by name/phone/CNIC during registration and warns if match found.
2. **No Camera Access**: If camera unavailable or permission denied, fall back to file picker automatically.
3. **Large Image Upload**: If image > 5MB, show error: "Image too large. Maximum size is 5MB."
4. **Invalid File Type**: Only accept JPG, PNG, PDF for report uploads.
5. **Network Failure**: Show clear message: "Offline mode - system is running locally. Ensure backend is running on localhost:4000."
6. **Multiple Browser Tabs**: If same patient opened in multiple tabs, warn about potential conflicts.
7. **Session Timeout**: After 30 minutes of inactivity, show warning before session expires.
8. **Browser Back Button**: Handle browser back button correctly - don't lose form data.
9. **Concurrent Edits**: If same patient being edited by multiple users, show "Record modified - refresh to see latest."

## Assumptions

1. **Backend Ready**: Backend API is running at `http://localhost:4000` with all endpoints functional.
2. **Camera Hardware**: Device has working webcam or camera for image capture.
3. **Single User**: Single-user system - no concurrent editing conflicts initially.
4. **Browser Support**: Target modern browsers (Chrome, Edge, Firefox) with ES6+ support.
5. **Internet Browser**: System runs in browser even though fully offline (localhost).
6. **Data Persistence**: All data persists in SQLite database - no data loss on refresh.

## Out of Scope

- User authentication/login (future enhancement)
- Multi-user access control
- Data export functionality
- Data synchronization with external systems
- Email/SMS notifications
- Prescription generation
- Appointment scheduling
- Billing/invoicing
- Analytics and reporting dashboards
- Mobile app (responsive web design only)

---

## API Contract

### Base Configuration

- **Base URL**: `http://localhost:4000/api`
- **Content Type**: `application/json`
- **Authentication**: None (single-user mode)

### Endpoints

#### Patient Endpoints

```
GET    /api/patients
Query Params: ?search={query}&page={n}&limit={n}&diagnosis={type}&stage={n}
Response: { patients: [...], total: n, page: n, totalPages: n }

GET    /api/patients/:id
Response: { patient: {...}, vitals: [...], diagnoses: [...], reports: [...] }

POST   /api/patients
Body: { name, age, sex, phone, cnic, maritalStatus, education, ... }
Response: { patient: {...} }

PUT    /api/patients/:id
Body: { name, age, sex, phone, ... }
Response: { patient: {...} }

DELETE /api/patients/:id
Response: { success: true }
```

#### Vitals Endpoints

```
GET    /api/patients/:id/vitals
Response: { vitals: [...] }

POST   /api/patients/:id/vitals
Body: { height, weight, bloodPressure, bloodGroup, date }
Response: { vitals: {...} }
```

#### History Endpoints

```
GET    /api/patients/:id/history
Response: { medicalHistory: [...], comorbidities: [...], familyHistory: [...] }

PUT    /api/patients/:id/history
Body: { medicalHistory, comorbidities, familyHistory }
Response: { history: {...} }
```

#### Habits Endpoints

```
GET    /api/patients/:id/habits
Response: { smoking: {...}, tobacco: {...}, alcohol: {...} }

PUT    /api/patients/:id/habits
Body: { smoking: {...}, tobacco: {...}, alcohol: {...} }
Response: { habits: {...} }
```

#### Diagnosis Endpoints

```
GET    /api/patients/:id/diagnoses
Response: { diagnoses: [...] }

GET    /api/diagnoses/:id
Response: { diagnosis: {...} }

POST   /api/patients/:id/diagnoses
Body: { cancerType, stage, grade, whoClassification, pathology, biomarkers, imaging, treatment }
Response: { diagnosis: {...} }

PUT    /api/diagnoses/:id
Body: { cancerType, stage, grade, ... }
Response: { diagnosis: {...} }

DELETE /api/diagnoses/:id
Response: { success: true }
```

#### Report Endpoints

```
GET    /api/patients/:id/reports
Query Params: ?type={pathology|imaging|lab}
Response: { reports: [...] }

POST   /api/patients/:id/reports
Body: FormData { type, title, notes, image }
Response: { report: {...} }

DELETE /api/reports/:id
Response: { success: true }
```

#### Search Endpoint

```
GET    /api/search
Query Params: ?q={query}&type={patient|diagnosis}
Response: { results: [...] }
```

### Error Responses

```typescript
// Standard Error Response
{
  error: string,
  message: string,
  code?: string
}

// HTTP Status Codes
400 - Bad Request (validation error)
404 - Not Found
409 - Conflict (duplicate patient)
422 - Unprocessable Entity
500 - Server Error
```

---

## State Management

### Global State (Zustand Store)

```typescript
// Patient Store
interface PatientStore {
  // State
  patients: Patient[]
  currentPatient: Patient | null
  filters: PatientFilters
  loading: boolean
  error: string | null

  // Actions
  fetchPatients: (filters?: PatientFilters) => Promise<void>
  fetchPatient: (id: string) => Promise<void>
  createPatient: (data: PatientInput) => Promise<void>
  updatePatient: (id: string, data: PatientInput) => Promise<void>
  deletePatient: (id: string) => Promise<void>
  setCurrentPatient: (patient: Patient | null) => void
  setFilters: (filters: PatientFilters) => void
  clearError: () => void
}

// UI Store
interface UIStore {
  // State
  sidebarOpen: boolean
  patientListView: 'card' | 'table'
  toast: Toast[]

  // Actions
  toggleSidebar: () => void
  setPatientListView: (view: 'card' | 'table') => void
  addToast: (toast: Toast) => void
  removeToast: (id: string) => void
}

// Form Store (for wizard state persistence)
interface FormStore {
  // State
  diagnosisDraft: DiagnosisDraft | null
  reportDraft: ReportDraft | null

  // Actions
  saveDiagnosisDraft: (draft: DiagnosisDraft) => void
  clearDiagnosisDraft: () => void
  saveReportDraft: (draft: ReportDraft) => void
  clearReportDraft: () => void
}
```

### Local State (React useState)

- Form input values
- Accordion open/closed state
- Tab selection
- Modal open/closed state
- Image preview state

### Server State (React Query)

```typescript
// Query Keys
const queryKeys = {
  patients: ['patients'] as const,
  patient: (id: string) => ['patients', id] as const,
  vitals: (id: string) => ['patients', id, 'vitals'] as const,
  diagnoses: (id: string) => ['patients', id, 'diagnoses'] as const,
  reports: (id: string) => ['patients', id, 'reports'] as const,
}

// Query Configuration
const queryClientConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
  retry: 1,
}
```

---

## Testing Requirements

### Unit Tests (Vitest)

**Coverage Target**: 70%

**Components to Test**:
- Form validation utilities
- Date formatting utilities
- Image upload helper functions
- Data transformation functions
- Custom hooks (usePatientForm, useDiagnosisWizard)

**Example Test**:
```typescript
describe('formatDate', () => {
  it('formats date string to display format', () => {
    expect(formatDate('2024-01-15')).toBe('January 15, 2024')
  })

  it('handles invalid dates', () => {
    expect(formatDate('invalid')).toBe('Invalid Date')
  })
})
```

### Integration Tests (Playwright)

**Critical User Flows**:
1. Register new patient → Search patient → View patient details
2. Upload report → View report in Reports tab → Delete report
3. Create diagnosis → View diagnosis → Edit diagnosis → Delete diagnosis
4. Update vitals → Verify vitals history displays correctly

**Test Data**:
- Use seeded test database with realistic patient data
- Clean up test data after each test run

**Example Test**:
```typescript
test('patient registration flow', async ({ page }) => {
  await page.goto('/')
  await page.click('[data-testid="new-patient-btn"]')
  await page.fill('[name="name"]', 'Test Patient')
  await page.fill('[name="age"]', '45')
  await page.selectOption('[name="sex"]', 'Female')
  await page.fill('[name="phone"]', '03001234567')
  await page.click('[data-testid="submit-patient"]')
  await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
})
```

### Manual Testing Checklist

- [ ] Patient search works with name, phone, CNIC
- [ ] Card/Table view toggle works instantly
- [ ] All form validations show helpful error messages
- [ ] Camera capture opens on supported devices
- [ ] File picker works as fallback for reports
- [ ] Diagnosis wizard preserves data between steps
- [ ] All accordions collapse/expand correctly
- [ ] Sidebar navigation works on all pages
- [ ] Offline indicator is always visible
- [ ] Responsive design works on tablet viewport (768px)
- [ ] Responsive design works on mobile viewport (375px)

---

## Accessibility Requirements

### WCAG 2.1 Level AA Compliance

**Visual**:
- [ ] Color contrast ratio ≥ 4.5:1 for normal text, 3:1 for large text
- [ ] Focus indicators visible on all interactive elements
- [ ] No reliance on color alone to convey information

**Keyboard**:
- [ ] All functionality operable via keyboard (no mouse required)
- [ ] Visible focus order follows logical layout
- [ ] Skip to main content link available
- [ ] Escape key closes modals and dropdowns

**Screen Reader**:
- [ ] All images have alt text (decorative images marked as such)
- [ ] Form inputs have associated labels
- [ ] Error messages announced to screen readers
- [ ] ARIA labels used for icon-only buttons
- [ ] Live regions used for dynamic content updates (toasts)

**Forms**:
- [ ] Required fields indicated programmatically (aria-required)
- [ ] Validation errors associated with inputs (aria-describedby)
- [ ] Form submission feedback announced

### Semantic HTML

```html
<!-- Use semantic elements -->
<nav>    <!-- Navigation -->
<main>   <!-- Main content -->
<section> <!-- Document section -->
<article> <!-- Self-contained content -->
<header>  <!-- Section header -->
<footer>  <!-- Section footer -->

<!-- Form accessibility -->
<label for="patient-name">Full Name *</label>
<input id="patient-name" name="name" required aria-required="true">
<span id="name-error" role="alert" aria-live="polite"></span>

<!-- Button accessibility -->
<button aria-label="Close dialog" aria-describedby="close-warning">
  <X aria-hidden="true" />
</button>
```

---

## Internationalization (i18n) - Future

**Placeholder for multi-language support**:

```typescript
// Language files structure
/locales
  /en
    common.json
    patients.json
    diagnoses.json
  /ur
    common.json
    patients.json
    diagnoses.json
```

**Target Languages** (future):
- English (default)
- Urdu

**Key Considerations**:
- Date/time formatting by locale
- Number formatting
- RTL support for Urdu
- Gender-neutral language where appropriate

---

## Component Hierarchy

### Page Structure

```
app/
├── layout.tsx              # Root layout with sidebar
├── page.tsx                # Patient list (home)
├── not-found.tsx           # 404 page
└── patients/
    ├── new/
    │   └── page.tsx        # New patient form
    └── [id]/
        ├── page.tsx        # Patient detail (tabs)
        ├── diagnoses/
        │   ├── new/
        │   │   └── page.tsx  # Diagnosis wizard
        │   └── [diagnosisId]/
        │       └── page.tsx  # Diagnosis detail
        └── reports/
            ├── page.tsx    # Reports list
            └── new/
                └── page.tsx  # Upload report
```

### Component Tree (Key Components)

```
App
├── SidebarLayout
│   ├── Sidebar
│   │   ├── AppHeader
│   │   ├── OfflineIndicator
│   │   ├── NavMenu
│   │   └── PatientSummary (when viewing patient)
│   └── MainContent
│
├── PatientListPage
│   ├── PageHeader (title + quick actions)
│   ├── SearchBar
│   ├── AdvancedFilters (collapsible)
│   ├── ViewToggle (Card/Table)
│   └── PatientList
│       ├── PatientCard (repeated)
│       └── Pagination
│
├── NewPatientPage
│   ├── SearchPrompt (check existing)
│   ├── PatientForm
│   │   ├── BasicInfoSection (always expanded)
│   │   ├── DemographicsSection (accordion)
│   │   ├── ContactSection (accordion)
│   │   └── FamilyInfoSection (accordion)
│   └── FormActions (Save/Cancel)
│
├── PatientDetailPage
│   ├── PatientHeader (name + actions)
│   ├── Tabs
│   │   ├── OverviewTab
│   │   │   ├── PatientInfoCard
│   │   │   ├── LatestVitalsCard
│   │   │   └── ActiveDiagnosesCard
│   │   ├── HistoryTab
│   │   │   ├── HistoryForm
│   │   │   ├── ComorbiditiesList
│   │   │   └── FamilyHistoryList
│   │   ├── HabitsTab
│   │   │   └── HabitsForm
│   │   ├── DiagnosesTab
│   │   │   ├── DiagnosisList
│   │   │   ├── DiagnosisCard (repeated)
│   │   │   └── NewDiagnosisButton
│   │   └── ReportsTab
│   │       ├── ReportGroups (by type)
│   │       │   └── ReportCard (repeated)
│   │       └── UploadReportButton
│
├── DiagnosisWizardPage
│   ├── WizardProgress (Step indicator)
│   ├── WizardStep1 (Basic)
│   ├── WizardStep2 (Pathology)
│   ├── WizardStep3 (Biomarkers)
│   ├── WizardStep4 (Imaging)
│   ├── WizardStep5 (Treatment)
│   └── WizardActions (Next/Previous/Finish)
│
└── ReportUploadPage
    ├── CameraCapture (primary)
    ├── FilePicker (fallback)
    ├── ImagePreview
    ├── ReportForm (type, title, notes)
    └── UploadActions
```

### Reusable Components

```typescript
// components/ui/*
Button, Input, Select, Textarea, Label, Form
Card, Badge, Avatar
Tabs, TabsList, TabsTrigger, TabsContent
Accordion, AccordionItem, AccordionTrigger, AccordionContent
Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
AlertDialog, AlertDialogAction, AlertDialogCancel
Sheet, SheetTrigger, SheetContent
Toast, ToastProvider, ToastViewport
Pagination, PaginationContent, PaginationItem
Separator, ScrollArea
```

```typescript
// components/features/*
PatientCard, PatientTableRow
PatientInfoCard, VitalsCard
DiagnosisCard, ReportCard
SearchBar, AdvancedFilters
CameraCapture, ImagePreview
WizardStepper, FormSection
OfflineIndicator, EmptyState
LoadingSpinner, ErrorMessage
```

---

## Deployment

### Development Environment

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# Access at http://localhost:3000

# Run with backend
npm run dev     # frontend (localhost:3000)
cd ../backend && npm run dev  # backend (localhost:4000)
```

### Build for Production

```bash
# Create production build
npm run build

# Test production build locally
npm run start

# Build output
# .next/ directory
```

### Deployment Options

**Option 1: Static Export (Simplest)**
```bash
# Build as static site
npm run build  # with output: 'export'

# Deploy to any static host (Netlify, Vercel, GitHub Pages)
# Note: Requires API calls to external backend
```

**Option 2: Docker Container (Recommended for Offline)**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Option 3: Electron Desktop App (Future)**
- Package Next.js app as desktop application
- Single executable for Windows/Mac/Linux
- Truly offline without browser dependency

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=EHR Lite
NEXT_PUBLIC_OFFLINE_MODE=true
```

### Performance Optimization

- Code splitting by route (automatic in Next.js)
- Image optimization with next/image
- Lazy loading for heavy components
- Debounced search input (300ms)
- Virtual scrolling for large lists (future)
- Service worker for offline caching (future)

---

## Dependencies

### Production Dependencies

```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "@radix-ui/react-accordion": "^1.2.0",
  "@radix-ui/react-alert-dialog": "^1.1.0",
  "@radix-ui/react-dialog": "^1.1.0",
  "@radix-ui/react-label": "^2.1.0",
  "@radix-ui/react-select": "^2.1.0",
  "@radix-ui/react-separator": "^1.1.0",
  "@radix-ui/react-slot": "^1.1.0",
  "@radix-ui/react-tabs": "^1.1.0",
  "@radix-ui/react-toast": "^1.2.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.5.0",
  "lucide-react": "^0.460.0",
  "zustand": "^5.0.0",
  "@tanstack/react-query": "^5.60.0",
  "react-hook-form": "^7.53.0",
  "zod": "^3.23.0",
  "@hookform/resolvers": "^3.9.0",
  "date-fns": "^4.1.0"
}
```

### Development Dependencies

```json
{
  "@types/node": "^22.0.0",
  "@types/react": "^19.0.0",
  "@types/react-dom": "^19.0.0",
  "typescript": "^5.6.0",
  "tailwindcss": "^3.4.0",
  "postcss": "^8.4.0",
  "autoprefixer": "^10.4.0",
  "eslint": "^9.0.0",
  "eslint-config-next": "^15.0.0",
  "vitest": "^2.1.0",
  "@playwright/test": "^1.48.0",
  "prettier": "^3.3.0"
}
```

---

## Migration Path

### Phase 1: MVP (Current Sprint)
- Patient registration, search, view
- Basic report upload
- Diagnosis creation (basic fields only)

### Phase 2: Enhanced Features (Future)
- Full diagnosis wizard (all 5 steps)
- History and habits tracking
- Advanced search and filters
- Data export

### Phase 3: Advanced Features (Future)
- User authentication
- Multi-user support
- Data synchronization
- Analytics dashboard
- Prescription module
- Appointment scheduling

### Phase 4: Platform Enhancements (Future)
- Electron desktop app
- Mobile app (React Native)
- Cloud sync option
- Multi-language support
- Barcode scanning for patient IDs
