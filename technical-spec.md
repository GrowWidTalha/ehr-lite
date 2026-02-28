1. System Overview
Goal

A local first Electronic Health Record system that:

Runs fully offline

Stores patient records locally

Stores report images locally

Uses phone or webcam camera

Starts using one double click .bat file

No cloud dependency

Architecture
Windows PC
│
├── start-app.bat
│
├── backend (Express server)
│   ├── API
│   ├── SQLite database
│   └── File storage
│
├── frontend (Next.js app)
│   └── UI
│
└── data folder
    ├── database.db
    └── patient-images/
2. Technology Stack
Frontend

Next.js 14+

TypeScript

Tailwind CSS

React Hook Form

Zod

Fetch API

Runs on:

http://localhost:3000
Backend

Node.js + Express

Responsibilities:

CRUD patients

Upload images

Serve images

Manage SQLite

Runs on:

http://localhost:4000
Database

SQLite with better-sqlite3

File location:

/data/database.db

Implementation:

- better-sqlite3 for direct SQL queries
- Prepared statements for performance
- WAL mode enabled for concurrent access
- Foreign keys enabled

Image Storage

Local filesystem.

Structure:

/data/patient-images/

   /patient-uuid-1/
      report-uuid-1.jpg
      report-uuid-2.jpg

   /patient-uuid-2/
      report-uuid-3.jpg

Database stores only file path.

3. Folder Structure
ehr-system/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── db/
│   │   ├── services/
│   │   └── server.ts
│   └── package.json
│
├── data/
│   ├── database.db
│   └── patient-images/
│
├── package.json
├── start-app.bat
└── README.md
4. Database Schema

See `.specify/memory/database-schema.md` for complete schema design.

Summary (12 core tables):

Core Tables:
- patients - Demographics, contact info, registration
- patient_vitals - Height, weight, blood group
- patient_history - Medical history, family history
- patient_habits - Smoking, tobacco, alcohol use

Oncology Tables:
- cancer_diagnoses - Type, stage, grade, WHO classification
- previous_treatments - Prior chemo, RT, surgery
- pathology_reports - Surgical pathology findings
- biomarker_tests - ER, PR, HER2, Ki-67, IHC markers
- imaging_studies - CT, MRI, PET, US, etc.
- treatment_plans - Planned treatment approach
- treatment_sessions - Actual treatments delivered

Document Storage:
- reports - Uploaded images and documents

File Storage:
/data/
├── database.db
└── patient-images/
    └── {patient_uuid}/
        └── {report_uuid}.jpg
5. Backend API Spec

Base URL:

http://localhost:4000/api

Health & Info
- GET /api/health - Server health check with database stats
- GET /api - API documentation and available endpoints

Patients
- GET /api/patients - List all patients (search, limit, offset)
- GET /api/patients/:id - Get single patient
- POST /api/patients - Create new patient
- PUT /api/patients/:id - Update patient
- DELETE /api/patients/:id - Delete patient (cascade)

Patient Vitals
- GET /api/patients/:id/vitals - Get vitals history
- POST /api/patients/:id/vitals - Add vitals record

Patient History
- GET /api/patients/:id/history - Get medical history
- POST /api/patients/:id/history - Create/update history

Patient Habits
- GET /api/patients/:id/habits - Get habits
- POST /api/patients/:id/habits - Create/update habits

Patient Diagnoses
- GET /api/patients/:id/diagnoses - Get cancer diagnoses

Images (Universal)
- POST /api/images - Upload image for any entity
  - Form data: entity_type, entity_id, caption, sequence, image (file)
  - Valid entity_types: patient_vitals, patient_history, previous_treatments,
    pathology_reports, biomarker_tests, imaging_studies, treatment_sessions, reports
- GET /api/images - Get images by entity_type, entity_id, or patient_id
- GET /api/images/:id - Get single image
- PATCH /api/images/:id - Update image metadata
- DELETE /api/images/:id - Delete image

Reports (General Documents)
- GET /api/reports - List reports (filter by patient_id, diagnosis_id, report_type)
- GET /api/reports/:id - Get single report
- POST /api/reports - Create new report
- PUT /api/reports/:id - Update report
- DELETE /api/reports/:id - Delete report
- GET /api/reports/:id/images - Get report images
- POST /api/reports/:id/images - Upload image for report

Static Files
- GET /images/:path - Serve image files from /data/patient-images/

6. Image Upload Flow

Frontend:

Open camera

Capture image

Convert to file

Send multipart request

Backend:

Generate UUID

Create patient folder if not exists

Save image

Save record in database

7. Backend Core Components
server.ts

Starts Express server.

Responsibilities:

Load routes

Connect database

Enable CORS

Serve images folder

db.ts

Creates SQLite connection.

routes/

patients.routes.ts
reports.routes.ts

services/

patient.service.ts
report.service.ts

Handles business logic.

8. Frontend Pages
Pages Required

Patients List

/patients

Create Patient

/patients/new

Patient Detail

/patients/[id]

Upload Report

/patients/[id]/upload
9. Camera Integration

Use browser API:

navigator.mediaDevices.getUserMedia

Works on:

Laptop webcam

Mobile phone browser

Tablet

Alternative:

Simple file upload fallback.

10. Root package.json

Controls both frontend and backend.

scripts:

dev
frontend
backend

dev runs both using concurrently.

11. BAT Launcher Spec

File:

start-app.bat

Responsibilities:

Navigate to project

Start backend

Start frontend

User flow:

Double click → system starts

Browser opens manually or automatically.

12. Data Persistence Model

Everything stored locally:

Database:

data/database.db

Images:

data/patient-images/

If PC restarts → data remains.

13. Error Handling Requirements

Backend must handle:

Invalid patient ID

Missing image

DB failure

File write failure

Frontend must show:

Success message

Error message

14. Security Spec (Local System)

Required minimum:

Input validation using Zod

File type validation (jpg/png only)

File size limit (5MB recommended)

Optional later:

Login system

Encryption

15. Backup Strategy (Important for Clinics)

Manual backup:

User copies:

data/

folder to USB.

Automatic backup (future):

Daily zip archive.

16. Runtime Requirements

Target machine:

Windows 10 or 11
RAM: 4GB minimum
Node.js installed

17. Startup Flow

User double clicks:

start-app.bat

System:

Starts backend → localhost:4000
Starts frontend → localhost:3000

User opens browser.