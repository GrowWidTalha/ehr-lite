# Data Model: Excel Data Operations & Automated Backup

**Feature**: 002-excel-data-ops
**Date**: 2026-03-02
**Phase**: Phase 1 - Design & Contracts

## Overview

This document defines the data model for Excel import/export tracking and automated backup management. Note that patient data entities (patients, diagnoses, treatments, etc.) use the existing database schema - this model only defines NEW entities for tracking import/export/backup operations.

---

## New Entities

### 1. Import Log

Tracks Excel import operations executed via the import script.

**Purpose**: Audit trail for data migrations, troubleshooting, and validation tracking.

**Schema**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | TEXT (UUID) | ✅ | Unique identifier for this import job |
| timestamp | TEXT (ISO8601) | ✅ | When import was executed |
| source_file | TEXT | ✅ | Path to source Excel file |
| rows_processed | INTEGER | ✅ | Total rows read from Excel |
| rows_imported | INTEGER | ✅ | Successfully imported patient records |
| rows_skipped | INTEGER | ✅ | Rows with validation errors that were skipped |
| error_log | TEXT (JSON) | | Array of error details: `[{row, column, error}]` |
| status | TEXT | ✅ | Job status: `completed`, `partial`, `failed` |
| duration_ms | INTEGER | ✅ | Import execution time in milliseconds |

**Storage**: JSON log file at `/data/logs/import-YYYY-MM-DD.json` (one file per day)

**Rationale**: JSON file storage avoids schema changes to core database. Import is infrequent, so query performance not critical.

---

### 2. Export Job

Tracks Excel export operations initiated from the UI.

**Purpose**: Audit trail for data exports, user accountability, and troubleshooting.

**Schema**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | TEXT (UUID) | ✅ | Unique identifier for this export job |
| timestamp | TEXT (ISO8601) | ✅ | When export was initiated |
| patient_count | INTEGER | ✅ | Number of patients exported |
| file_name | TEXT | ✅ | Generated Excel filename (with timestamp) |
| file_path | TEXT | ✅ | Full path to generated Excel file |
| file_size_bytes | INTEGER | ✅ | Size of generated Excel file |
| initiated_by | TEXT | | User/session identifier (if available) |
| status | TEXT | ✅ | Job status: `pending`, `completed`, `failed` |
| duration_ms | INTEGER | ✅ | Export execution time in milliseconds |

**Storage**: JSON log file at `/data/logs/export-YYYY-MM-DD.json`

**Rationale**: JSON file storage for consistency with import logs. Export tracking helps identify who exported data and when.

---

### 3. Backup

Tracks automated and manual backup operations.

**Purpose**: Backup inventory, restore planning, and backup health monitoring.

**Schema**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | TEXT (UUID) | ✅ | Unique identifier for this backup |
| timestamp | TEXT (ISO8601) | ✅ | When backup was created |
| path | TEXT | ✅ | Full path to backup archive file |
| size_bytes | INTEGER | ✅ | Size of backup archive in bytes |
| status | TEXT | ✅ | Backup status: `complete`, `incomplete`, `failed` |
| type | TEXT | ✅ | Backup trigger: `automatic`, `manual` |
| database_included | BOOLEAN | ✅ | Whether database.db was included |
| images_included | BOOLEAN | ✅ | Whether patient-images/ was included |
| error_message | TEXT | | Error details if status is `failed` |
| verification_passed | BOOLEAN | ✅ | Whether archive integrity check passed |

**Storage**: JSON index file at `/data/backups/index.json` + individual backup metadata in each backup folder

**Index File Structure**:
```json
{
  "last_updated": "2026-03-02T14:30:00Z",
  "backups": [
    {
      "id": "uuid-1",
      "timestamp": "2026-03-02T02:00:00Z",
      "path": "/data/backups/2026-03-02/backup-020000.zip",
      "size_bytes": 15728640,
      "status": "complete",
      "type": "automatic"
    }
  ]
}
```

**Rationale**: Centralized index enables quick backup listing without scanning filesystem. JSON format is human-readable for manual inspection.

---

### 4. Excel Column Mapping

Configuration defining how each of the 82 Excel columns maps to database fields.

**Purpose**: Maintainable field mapping, easy updates when Excel format changes, validation rules.

**Schema** (Configuration Object):

```javascript
const EXCEL_COLUMN_MAPPING = {
  // Demographics -> patients table
  'Reg No': { table: 'patients', field: 'registration_number', required: false },
  'Reg. Date': { table: 'patients', field: 'registration_date', required: false, type: 'date' },
  'Name & Sur Name': { table: 'patients', field: 'full_name', required: true },
  'Age': { table: 'patients', field: 'age', required: true, type: 'integer', min: 0, max: 150 },
  'Sex': { table: 'patients', field: 'sex', required: true, enum: ['M', 'F'] },
  'Marital Status': { table: 'patients', field: 'marital_status', required: false },
  'Children': { table: 'patients', field: 'children_count', required: false, type: 'integer' },
  'Sibling': { table: 'patients', field: 'siblings_count', required: false, type: 'integer' },
  'Language': { table: 'patients', field: 'language', required: false },
  'Territory': { table: 'patients', field: 'territory', required: false },
  'Contact No': { table: 'patients', field: 'contact_number', required: false },
  'CNIC NO': { table: 'patients', field: 'cnic_number', required: false },
  'Education': { table: 'patients', field: 'education', required: false },

  // Vitals -> patient_vitals table
  'Height': { table: 'patient_vitals', field: 'height_cm', required: false, type: 'float' },
  'Weight': { table: 'patient_vitals', field: 'weight_kg', required: false, type: 'float' },
  'Blood Group': { table: 'patient_vitals', field: 'blood_group', required: false, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },

  // History -> patient_history table
  'History': { table: 'patient_history', field: 'medical_history', required: false },
  'DM - HTN/IHD - HCV/HBV - Others': { table: 'patient_history', field: 'comorbidities', required: false },
  'Family History of Cancer': { table: 'patient_history', field: 'family_cancer_history', required: false },

  // Habits -> patient_habits table (multiple records per patient)
  'Smoking': { table: 'patient_habits', field: 'habit_type', constant: 'smoking', durationField: 'Quantity' },
  'Quantity': { table: 'patient_habits', field: 'duration', required: false },
  'Pan': { table: 'patient_habits', field: 'habit_type', constant: 'pan', durationField: 'Quantity2' },
  'Quantity2': { table: 'patient_habits', field: 'duration', required: false },
  'Gutka': { table: 'patient_habits', field: 'habit_type', constant: 'gutka', durationField: 'Quantity3' },
  'Quantity3': { table: 'patient_habits', field: 'duration', required: false },
  'Naswar': { table: 'patient_habits', field: 'habit_type', constant: 'naswar', durationField: 'Quantity4' },
  'Quantity4': { table: 'patient_habits', field: 'duration', required: false },
  'Alcohol': { table: 'patient_habits', field: 'habit_type', constant: 'alcohol', durationField: 'Quantity5' },
  'Quantity5': { table: 'patient_habits', field: 'duration', required: false },
  'Others': { table: 'patient_habits', field: 'habit_type', constant: 'other' },
  'Quit Period': { table: 'patient_habits', field: 'quit_period', required: false },

  // Diagnosis -> cancer_diagnoses table
  'Type of Cancer': { table: 'cancer_diagnoses', field: 'cancer_type', required: false },
  'Stage': { table: 'cancer_diagnoses', field: 'stage', required: false },
  'Grade': { table: 'cancer_diagnoses', field: 'grade', required: false },
  'WHO': { table: 'cancer_diagnoses', field: 'who_classification', required: false, type: 'integer' },

  // Previous Treatments -> previous_treatments table (multiple records per patient)
  'Previous Chemo': { table: 'previous_treatments', field: 'treatment_type', constant: 'chemotherapy' },
  'Previous RT': { table: 'previous_treatments', field: 'treatment_type', constant: 'radiation_therapy' },
  'Previous Targeted / TKI Therapy': { table: 'previous_treatments', field: 'treatment_type', constant: 'targeted_therapy' },
  'Previous HT': { table: 'previous_treatments', field: 'treatment_type', constant: 'hormonal_therapy' },
  'Previous IT': { table: 'previous_treatments', field: 'treatment_type', constant: 'immunotherapy' },
  'Surgery Other Than Cancer': { table: 'previous_treatments', field: 'treatment_type', constant: 'other_surgery' },
  'Previous Surgery': { table: 'previous_treatments', field: 'surgery_details', required: false },
  '2nd Surgery': { table: 'previous_treatments', field: 'second_surgery_details', required: false },

  // Pathology -> pathology_reports table
  'Pathological Stage': { table: 'pathology_reports', field: 'pathological_stage', required: false },
  'Tumor Size': { table: 'pathology_reports', field: 'tumor_size', required: false },
  'Depth': { table: 'pathology_reports', field: 'depth', required: false },
  'Margins': { table: 'pathology_reports', field: 'margins', required: false },
  'LVI': { table: 'pathology_reports', field: 'lymphovascular_invasion', required: false },
  'PNI': { table: 'pathology_reports', field: 'perineural_invasion', required: false },
  'Nodes Recover': { table: 'pathology_reports', field: 'nodes_recovered', required: false, type: 'integer' },
  'Nodes Involved': { table: 'pathology_reports', field: 'nodes_involved', required: false, type: 'integer' },
  'Extra Node Ext': { table: 'pathology_reports', field: 'extranodal_extension', required: false },
  'Adequate. Inadequate Surgery': { table: 'pathology_reports', field: 'surgery_adequacy', required: false },
  'Recurence': { table: 'pathology_reports', field: 'recurrence', required: false },

  // Biomarkers -> biomarker_tests table
  'ER': { table: 'biomarker_tests', field: 'er_status', required: false },
  'PR': { table: 'biomarker_tests', field: 'pr_status', required: false },
  'Her2-U': { table: 'biomarker_tests', field: 'her2_status', required: false },
  'Ki-67': { table: 'biomarker_tests', field: 'ki67_percentage', required: false, type: 'integer' },
  'Mitosis/10HPF': { table: 'biomarker_tests', field: 'mitosis_count', required: false, type: 'integer' },
  'IHC Markers / Tumor Markers': { table: 'biomarker_tests', field: 'other_markers', required: false },

  // Imaging -> imaging_studies table (multiple records per patient)
  'Ct Scane': { table: 'imaging_studies', field: 'imaging_type', constant: 'ct_scan' },
  'MRI': { table: 'imaging_studies', field: 'imaging_type', constant: 'mri' },
  'Pet Scane': { table: 'imaging_studies', field: 'imaging_type', constant: 'pet_scan' },
  'U/Sound': { table: 'imaging_studies', field: 'imaging_type', constant: 'ultrasound' },
  'Mammogram': { table: 'imaging_studies', field: 'imaging_type', constant: 'mammogram' },
  'Bone Scane': { table: 'imaging_studies', field: 'imaging_type', constant: 'bone_scan' },
  'Echo': { table: 'imaging_studies', field: 'imaging_type', constant: 'echocardiogram' },
  'BSC': { table: 'imaging_studies', field: 'imaging_type', constant: 'bsc' },

  // Treatment Plan -> treatment_plans table
  'Plan': { table: 'treatment_plans', field: 'treatment_plan', required: false },
  'Surgery': { table: 'treatment_plans', field: 'surgery_planned', required: false, type: 'boolean' },
  'Radical': { table: 'treatment_plans', field: 'radical_surgery', required: false, type: 'boolean' },
  'Pallative': { table: 'treatment_plans', field: 'palliative_care', required: false, type: 'boolean' },
  'Neo ADJ': { table: 'treatment_plans', field: 'neoadjuvant_therapy', required: false, type: 'boolean' },
  'ADJ': { table: 'treatment_plans', field: 'adjuvant_therapy', required: false, type: 'boolean' },
  'Induction Chemo': { table: 'treatment_plans', field: 'induction_chemotherapy', required: false, type: 'boolean' },
  'Chemotherapy': { table: 'treatment_plans', field: 'chemotherapy_regimen', required: false },
  'Hormonal Therapy': { table: 'treatment_plans', field: 'hormonal_therapy', required: false },
  'Targeted Therapy / TKI': { table: 'treatment_plans', field: 'targeted_therapy', required: false },
  'Radio Therapy': { table: 'treatment_plans', field: 'radiation_therapy', required: false },
  'Brachy Therapy': { table: 'treatment_plans', field: 'brachytherapy', required: false },
  'Immuno Theray': { table: 'treatment_plans', field: 'immunotherapy', required: false }
};
```

**Storage**: JavaScript configuration file at `backend/src/utils/excel.mapper.js`

**Rationale**: Centralized mapping configuration makes it easy to update when Excel format changes. Each mapping entry defines the target table, field, validation rules, and transformation requirements.

---

## Entity Relationships

```
┌─────────────────┐
│   Import Log    │ (JSON file)
│ ─────────────── │
│ id              │
│ timestamp       │
│ source_file     │
│ rows_*          │
│ error_log       │
│ status          │
└─────────────────┘

┌─────────────────┐
│   Export Job    │ (JSON file)
│ ─────────────── │
│ id              │
│ timestamp       │
│ patient_count   │
│ file_name       │
│ status          │
└─────────────────┘

┌─────────────────┐
│     Backup      │ (JSON index)
│ ─────────────── │
│ id              │
│ timestamp       │
│ path            │
│ size_bytes      │
│ status          │
│ type            │
└─────────────────┘

┌─────────────────────────────┐
│  Excel Column Mapping       │ (JS config)
│  ─────────────────────────  │
│  82 column definitions      │
│  → table, field, validation │
└─────────────────────────────┘

         (maps to)
    ┌─────────────────────────────────┐
    │     Existing Patient Data       │
    │  ─────────────────────────────  │
    │  patients                       │
    │  patient_vitals                 │
    │  patient_history                │
    │  patient_habits                 │
    │  cancer_diagnoses               │
    │  previous_treatments            │
    │  pathology_reports              │
    │  biomarker_tests                │
    │  imaging_studies                │
    │  treatment_plans                │
    └─────────────────────────────────┘
```

---

## Validation Rules

### Import Validation

| Rule | Description | Error Action |
|------|-------------|--------------|
| Required columns | Name & Sur Name, Age, Sex must be present | Skip row, log error |
| Data types | Age must be numeric, Sex must be M/F | Skip row, log error |
| Value ranges | Age: 0-150, Height/Weight: positive | Skip row, log error |
| Date formats | Reg. Date must be valid date | Set to null, log warning |
| Empty cells | Treat as null, not error | Continue processing |

### Export Validation

| Rule | Description | Action |
|------|-------------|--------|
| Required fields | All patients must have at least name | Export with empty cells for missing data |
| Date formatting | All dates in YYYY-MM-DD format | Apply format transformation |
| Enum values | Sex, blood group use standard values | Map to Excel format |

### Backup Validation

| Rule | Description | Action |
|------|-------------|--------|
| File existence | database.db and patient-images/ must exist | Fail backup, log error |
| Disk space | At least 2x current data size available | Pre-check, fail if insufficient |
| Archive integrity | Zip file can be opened | Verify after creation |
| Index update | backups/index.json updated | Atomic write operation |

---

## State Transitions

### Import Job States

```
[ready] → [validating] → [prompting] → [importing] → [completed]
                                      ↓
                                   [cancelled]
```

### Export Job States

```
[pending] → [generating] → [completed]
             ↓
          [failed]
```

### Backup States

```
[scheduled] → [running] → [complete]
               ↓
            [failed]
```

---

## File Organization

```
/data/
├── database.db              # Existing SQLite database
├── patient-images/          # Existing image storage
├── backups/
│   ├── index.json           # Backup inventory index
│   └── 2026-03-02/
│       ├── backup-020000.zip
│       └── metadata.json    # Per-backup metadata
└── logs/
    ├── import-2026-03-02.json
    └── export-2026-03-02.json
```

---

## Next Steps

With data model defined:
1. Generate `contracts/api.yaml` with endpoint specifications
2. Generate `quickstart.md` with usage instructions
3. Run `/sp.tasks` to generate implementation task list
