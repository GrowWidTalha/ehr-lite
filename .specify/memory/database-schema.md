# EHR Lite Database Schema

**Version**: 1.1.0
**Date**: 2026-02-24
**Source**: Onco 2026.xlsx Analysis

## Design Principles

1. **Fast Data Entry**: Group related fields to minimize form switching
2. **Logical Organization**: Separate entities that change at different rates
3. **Query Efficiency**: Common queries optimized with proper indexing
4. **Local-First**: Simple structure, easy backup and migration
5. **Multiple Images**: Support unlimited images per record

---

## Entity Relationship Overview

```
patients (1) ----< (1) patient_vitals*
  |
  |--< (1) patient_history
  |--< (1) patient_habits
  |
  |--< (many) cancer_diagnoses
  |     |
  |     |--< (many) pathology_reports
  |     |--< (many) biomarker_tests
  |     |--< (many) imaging_studies
  |     |--< (1) treatment_plans
  |     |--< (many) treatment_sessions
  |     |--< (many) previous_treatments
  |
  |--< (many) reports (general documents)
  |
  └──< (many) report_images (links to ALL entities with images)
```

\*patient_vitals supports multiple records for tracking history

---

## Core Tables

### 1. patients

Core patient demographic information - created once, rarely changed.

```sql
CREATE TABLE patients (
    id TEXT PRIMARY KEY,                    -- UUID
    registration_number TEXT UNIQUE,        -- "Reg No" from Excel
    registration_date TEXT,                 -- "Reg. Date"

    -- Core Identity
    full_name TEXT NOT NULL,                -- "Name & Sur Name"
    age INTEGER,                            -- "Age"
    sex TEXT CHECK(sex IN ('Male', 'Female', 'Other')),

    -- Contact
    phone TEXT,                             -- "Contact No"
    cnic TEXT,                              -- "CNIC NO"

    -- Demographics
    marital_status TEXT,                    -- "Marital Status"
    education TEXT,                         -- "Education"
    language TEXT,                          -- "Language"
    territory TEXT,                         -- "Territory"

    -- Family
    children_count INTEGER DEFAULT 0,       -- "Children"
    sibling_count INTEGER DEFAULT 0,        -- "Sibling"

    -- Metadata
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_patients_name ON patients(full_name);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_cnic ON patients(cnic);
CREATE INDEX idx_patients_reg_no ON patients(registration_number);
```

---

### 2. patient_vitals

Physical measurements - **multiple records supported** to track changes over time.

```sql
CREATE TABLE patient_vitals (
    id TEXT PRIMARY KEY,                    -- UUID
    patient_id TEXT NOT NULL,               -- FK: patients.id

    height_cm REAL,                         -- "Height"
    weight_kg REAL,                         -- "Weight"
    blood_group TEXT CHECK(blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),

    recorded_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE INDEX idx_vitals_patient ON patient_vitals(patient_id);
CREATE INDEX idx_vitals_date ON patient_vitals(recorded_at);
```

---

### 3. patient_history

Medical history - supports image attachment for referral documents.

```sql
CREATE TABLE patient_history (
    id TEXT PRIMARY KEY,                    -- UUID
    patient_id TEXT NOT NULL UNIQUE,        -- One record per patient

    presenting_complaint TEXT,              -- "History" - chief complaint
    comorbidities TEXT,                     -- "DM - HTN/IHD - HCV/HBV - Others"
    family_cancer_history TEXT,             -- "Family History of Cancer"

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
```

**Image Support**: Link images via `report_images` table with `entity_type='patient_history'`

---

### 4. patient_habits

Lifestyle habits and substance use - can be updated.

```sql
CREATE TABLE patient_habits (
    id TEXT PRIMARY KEY,                    -- UUID
    patient_id TEXT NOT NULL UNIQUE,        -- One record per patient

    -- Smoking
    smoking_status TEXT CHECK(smoking_status IN ('Never', 'Former', 'Current')),
    smoking_quantity TEXT,                  -- "Quantity" (packs/day, etc.)

    -- Smokeless Tobacco
    pan_use TEXT CHECK(pan_use IN ('Never', 'Former', 'Current')),
    pan_quantity TEXT,                      -- "Quantity2"

    gutka_use TEXT CHECK(gutka_use IN ('Never', 'Former', 'Current')),
    gutka_quantity TEXT,                    -- "Quantity3"

    naswar_use TEXT CHECK(naswar_use IN ('Never', 'Former', 'Current')),
    naswar_quantity TEXT,                   -- "Quantity4"

    -- Alcohol
    alcohol_use TEXT CHECK(alcohol_use IN ('Never', 'Former', 'Current')),
    alcohol_quantity TEXT,                  -- "Quantity5"

    -- Other
    other_habits TEXT,                      -- "Others"
    quit_period TEXT,                       -- "Quit Period"

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
```

---

## Oncology-Specific Tables

### 5. cancer_diagnoses

Each patient can have multiple cancer diagnoses (new primaries, recurrences).

```sql
CREATE TABLE cancer_diagnoses (
    id TEXT PRIMARY KEY,                    -- UUID
    patient_id TEXT NOT NULL,               -- FK: patients.id

    -- Diagnosis Details
    cancer_type TEXT NOT NULL,              -- "Type of Cancer"
    stage TEXT,                             -- "Stage" (I, II, III, IV)
    grade TEXT,                             -- "Grade" (1, 2, 3)
    who_classification TEXT,                -- "WHO"

    diagnosis_date TEXT,                    -- When diagnosed

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE INDEX idx_diagnoses_patient ON cancer_diagnoses(patient_id);
CREATE INDEX idx_diagnoses_type ON cancer_diagnoses(cancer_type);
```

---

### 6. previous_treatments

Treatments received before current presentation. **Supports multiple images** for external records.

```sql
CREATE TABLE previous_treatments (
    id TEXT PRIMARY KEY,                    -- UUID
    diagnosis_id TEXT NOT NULL,             -- FK: cancer_diagnoses.id

    -- Previous Treatment Flags
    previous_chemo TEXT DEFAULT 'No',       -- "Previous Chemo"
    previous_radiotherapy TEXT DEFAULT 'No', -- "Previous RT"
    previous_targeted_therapy TEXT DEFAULT 'No', -- "Previous Targeted / TKI Therapy"
    previous_hormonal TEXT DEFAULT 'No',    -- "Previous HT"
    previous_immunotherapy TEXT DEFAULT 'No', -- "Previous IT"

    -- Surgeries
    previous_surgery TEXT,                  -- "Previous Surgery"
    second_surgery TEXT,                    -- "2nd Surgery"
    non_cancer_surgery TEXT,                -- "Surgery Other Than Cancer"

    notes TEXT,                             -- Additional details

    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (diagnosis_id) REFERENCES cancer_diagnoses(id) ON DELETE CASCADE
);

CREATE INDEX idx_previous_treatments_diagnosis ON previous_treatments(diagnosis_id);
```

**Image Support**: Link images via `report_images` table with `entity_type='previous_treatments'`

---

### 7. pathology_reports

Surgical pathology findings. **Supports multiple images** (biopsy, surgical, re-excision, etc.).

```sql
CREATE TABLE pathology_reports (
    id TEXT PRIMARY KEY,                    -- UUID
    diagnosis_id TEXT NOT NULL,             -- FK: cancer_diagnoses.id

    report_date TEXT,                       -- When performed
    report_type TEXT,                       -- Biopsy, Surgical, Re-excision, Lymph Node

    -- Staging
    pathological_stage TEXT,                -- "Pathological Stage"

    -- Tumor Details
    tumor_size TEXT,                        -- "Tumor Size"
    depth TEXT,                             -- "Depth"
    margins TEXT,                           -- "Margins" (clear, close, involved)

    -- Lymphovascular
    lvi TEXT,                               -- "LVI" (Lymphovascular Invasion)
    pni TEXT,                               -- "PNI" (Perineural Invasion)

    -- Lymph Nodes
    nodes_recovered INTEGER,                -- "Nodes Recover"
    nodes_involved INTEGER,                 -- "Nodes Involved"
    extra_nodal_extension TEXT,             -- "Extra Node Ext"

    -- Surgery Assessment
    surgery_adequacy TEXT,                  -- "Adequate. Inadequate Surgery"

    -- Recurrence
    recurrence TEXT,                        -- "Recurence" [sic]

    notes TEXT,

    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (diagnosis_id) REFERENCES cancer_diagnoses(id) ON DELETE CASCADE
);

CREATE INDEX idx_pathology_diagnosis ON pathology_reports(diagnosis_id);
CREATE INDEX idx_pathology_type ON pathology_reports(report_type);
```

**Image Support**: Link images via `report_images` table with `entity_type='pathology_reports'`

---

### 8. biomarker_tests

IHC and tumor marker results. **Supports multiple images** (different test reports).

```sql
CREATE TABLE biomarker_tests (
    id TEXT PRIMARY KEY,                    -- UUID
    diagnosis_id TEXT NOT NULL,             -- FK: cancer_diagnoses.id

    test_date TEXT,
    test_type TEXT,                         -- IHC, Tumor Markers, Genetic

    -- Breast Cancer Markers
    er_status TEXT,                         -- "ER" (Estrogen Receptor)
    er_percentage INTEGER,

    pr_status TEXT,                         -- "PR" (Progesterone Receptor)
    pr_percentage INTEGER,

    her2_status TEXT,                       -- "Her2-U" (HER2/neu)
    her2_score TEXT,                        -- 0, 1+, 2+, 3+

    ki67_percentage INTEGER,                -- "Ki-67"

    mitosis_count INTEGER,                  -- "Mitosis/10HPF"

    -- Other Markers
    ihc_markers TEXT,                       -- "IHC Markers / Tumor Markers"
    tumor_markers TEXT,                     -- Additional tumor markers

    notes TEXT,

    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (diagnosis_id) REFERENCES cancer_diagnoses(id) ON DELETE CASCADE
);

CREATE INDEX idx_biomarker_diagnosis ON biomarker_tests(diagnosis_id);
CREATE INDEX idx_biomarker_type ON biomarker_tests(test_type);
```

**Image Support**: Link images via `report_images` table with `entity_type='biomarker_tests'`

---

### 9. imaging_studies

Radiology and imaging records. **Supports multiple images** (multiple CT/MRI reports over time).

```sql
CREATE TABLE imaging_studies (
    id TEXT PRIMARY KEY,                    -- UUID
    diagnosis_id TEXT NOT NULL,             -- FK: cancer_diagnoses.id

    study_type TEXT NOT NULL,               -- CT, MRI, PET, US, Mammogram, Bone Scan, Echo, BSC
    study_date TEXT,

    findings TEXT,                          -- Report findings
    indication TEXT,                        -- Why ordered

    notes TEXT,

    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (diagnosis_id) REFERENCES cancer_diagnoses(id) ON DELETE CASCADE
);

CREATE INDEX idx_imaging_diagnosis ON imaging_studies(diagnosis_id);
CREATE INDEX idx_imaging_type ON imaging_studies(study_type);
CREATE INDEX idx_imaging_date ON imaging_studies(study_date);
```

**Image Support**: Link images via `report_images` table with `entity_type='imaging_studies'`

---

### 10. treatment_plans

Planned treatment approach.

```sql
CREATE TABLE treatment_plans (
    id TEXT PRIMARY KEY,                    -- UUID
    diagnosis_id TEXT NOT NULL UNIQUE,      -- One active plan per diagnosis

    plan_type TEXT,                         -- "Plan" - curative, palliative, etc.

    -- Surgical Planning
    surgery_planned TEXT DEFAULT 'No',      -- "Surgery"
    radical_surgery TEXT DEFAULT 'No',      -- "Radical"
    palliative_surgery TEXT DEFAULT 'No',   -- "Pallative"

    -- Chemotherapy Planning
    neoadjuvant_chemo TEXT DEFAULT 'No',    -- "Neo ADJ"
    adjuvant_chemo TEXT DEFAULT 'No',       -- "ADJ"
    induction_chemo TEXT DEFAULT 'No',      -- "Induction Chemo"

    notes TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (diagnosis_id) REFERENCES cancer_diagnoses(id) ON DELETE CASCADE
);
```

---

### 11. treatment_sessions

Actual treatments delivered - can have multiple sessions per modality. **Supports multiple images** (chemo orders, infusion records).

```sql
CREATE TABLE treatment_sessions (
    id TEXT PRIMARY KEY,                    -- UUID
    diagnosis_id TEXT NOT NULL,             -- FK: cancer_diagnoses.id
    plan_id TEXT,                           -- FK: treatment_plans.id

    session_date TEXT,
    treatment_type TEXT NOT NULL,           -- chemo, hormonal, targeted, rt, brachy, immuno

    -- Chemotherapy Details
    chemo_regimen TEXT,                     -- If chemo: regimen name
    chemo_cycle INTEGER,                    -- Cycle number

    -- Radiotherapy Details
    rt_site TEXT,                           -- If RT: treatment site
    rt_dose TEXT,                           -- Dose in Gy
    rt_fractions INTEGER,                   -- Number of fractions

    -- Systemic Therapy Details
    hormonal_agent TEXT,                    -- If hormonal: drug name
    targeted_agent TEXT,                    -- If targeted: drug name
    immunotherapy_agent TEXT,               -- If immuno: drug name

    notes TEXT,

    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (diagnosis_id) REFERENCES cancer_diagnoses(id) ON DELETE CASCADE
    FOREIGN KEY (plan_id) REFERENCES treatment_plans(id) ON DELETE SET NULL
);

CREATE INDEX idx_treatment_diagnosis ON treatment_sessions(diagnosis_id);
CREATE INDEX idx_treatment_date ON treatment_sessions(session_date);
CREATE INDEX idx_treatment_type ON treatment_sessions(treatment_type);
```

**Image Support**: Link images via `report_images` table with `entity_type='treatment_sessions'`

---

## Document & Image Storage

### 12. reports

Uploaded documents, images, and reports (general purpose).

```sql
CREATE TABLE reports (
    id TEXT PRIMARY KEY,                    -- UUID
    patient_id TEXT NOT NULL,               -- FK: patients.id
    diagnosis_id TEXT,                      -- FK: cancer_diagnoses.id (optional)

    title TEXT NOT NULL,                    -- Report title
    report_type TEXT NOT NULL,              -- pathology, radiology, lab, photo, etc.
    notes TEXT,                             -- Additional notes

    report_date TEXT,

    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    FOREIGN KEY (diagnosis_id) REFERENCES cancer_diagnoses(id) ON DELETE SET NULL
);

CREATE INDEX idx_reports_patient ON reports(patient_id);
CREATE INDEX idx_reports_diagnosis ON reports(diagnosis_id);
CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_date ON reports(report_date);
```

**Image Support**: Link images via `report_images` table with `entity_type='reports'`

---

### 13. report_images ⭐ NEW

**Universal image storage table** - supports multiple images for ANY entity.

```sql
CREATE TABLE report_images (
    id TEXT PRIMARY KEY,                    -- UUID

    -- Polymorphic link to any entity
    entity_type TEXT NOT NULL,              -- Table name: 'imaging_studies', 'pathology_reports', etc.
    entity_id TEXT NOT NULL,                -- ID of the record in that table

    -- File info
    image_path TEXT NOT NULL,               -- Relative path: /patient-images/{patient_uuid}/{image_uuid}.jpg
    file_name TEXT,                         -- Original filename
    file_type TEXT,                         -- jpg, png, pdf
    file_size INTEGER,                      -- Bytes

    -- Metadata
    caption TEXT,                           -- Optional description
    sequence INTEGER DEFAULT 0,             -- Order for display (1, 2, 3...)

    captured_at TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now')),

    -- Ensure proper entity linkage
    FOREIGN KEY (entity_id) REFERENCES patients(id) ON DELETE CASCADE  -- Note: This is a generic constraint
);

CREATE INDEX idx_report_images_entity ON report_images(entity_type, entity_id);
CREATE INDEX idx_report_images_patient ON report_images(entity_id);  -- For queries by patient
CREATE INDEX idx_report_images_sequence ON report_images(entity_type, entity_id, sequence);
```

**Valid entity_type values**:
- `'patient_history'` → links to `patient_history.id`
- `'previous_treatments'` → links to `previous_treatments.id`
- `'pathology_reports'` → links to `pathology_reports.id`
- `'biomarker_tests'` → links to `biomarker_tests.id`
- `'imaging_studies'` → links to `imaging_studies.id`
- `'treatment_sessions'` → links to `treatment_sessions.id`
- `'reports'` → links to `reports.id`
- `'patient_vitals'` → links to `patient_vitals.id`

---

## Views for Common Queries

### vw_patient_summary

Complete patient overview for list views.

```sql
CREATE VIEW vw_patient_summary AS
SELECT
    p.id,
    p.registration_number,
    p.full_name,
    p.age,
    p.sex,
    p.phone,
    p.registration_date,
    cd.cancer_type,
    cd.stage,
    cd.grade,
    COUNT(DISTINCT r.id) as report_count,
    COUNT(DISTINCT ri.id) as image_count
FROM patients p
LEFT JOIN cancer_diagnoses cd ON p.id = cd.patient_id
LEFT JOIN reports r ON p.id = r.patient_id
LEFT JOIN report_images ri ON ri.entity_id = p.id
GROUP BY p.id;
```

### vw_diagnosis_detail

Complete diagnosis overview with image counts.

```sql
CREATE VIEW vw_diagnosis_detail AS
SELECT
    cd.id,
    p.full_name,
    p.age,
    p.sex,
    cd.cancer_type,
    cd.stage,
    cd.grade,
    cd.who_classification,
    tp.plan_type,
    COUNT(DISTINCT ts.id) as treatment_count,
    COUNT(DISTINCT pr.id) as pathology_count,
    COUNT(DISTINCT img.id) as image_count
FROM cancer_diagnoses cd
JOIN patients p ON cd.patient_id = p.id
LEFT JOIN treatment_plans tp ON cd.id = tp.diagnosis_id
LEFT JOIN treatment_sessions ts ON cd.id = ts.diagnosis_id
LEFT JOIN pathology_reports pr ON cd.id = pr.diagnosis_id
LEFT JOIN report_images img ON img.entity_id = cd.id
GROUP BY cd.id;
```

### vw_entity_images

Get all images for any entity.

```sql
CREATE VIEW vw_entity_images AS
SELECT
    ri.id as image_id,
    ri.entity_type,
    ri.entity_id,
    ri.image_path,
    ri.caption,
    ri.sequence,
    ri.captured_at,
    p.full_name as patient_name
FROM report_images ri
JOIN patients p ON SUBSTR(ri.image_path, 17, 36) = p.id  -- Extract patient_id from path
ORDER BY ri.entity_type, ri.entity_id, ri.sequence;
```

---

## File Storage Structure

```
/data/
├── database.db                    -- SQLite database
└── patient-images/
    └── {patient_uuid}/            -- e.g., a1b2c3d4-...
        ├── imaging-{uuid}-{seq}.jpg      -- Imaging study images
        ├── pathology-{uuid}-{seq}.jpg   -- Pathology report images
        ├── biomarker-{uuid}-{seq}.jpg   -- Lab/IHC report images
        ├── treatment-{uuid}-{seq}.jpg   -- Treatment session images
        ├── prev-tx-{uuid}-{seq}.jpg     -- Previous treatment images
        ├── history-{uuid}-{seq}.jpg     -- History/referral images
        ├── vitals-{uuid}-{seq}.jpg      -- Vitals chart images
        └── general-{uuid}-{seq}.jpg     -- General document images
```

**File naming**: `{entity_type}-{record_id}-{sequence}.{ext}`

This enables:
- Easy identification of image type
- Multiple images per record (sequence 1, 2, 3...)
- Sorting by capture time
- Linking back to specific database record

---

## Excel Column to Database Mapping

| # | Excel Column | Table | Field | Supports Images? |
|---|-------------|-------|-------|------------------|
| 1 | S.NO | *(not stored)* | - | - |
| 2 | Reg No | patients | registration_number | ❌ |
| 3 | Reg. Date | patients | registration_date | ❌ |
| 4 | Name & Sur Name | patients | full_name | ❌ |
| 5 | History | patient_history | presenting_complaint | ✅ via report_images |
| 6-7 | Medical History | patient_history | comorbidities, family_cancer_history | ✅ via report_images |
| 8-20 | Demographics | patients | various | ❌ |
| 21-32 | Habits | patient_habits | various | ❌ |
| 33-36 | Cancer Details | cancer_diagnoses | various | ❌ |
| 37-44 | Previous Treatments | previous_treatments | various | ✅ via report_images |
| 45-55 | Pathology | pathology_reports | various | ✅ via report_images |
| 56-61 | Biomarkers | biomarker_tests | various | ✅ via report_images |
| 62-69 | Imaging | imaging_studies | study_type | ✅ via report_images |
| 70-76 | Treatment Plan | treatment_plans | various | ❌ |
| 77-82 | Treatments | treatment_sessions | various | ✅ via report_images |

---

## Summary of Tables

| # | Table | Records Per Patient | Images Per Record | Excel Columns |
|---|-------|---------------------|-------------------|---------------|
| 1 | patients | 1 | ❌ | 2-4, 8-20 |
| 2 | patient_vitals | **Multiple** | ✅ | 13-15 |
| 3 | patient_history | 1 | ✅ | 5-7 |
| 4 | patient_habits | 1 | ❌ | 21-32 |
| 5 | cancer_diagnoses | **Multiple** | ❌ | 33-36 |
| 6 | previous_treatments | **Multiple per diagnosis** | ✅ | 37-44 |
| 7 | pathology_reports | **Multiple per diagnosis** | ✅ | 45-55 |
| 8 | biomarker_tests | **Multiple per diagnosis** | ✅ | 56-61 |
| 9 | imaging_studies | **Multiple per diagnosis** | ✅ | 62-69 |
| 10 | treatment_plans | 1 per diagnosis | ❌ | 70-76 |
| 11 | treatment_sessions | **Multiple per diagnosis** | ✅ | 77-82 |
| 12 | reports | **Multiple** | ✅ | N/A |
| 13 | report_images | **Unlimited per entity** | N/A | N/A |

**Total: 13 tables**
- 9 tables support multiple images via `report_images`
- 4 tables don't need images (demographics, habits, plans)

---

## API Examples for Image Upload

### Upload Single Image
```http
POST /api/images
Content-Type: multipart/form-data

entity_type: imaging_studies
entity_id: abc-123-def
image: [file]
caption: Initial CT scan
sequence: 1
```

### Upload Multiple Images at Once
```http
POST /api/images/batch
Content-Type: multipart/form-data

entity_type: pathology_reports
entity_id: xyz-789-ghi
images: [file1, file2, file3]
```

### Get All Images for an Entity
```http
GET /api/images?entity_type=imaging_studies&entity_id=abc-123-def
```

---

## Migration Notes

1. **Initial Setup**: Run schema creation SQL in order
2. **Index Creation**: Create indexes after bulk data import
3. **Backup Strategy**: Copy entire `/data/` folder
4. **Rollback**: Keep timestamped backups before schema changes

---

## Performance Considerations

- **Indexes**: Created on frequently queried columns (name, phone, CNIC, registration_number)
- **Foreign Keys**: All relationships have CASCADE or SET NULL rules
- **Views**: Pre-computed common joins for dashboard/list views
- **Image Queries**: Optimized with composite index on (entity_type, entity_id, sequence)
