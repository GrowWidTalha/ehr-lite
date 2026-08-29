# EHR Lite

A local-first Electronic Health Record system designed for clinical and oncology workflows where reliability, privacy, and offline access matter.

## What it solves

EHR Lite lets a clinic manage patient records, oncology diagnoses, treatment history, vital signs, reports, and attached medical images on a local Windows machine. The system runs without a cloud dependency and can be launched through a simple Windows startup script.

## Highlights

- Local patient registration, search, and record management
- Oncology-specific workflows for diagnoses, pathology, biomarkers, imaging, treatment plans, and treatment sessions
- Camera and file-upload support for report images
- SQLite persistence with WAL mode and foreign-key enforcement
- Local file storage for patient images and documents
- Data import/export and backup endpoints
- Offline-friendly Windows startup scripts for clinic operations

## Architecture

```
Next.js frontend  →  Express API  →  SQLite database + local image storage
```

The frontend provides the clinical workflow UI. The backend exposes patient, report, image, dashboard, backup, and export endpoints. Patient data and uploaded report images remain on the local machine.

## Tech stack

- Next.js, React, TypeScript, Tailwind CSS
- Node.js, Express
- SQLite / better-sqlite3
- React Hook Form, Zod, TanStack Query
- Multer, XLSX, Archiver

## Running locally

1. Install dependencies in the root, `backend`, and `frontend` directories.
2. Initialize the database:

   ```bash
   npm run init-db
   ```

3. Start both services:

   ```bash
   npm run dev
   ```

The frontend runs on `http://localhost:3000`; the API runs on `http://localhost:4000`.

## Role

Talha Ali built and maintains this local-first clinical system for a hospital oncology department, translating operational care workflows into reliable software that can run in the clinic without requiring cloud infrastructure.
