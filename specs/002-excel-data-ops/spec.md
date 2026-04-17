# Feature Specification: Excel Data Operations & Automated Backup

**Feature Branch**: `002-excel-data-ops`
**Created**: 2026-03-02
**Status**: Draft
**Input**: User description: "Add three new features to the EHR Lite application: 1) EXCEL TO DATABASE IMPORT - Import patient data from existing Onco 2025.xlsx file (82 columns flat structure). Map Excel columns to normalized database schema. Append only mode. Interactive validation prompts. 2) DATABASE TO EXCEL EXPORT - Export all patient data in same structure as Onco 2026.xlsx (82 columns flat format). Manual export button in UI. 3) AUTOMATED LOCAL BACKUP - Daily automatic backups of database.db and patient-images/ folder to /data/backups/ with timestamp. Unlimited retention. Compressed archive format."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Excel Data Import (Priority: P1)

A clinic administrator needs to import existing patient data from an Excel file (Onco 2025.xlsx) into the EHR system. The Excel file contains 82 columns of patient information in a flat structure that needs to be mapped to the system's normalized database schema. The administrator wants to add all records as new patients without overwriting existing data, and wants to review any validation errors before proceeding.

**Why this priority**: Critical for onboarding - clinics have existing patient data that must be migrated to the new system before they can use it effectively.

**Independent Test**: Can be fully tested by preparing an Excel file with sample patient data, running the import process, and verifying that patients are correctly created in the database with all demographics, vitals, history, habits, diagnoses, and treatments properly mapped from the flat Excel structure to the normalized database tables.

**Acceptance Scenarios**:

1. **Given** an Excel file with 100 patient records in the Onco format (82 columns), **When** the administrator selects the file and starts import, **Then** the system validates all rows and displays a summary showing "100 rows ready to import" with no errors
2. **Given** an Excel file with 5 rows containing missing required fields (Name, Age, Sex), **When** the administrator starts import, **Then** the system displays a validation error summary showing exactly which rows and columns have problems and asks "Continue with valid rows only? (5 rows will be skipped)"
3. **Given** the administrator clicks "Continue" after reviewing validation errors, **When** the import proceeds, **Then** the system creates patient records for all valid rows, logging each skipped row with reason
4. **Given** an Excel file with a patient who has smoking history (Smoking="15 Years", Quantity="1 pack daily"), **When** imported, **Then** the patient_habits table contains a record with habit_type="smoking", quantity="1 pack daily", duration="15 Years"
5. **Given** an Excel file with a cancer diagnosis (Type of Cancer="Ca Breast", Stage="Stage-2", Grade="Grade-2"), **When** imported, **Then** the cancer_diagnoses table contains the mapped diagnosis record linked to the correct patient
6. **Given** an Excel file with existing registration numbers that match patients already in the database, **When** imported in append-only mode, **Then** new patient records are created (no updates or deduplication occurs)

---

### User Story 2 - Excel Data Export (Priority: P2)

A clinic administrator needs to export all patient data from the EHR system to an Excel file for reporting, sharing with referring physicians, or creating portable backups. The exported file must match the same 82-column flat structure as the original Onco Excel format for compatibility with existing workflows and external systems.

**Why this priority**: Important for data portability and reporting - clinics need to share patient data and create reports in the familiar Excel format they've historically used.

**Independent Test**: Can be fully tested by creating sample patients with complete data across all tables (demographics, vitals, history, habits, diagnoses, treatments), clicking the export button, and verifying the generated Excel file has all 82 columns populated correctly with data properly flattened from the normalized database structure.

**Acceptance Scenarios**:

1. **Given** the database contains 50 patients with complete data across all related tables, **When** the administrator clicks "Export to Excel" on the dashboard, **Then** the system generates an Excel file with exactly 82 columns matching the Onco template structure
2. **Given** a patient with vitals (Height=174cm, Weight=80kg, Blood Group="B+"), **When** exported, **Then** the Excel row contains these values in the correct columns (Height, Weight, Blood Group)
3. **Given** a patient with multiple habit records (smoking, pan, alcohol), **When** exported, **Then** the Excel row contains all habit values in their respective columns (Smoking, Quantity, Pan, Quantity2, Alcohol, Quantity5)
4. **Given** a patient with a cancer diagnosis and biomarker tests, **When** exported, **Then** the Excel row contains Type of Cancer, Stage, Grade, WHO, ER, PR, Her2-U, Ki-67 in the correct columns
5. **Given** the export process completes successfully, **When** the file is downloaded, **Then** the filename includes the timestamp (e.g., "ehr-export-2026-03-02-143022.xlsx")
6. **Given** a patient with no data in certain optional fields (e.g., biomarker tests not performed), **When** exported, **Then** those Excel cells are empty (not "null" or "N/A" text)

---

### User Story 3 - Automated Daily Backup (Priority: P3)

The EHR system automatically creates daily backups of all patient data (database and images) to protect against data loss. The clinic administrator wants automatic backups to happen without manual intervention, storing backups locally with timestamps so they can restore to any previous day's state if needed.

**Why this priority**: Important for data safety - automated backups ensure data is protected even if the administrator forgets to manually backup, which is critical for patient data compliance and peace of mind.

**Independent Test**: Can be fully tested by configuring the backup schedule, waiting for the backup to trigger (or manually triggering the scheduled job), and verifying that a compressed archive is created in the backups folder containing both the database file and all patient images.

**Acceptance Scenarios**:

1. **Given** the backup schedule is set for daily at 2:00 AM, **When** the system time reaches 2:00 AM, **Then** a new backup folder is created at `/data/backups/2026-03-02/` containing a timestamped zip file
2. **Given** the backup runs successfully, **When** the backup archive is extracted, **Then** it contains both `database.db` and the entire `patient-images/` folder structure
3. **Given** multiple daily backups have run over a week, **When** the administrator lists the backups folder, **Then** they see 7 separate backup folders (one per day) named with their respective dates
4. **Given** a backup already exists for today, **When** the backup runs again today (manual trigger), **Then** a new backup file is created with a different timestamp (no overwrite)
5. **Given** the system loses power during backup operation, **When** the system restarts, **Then** the previous backup remains intact and not corrupted
6. **Given** the administrator clicks "Backup Now" button in settings, **When** the manual backup completes, **Then** a success message shows "Backup completed: /data/backups/2026-03-02/backup-143022.zip"

---

### User Story 4 - Manual Backup Trigger (Priority: P3)

A clinic administrator wants to manually trigger an immediate backup before making significant changes (like bulk imports or deletions) or before taking the system offline for maintenance.

**Why this priority**: Provides control and safety - allows administrators to create on-demand backups at critical moments.

**Independent Test**: Can be fully tested by clicking the "Backup Now" button and verifying a backup is immediately created.

**Acceptance Scenarios**:

1. **Given** the administrator is on the Settings page, **When** they click "Backup Now", **Then** the system immediately creates a backup archive and shows a success message with the file path
2. **Given** a backup is in progress, **When** the user clicks "Backup Now" again, **Then** the system shows "Backup already in progress" and disables the button
3. **Given** the backup fails due to insufficient disk space, **When** the error occurs, **Then** the user sees a clear error message "Backup failed: Insufficient disk space"

---

### Edge Cases

- **What happens when** the Excel file has duplicate registration numbers within itself?
- **What happens when** the Excel file contains more than 10,000 rows (performance considerations)?
- **How does the system handle** Excel files with different column names or missing columns entirely?
- **What happens when** a patient image referenced in the database is missing from the patient-images folder during backup?
- **What happens when** disk space runs low during backup operation?
- **How does the system handle** Excel cells with formulas instead of plain values?
- **What happens when** the Excel file has encoding issues (special characters in names)?
- **What happens when** a scheduled backup time is missed because the system was off?
- **What happens when** export is triggered while another export is still in progress?
- **How does the system handle** patients with incomplete data (missing required fields) during export?

## Requirements *(mandatory)*

### Functional Requirements

#### Excel Import Requirements

- **FR-001**: System MUST accept Excel file uploads (.xlsx format) through the file upload interface
- **FR-002**: System MUST validate the Excel file structure contains at least the minimum required columns (Name & Sur Name, Age, Sex)
- **FR-003**: System MUST read data from all 82 columns of the Onco Excel format
- **FR-004**: System MUST map flat Excel columns to normalized database tables:
  - Demographics (Reg No, Reg. Date, Name & Sur Name, Age, Sex, Marital Status, Children, Sibling, Language, Territory, Contact No, CNIC NO, Education) → `patients` table
  - Vitals (Height, Weight, Blood Group) → `patient_vitals` table
  - Medical History (History, DM - HTN/IHD - HCV/HBV - Others, Family History of Cancer) → `patient_history` table
  - Habits (Smoking, Quantity, Pan, Quantity2, Gutka, Quantity3, Naswar, Quantity4, Alcohol, Quantity5, Others, Quit Period) → `patient_habits` table
  - Diagnosis (Type of Cancer, Stage, Grade, WHO) → `cancer_diagnoses` table
  - Previous Treatments (Previous Chemo, Previous RT, Previous Targeted / TKI Therapy, Previous HT, Previous IT, Surgery Other Than Cancer, Previous Surgery, 2nd Surgery) → `previous_treatments` table
  - Pathology (Pathological Stage, Tumor Size, Depth, Margins, LVI, PNI, Nodes Recover, Nodes Involved, Extra Node Ext, Adequate/Inadequate Surgery, Recurence) → `pathology_reports` table
  - Biomarkers (ER, PR, Her2-U, Ki-67, Mitosis/10HPF, IHC Markers / Tumor Markers) → `biomarker_tests` table
  - Imaging (Ct Scane, MRI, Pet Scane, U/Sound, Mammogram, Bone Scane, Echo, BSC) → `imaging_studies` table
  - Treatment Plan (Plan, Surgery, Radical, Pallative, Neo ADJ, ADJ, Induction Chemo, Chemotherapy, Hormonal Therapy, Targeted Therapy / TKI, Radio Therapy, Brachy Therapy, Immuno Theray) → `treatment_plans` table
- **FR-005**: System MUST create new patient records using append-only mode (no updates or deletions)
- **FR-006**: System MUST validate required fields before import (name, age, sex)
- **FR-007**: System MUST display validation errors showing specific row numbers and column names for invalid data
- **FR-008**: System MUST prompt user for confirmation when validation errors are found: "Continue with valid rows only? (N rows will be skipped)"
- **FR-009**: System MUST skip invalid rows and continue importing valid rows when user confirms
- **FR-010**: System MUST log all import operations including timestamp, file name, rows processed, rows imported, rows skipped
- **FR-011**: System MUST generate new UUIDs for all imported records
- **FR-012**: System MUST handle empty cells gracefully (treat as null/empty, not as error)

#### Excel Export Requirements

- **FR-013**: System MUST provide an "Export to Excel" button accessible from the dashboard and patients list page
- **FR-014**: System MUST generate Excel files with exactly 82 columns matching the Onco template format
- **FR-015**: System MUST reverse-map normalized database tables to flat Excel structure (inverse of import mapping)
- **FR-016**: System MUST include all patients and their complete related data (vitals, history, habits, diagnoses, treatments)
- **FR-017**: System MUST generate filenames with timestamps: `ehr-export-YYYY-MM-DD-HHMMSS.xlsx`
- **FR-018**: System MUST populate optional fields with empty cells when data is not present
- **FR-019**: System MUST format dates consistently (YYYY-MM-DD format)
- **FR-020**: System MUST handle multiple related records (e.g., multiple habits) by placing them in appropriate columns
- **FR-021**: System MUST complete export within 60 seconds for up to 1,000 patients
- **FR-022**: System MUST trigger browser download of the generated Excel file

#### Automated Backup Requirements

- **FR-023**: System MUST automatically create daily backups at a configurable time (default: 2:00 AM)
- **FR-024**: System MUST store backups in `/data/backups/` directory with date subfolders (e.g., `/data/backups/2026-03-02/`)
- **FR-025**: System MUST create compressed archive (zip format) containing both `database.db` and `patient-images/` folder
- **FR-026**: System MUST use timestamp filenames for backup archives (e.g., `backup-020000.zip`)
- **FR-027**: System MUST retain all backups indefinitely (no automatic deletion)
- **FR-028**: System MUST provide a "Backup Now" button in the settings UI for manual backup triggers
- **FR-029**: System MUST show backup status (last backup time, backup size, backup location) in the UI
- **FR-030**: System MUST verify backup integrity after creation (archive can be opened)
- **FR-031**: System MUST log all backup operations with timestamp, status, and file size
- **FR-032**: System MUST handle backup failures gracefully and show clear error messages
- **FR-033**: System MUST run missed backups when system restarts if scheduled time was passed
- **FR-034**: System MUST allow only one backup operation at a time (queue manual requests if backup in progress)

### Key Entities

- **Import Job**: Represents a single Excel import operation, containing timestamp, source filename, validation results, row counts (processed, imported, skipped)
- **Export Job**: Represents a single Excel export operation, containing timestamp, patient count, filename, status
- **Backup**: Represents a single backup instance, containing timestamp, backup path, file size, status (complete/incomplete/failed), backup type (automatic/manual)
- **Excel Row Mapping**: Configuration defining how each of the 82 Excel columns maps to database table fields

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can import 1,000 patient records from Excel in under 5 minutes
- **SC-002**: Excel import correctly maps data across all 82 columns with 99% accuracy
- **SC-003**: Users can export all patient data to Excel with a single click
- **SC-004**: Exported Excel files are 100% compatible with the original Onco format (can be opened and read by users familiar with the original format)
- **SC-005**: Daily backups are created automatically within 2 minutes of scheduled time
- **SC-006**: Backup archives include 100% of data (database + images) and can be successfully restored
- **SC-007**: System displays clear validation feedback before any data modification occurs during import
- **SC-008**: Backup status and last backup time are visible to users at all times

### User Experience Outcomes

- **SC-009**: 90% of users can successfully complete an Excel import on first attempt without referring to documentation
- **SC-010**: Import process provides clear progress indication (rows processed, rows remaining)
- **SC-011**: Backup and restore operations require less than 3 clicks to initiate
- **SC-012**: All error messages are actionable and tell the user exactly what went wrong and how to fix it

## Assumptions

1. Excel files will use the specific 82-column Onco format with exact column names as specified
2. Import will always use append-only mode (no updates to existing records)
3. Excel files will contain at most 10,000 rows (performance consideration)
4. The system has sufficient disk space to store backups (at least 2x current data size)
5. The system runs continuously or is started at least once per day for scheduled backups
6. Image files are stored locally and not distributed across multiple storage systems
7. Excel import/export is performed by authenticated users with administrative privileges
8. The Onco Excel format structure remains stable (no frequent changes to column structure)
9. Backup compression uses standard ZIP format compatible with system unzip utilities
10. Date formats in Excel follow YYYY-MM-DD or DD-MM-YYYY formats (system will handle both)

## Scope Boundaries

### In Scope

- Excel to database import with full field mapping
- Database to Excel export with matching format
- Automated daily scheduled backups
- Manual backup trigger functionality
- Validation and error reporting for imports
- Backup status display in UI
- Logging of all import/export/backup operations

### Out of Scope

- Automatic schema migration when Excel format changes
- Cloud backup integration (local backups only)
- Backup encryption
- Differential or incremental backups (always full backups)
- Scheduled exports (export is manual only)
- Real-time sync with external Excel files
- Data transformation beyond direct field mapping
- Backup restore functionality (backup creation only in this feature)
- Import from CSV or other formats (Excel only)
- Export filtering or custom field selection (always full export)
