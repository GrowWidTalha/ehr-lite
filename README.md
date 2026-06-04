# EHR Lite - Electronic Health Records System

## Overview

**EHR Lite** is a lightweight, patient-centered Electronic Health Records system designed specifically for oncology care management. It provides comprehensive patient tracking from initial diagnosis through treatment, follow-up, and survivorship care.

## Purpose

EHR Lite streamlines cancer patient data management by:
- Digitizing patient onboarding with structured medical history capture
- Centralizing treatment records (chemotherapy, radiation, surgery, immunotherapy)
- Tracking patient outcomes and follow-ups
- Managing medical reports, lab results, and imaging studies
- Providing searchable patient database with filtering capabilities

## Key Features

### 🏥 Patient Management
- **Multi-step Onboarding Wizard**: Structured capture of patient demographics, medical history, habits, past treatments, and surgical procedures
- **Patient Search**: Searchable patient database with pagination
- **Detailed Patient Profiles**: Comprehensive view including demographics, contact info, and medical timeline
- **Patient Editing**: Update patient information as needed

### 📋 Medical Records
- **Presenting Complaints**: Chief complaints and history documentation
- **Comorbidities Tracking**: Record conditions like diabetes, hypertension, etc.
- **Family Cancer History**: Document familial cancer patterns
- **Past Treatments**:
  - Previous Chemotherapy
  - Previous Radiation Therapy (RT)
  - Previous Targeted/TKI Therapy
  - Previous Hormone Therapy (HT)
  - Previous Immunotherapy (IT)
- **Past Surgeries**: Surgical history with image attachments
  - Cancer vs non-cancer classification
  - Hospital and surgeon information
  - Document/image upload per surgery

### 🚬 Habits & Lifestyle
- **Addiction Tracking**: Smoking, tobacco (gutka, naswar), alcohol consumption
- **Quantified Metrics**: Frequency, quantity, duration tracking
- **Quit Period Monitoring**: Records when patients stopped habits

### 📄 Reports & Imaging
- **Document Upload**: Capture pathology reports, imaging studies (CT, MRI, ultrasound, etc.)
- **Camera Integration**: Direct image capture from devices
- **Report Types**: Multiple report categories with metadata
- **Image Lightbox**: Full-screen image viewing with zoom/rotate controls
- **File Validation**: Size limits (5MB) and type checking (jpg, png, pdf)

### 🧪 Lab Results
- **Complete Blood Count (CBC)**: RBC, WBC, platelets, differentials
- **Liver Function Tests (LFT)**: Bilirubin, SGPT, SGOT, ALP, GGT
- **Blood Sugar**: Fasting, random, HbA1c
- **Electrolytes**: Sodium, potassium, chloride, magnesium
- **Renal Function**: Blood urea, creatinine, clearance
- **Tumor Markers**: CEA, CA125, CA19-9, PSA, AFP, LDH
- **Coagulation Profile**: PT, INR, APTT

### 🎯 Cancer Diagnosis & Staging
- **TNM Staging**: Primary tumor, nodes, metastasis classification
- **Molecular Markers**: EGFR, ALK, KRAS, MSI, PDL1
- **Hormone Receptors**: ER, PR status and percentages
- **HER2 Status**: Detailed testing results
- **Ki-67 Index**: Proliferation marker
- **Grade & Classification**: WHO grading systems

### 💉 Treatment Planning
- **Chemotherapy**: Regimens, cycles, response tracking
- **Radiotherapy**: Dose planning, fractionation, outcomes
- **Surgical Planning**: Procedure details, margin status, pathology correlation
- **Targeted Therapy**: Drug selection, duration, side effects
- **Hormone Therapy**: Treatment planning and duration
- **Immunotherapy: Drug selection, cycles, response

### 📊 Dashboard
- **Patient Statistics**: Total patients, new registrations, follow-up counts
- **Quick Actions**: Add patient, view reports, system overview

## Tech Stack

### Frontend
- **Framework**: Next.js 16.1.6 (App Router, RSC enabled)
- **UI Library**: shadcn/ui (Radix UI primitives + Tailwind CSS)
- **Language**: TypeScript 5.3+
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner (toast notifications)
- **Routing**: File-based routing with dynamic routes
- **Build Tool**: Turbopack (via Next.js)

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express 4.18.2
- **Database**: SQLite (sql.js WASM) - Browser-compatible database
- **File Uploads**: Multer
- **Architecture**: ES Modules, RESTful API design

### Database
- **Type**: SQLite (sql.js)
- **Schema**: Relational with 83+ tables
- **Features**:
  - Foreign key relationships
  - Indexed queries
  - Views for patient summaries
  - Automatic migrations
- **Tables Include**: Patient, PastRecords, PastSurgeries, PatientAddictions, PatientDrinks, PatientFoods, Lab test tables (CBC, LFT, etc.), Imaging tables (CT, MRI, Ultrasound, etc.), Treatment tables (ChemoTherapy, RadioTherapy, etc.), Reports, FamilyHistory

### Development Tools
- **Build System**: Next.js Turbopack
- **Package Managers**: npm, pnpm support
- **Code Quality**: ESLint, TypeScript
- **Version Control**: Git

## Architecture

### Project Structure
```
ehr-lite/
├── backend/               # Express.js API server
│   ├── src/
│   │   ├── db/            # Database schema, migrations, queries
│   │   ├── routes/         # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── utils/          # Utilities (image handling, UUID)
│   │   └── server.js      # Express server entry
│   ├── migrations/        # Database migration scripts
│   ├── data/              # SQLite database files
│   └── package.json
├── frontend/              # Next.js 14 application
│   ├── app/               # Pages and layouts
│   │   ├── onboarding/new/  # Patient onboarding wizard
│   │   ├── patients/[id]/    # Patient detail views
│   │   └── ...
│   ├── components/       # Reusable UI components
│   │   ├── ui/            # shadcn/ui base components
│   │   ├── onboarding/    # Onboarding step components
│   │   ├── patients/       # Patient-specific components
│   │   └── shared/         # Shared UI elements
│   ├── lib/               # Utilities, API clients, types
│   ├── hooks/             # React Query hooks
│   └── public/            # Static assets
└── docs/                 # Project documentation
```

### Key Patterns

**Lookup Data**: 
- Master tables for dropdowns (BloodGroups, Qualifications, Occupations, Districts, etc.)
- Type-safe dropdowns with SearchableSelect component for long lists
- Seeded reference data

**Image Handling**:
- Organized by patient ID for easy management
- Automatic filename generation with prefixes
- Size and type validation (5MB limit, jpg/png/pdf)
- ImageLightbox component for viewing

**Wizard Pattern**:
- Multi-step forms with progress indicators
- Validation per step
- Data persistence at completion points
- Mock data buttons for testing

**API Integration**:
- RESTful endpoints with standardized responses
- Success/error response wrapper
- Optimistic updates for better UX

## Installation & Setup

### Prerequisites
- Node.js 20+
- npm or pnpm

### Backend Setup
```bash
cd backend
npm install
npm run init-db    # Initialize database
npm run migrate    # Create all tables
npm run seed        # Seed lookup data (optional)
npm start          # Start server on port 4000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev        # Start dev server on port 3000
```

### Production Build
```bash
cd frontend
npm run build
npm start
```

## Environment Variables

### Backend
- `PORT`: Server port (default: 4000)
- `DATA_DIR`: Database directory path

### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:4000/api)

## Database

The SQLite database contains 83+ tables organized into:

1. **Patient Management**: Patient, Registration, Contact info
2. **Medical History**: FamilyHistory, PresentingComplaint, Comorbidities
3. **Lifestyle**: PatientAddictions, PatientDrinks, PatientFoods
4. **Lab Results**: CBC, LFT, BloodSugar, Electrolytes, TumorMarkers, etc.
5. **Imaging**: CTScan, MRI, UltraSound, PetScan, Mammography, etc.
6. **Pathology**: BoneMarrowBiopsy, Cytogenetics, MolecularTest
7. **Treatments**: ChemoTherapy, RadioTherapy, HormonalTherapy, TargettedTherapy
8. **Reports**: Report metadata and images
9. **Past Records**: Previous treatments (NEW)
10. **Past Surgeries**: Surgical procedures with images (NEW)

## Usage

### Adding a New Patient
1. Navigate to `/onboarding/new`
2. Complete the 4-step wizard:
   - **Basic Info**: Demographics, contact, address, medical history
   - **Habits**: Smoking, tobacco, alcohol tracking
   - **Past Records**: Previous treatments (optional)
   - **Past Surgeries**: Surgical history with images (optional)
3. Patient is automatically created with unique PatientID

### Viewing Patient Details
1. Click on any patient from the patient list
2. View 7 tabs of information:
   - **Overview**: Patient demographics summary
   - **History**: Medical history and family history
   - **Habits**: Lifestyle and addiction tracking
   - **Past Records**: Previous treatments
   - **Surgeries**: Surgical procedures with documents
   - **Diagnoses**: Cancer diagnosis with TNM staging
   - **Reports**: Uploaded documents and images

### Uploading Reports
1. Go to patient details → Reports tab
2. Click "Upload Report"
3. Enter report type, date, and notes
4. Capture image from camera or upload file
5. Report is saved and linked to patient

### Searching Patients
1. Use the search bar on the home page
2. Search by name, registration number, or contact
3. Results update in real-time as you type

## Data Organization

### Patient Centric
- All data linked via `PatientID` foreign key
- Cascade deletes prevent orphaned records
- Organized by care type (labs, imaging, treatments, reports)

### Temporal Tracking
- `CreatedAt` and `UpdatedAt` timestamps
- Surgery dates and report dates
- Treatment start/end dates
- Follow-up examination dates

### Structured Data
- Enumerated values for dropdowns (Gender, MaritalStatus, etc.)
- Integer foreign keys for master tables
- Type-safe database access with schema definitions

## Security Considerations
- Patient data stored locally (no cloud storage by default)
- File upload validation (type, size)
- SQL injection prevention (parameterized queries)
- CORS enabled for development

## Future Enhancements
- Multi-language support
- Export data to PDF/printable formats
- Advanced reporting and analytics
- Integration with hospital information systems
- Offline mode support
- User authentication and role-based access

## License & Attribution
- Patient data privacy protected
- Built for oncology care workflow optimization
- Not intended for clinical diagnosis without physician verification

## Contact & Support
- For technical issues or feature requests, refer to project documentation
- Built using Spec-Driven Development methodology

---

*Last Updated: June 2024*
