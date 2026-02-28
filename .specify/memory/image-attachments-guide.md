# Image Attachment Strategy for EHR Lite

**Version**: 1.0.0
**Date**: 2026-02-24

## Overview

Support image attachment for any entity where patients bring physical reports/documents.
**Both options must be available**: Manual data entry OR image attachment OR both.

---

## High Priority - Must Support Images

These are documents patients **frequently bring from outside facilities**:

### 1. Imaging Studies (Columns 62-69)
```
Excel: Ct Scane, MRI, Pet Scane, U/Sound, Mammogram, Bone Scane, Echo, BSC

Common External Reports:
├── CT Scan report (printed)
├── MRI films/report
├── PET Scan printout
├── Ultrasound report
├── Mammography report
├── Bone Scan report
└── Echocardiogram report

Schema Change:
  imaging_studies.image_path TEXT (nullable)
```

### 2. Pathology Reports (Columns 45-55)
```
Excel: Pathological Stage, Tumor Size, Depth, Margins, LVI, PNI,
       Nodes Recover, Nodes Involved, Extra Node Ext, Adequacy, Recurrence

Common External Reports:
├── Biopsy pathology report
├── Histopathology slip
├── Surgical pathology report
├── Lymph node pathology
└── Resection margin report

Schema Change:
  pathology_reports.image_path TEXT (nullable)
```

### 3. Biomarker Tests (Columns 56-61)
```
Excel: ER, PR, Her2-U, Ki-67, Mitosis/10HPF, IHC Markers

Common External Reports:
├── IHC marker report (ER/PR/HER2)
├── Ki-67 index report
├── Tumor marker panel
└── Lab biomarker sheet

Schema Change:
  biomarker_tests.image_path TEXT (nullable)
```

### 4. Previous Treatments (Columns 37-44)
```
Excel: Previous Chemo, Previous RT, Previous Targeted/TKI, Previous HT,
       Previous IT, Surgery Other Than Cancer, Previous Surgery, 2nd Surgery

Common External Reports:
├── Previous chemo summary
├── Previous radiotherapy summary
├── Past surgical report
├── Outside hospital treatment summary
└── Discharge summary from other facility

Schema Change:
  previous_treatments.image_path TEXT (nullable)
```

---

## Medium Priority - Nice to Have

### 5. Treatment Sessions (Columns 77-82)
```
Excel: Chemotherapy, Hormonal Therapy, Targeted Therapy/TKI,
       Radio Therapy, Brachy Therapy, Immuno Theray

Documents:
├── Chemo order sheet
├── Infusion record
├── Radiotherapy card
└── Treatment notes

Schema Change:
  treatment_sessions.image_path TEXT (nullable)
```

### 6. Patient History (Columns 5-7)
```
Excel: History, DM - HTN/IHD - HCV/HBV - Others, Family History of Cancer

Documents:
├── Referral letter with history
├── Previous hospital summary
└── Transfer note

Schema Change:
  patient_history.image_path TEXT (nullable)
```

---

## Already Supported

### 7. General Reports
```
The reports table already supports images:
  - Any patient document
  - ID cards
  - Insurance papers
  - Discharge summaries
  - Lab reports

No schema change needed.
```

---

## Updated Schema with Image Support

### imaging_studies
```sql
CREATE TABLE imaging_studies (
    id TEXT PRIMARY KEY,
    diagnosis_id TEXT NOT NULL,
    study_type TEXT NOT NULL,               -- CT, MRI, PET, US, etc.
    study_date TEXT,

    findings TEXT,                          -- Manual entry
    indication TEXT,                        -- Manual entry

    -- NEW: Image attachment
    image_path TEXT,                        -- Path to uploaded report image
    image_captured_at TEXT,                 -- When image was uploaded

    report_id TEXT,                         -- Link to general reports table

    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (diagnosis_id) REFERENCES cancer_diagnoses(id) ON DELETE CASCADE
);
```

### pathology_reports
```sql
CREATE TABLE pathology_reports (
    id TEXT PRIMARY KEY,
    diagnosis_id TEXT NOT NULL,
    report_date TEXT,

    -- All pathology fields (manual entry)
    pathological_stage TEXT,
    tumor_size TEXT,
    depth TEXT,
    margins TEXT,
    lvi TEXT,
    pni TEXT,
    nodes_recovered INTEGER,
    nodes_involved INTEGER,
    extra_nodal_extension TEXT,
    surgery_adequacy TEXT,
    recurrence TEXT,

    -- NEW: Image attachment
    image_path TEXT,                        -- Path to pathology report image
    image_captured_at TEXT,

    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (diagnosis_id) REFERENCES cancer_diagnoses(id) ON DELETE CASCADE
);
```

### biomarker_tests
```sql
CREATE TABLE biomarker_tests (
    id TEXT PRIMARY KEY,
    diagnosis_id TEXT NOT NULL,
    test_date TEXT,

    -- All biomarker fields (manual entry)
    er_status TEXT,
    er_percentage INTEGER,
    pr_status TEXT,
    pr_percentage INTEGER,
    her2_status TEXT,
    her2_score TEXT,
    ki67_percentage INTEGER,
    mitosis_count INTEGER,
    ihc_markers TEXT,
    tumor_markers TEXT,

    -- NEW: Image attachment
    image_path TEXT,                        -- Path to lab report image
    image_captured_at TEXT,

    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (diagnosis_id) REFERENCES cancer_diagnoses(id) ON DELETE CASCADE
);
```

### previous_treatments
```sql
CREATE TABLE previous_treatments (
    id TEXT PRIMARY KEY,
    diagnosis_id TEXT NOT NULL,

    -- All previous treatment flags
    previous_chemo TEXT DEFAULT 'No',
    previous_radiotherapy TEXT DEFAULT 'No',
    previous_targeted_therapy TEXT DEFAULT 'No',
    previous_hormonal TEXT DEFAULT 'No',
    previous_immunotherapy TEXT DEFAULT 'No',
    previous_surgery TEXT,
    second_surgery TEXT,
    non_cancer_surgery TEXT,

    -- NEW: Image attachment
    image_path TEXT,                        -- Path to external treatment summary
    image_captured_at TEXT,

    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (diagnosis_id) REFERENCES cancer_diagnoses(id) ON DELETE CASCADE
);
```

### treatment_sessions
```sql
CREATE TABLE treatment_sessions (
    id TEXT PRIMARY KEY,
    diagnosis_id TEXT NOT NULL,
    plan_id TEXT,

    session_date TEXT,
    treatment_type TEXT NOT NULL,

    -- Treatment details (manual entry)
    chemo_regimen TEXT,
    chemo_cycle INTEGER,
    rt_site TEXT,
    rt_dose TEXT,
    rt_fractions INTEGER,
    hormonal_agent TEXT,
    targeted_agent TEXT,
    immunotherapy_agent TEXT,

    -- NEW: Image attachment
    image_path TEXT,                        -- Path to treatment record image
    image_captured_at TEXT,

    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (diagnosis_id) REFERENCES cancer_diagnoses(id) ON DELETE CASCADE
    FOREIGN KEY (plan_id) REFERENCES treatment_plans(id) ON DELETE SET NULL
);
```

### patient_history
```sql
CREATE TABLE patient_history (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL UNIQUE,

    -- History fields (manual entry)
    presenting_complaint TEXT,
    comorbidities TEXT,
    family_cancer_history TEXT,

    -- NEW: Image attachment
    image_path TEXT,                        -- Path to referral/summary document
    image_captured_at TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
```

---

## File Storage Convention

```
/data/patient-images/{patient_uuid}/
├── imaging-{study_uuid}-{timestamp}.jpg     -- Imaging reports
├── pathology-{report_uuid}-{timestamp}.jpg  -- Pathology reports
├── biomarker-{test_uuid}-{timestamp}.jpg    -- Lab/IHC reports
├── treatment-{session_uuid}-{timestamp}.jpg -- Treatment records
├── prev-treatment-{prev_uuid}-{timestamp}.jpg -- Previous treatment summaries
├── history-{history_id}-{timestamp}.jpg     -- History/referral documents
└── general-{report_uuid}-{timestamp}.jpg    -- General documents
```

**File naming format**: `{entity_type}-{record_id}-{timestamp}.jpg`

This enables:
1. Easy identification of image type
2. Linking image back to specific database record
3. Multiple images per record (different timestamps)
4. Sorting by capture time

---

## UX Flow for Image Attachments

### Option 1: Image Only (Fastest)
```
User Action:
  1. Select record type (e.g., "New Imaging Study")
  2. Choose study type (CT, MRI, etc.)
  3. Take photo with camera OR upload file
  4. Save

System:
  - Stores image
  - Creates minimal record (type, date, image_path)
  - All text fields optional/nullable
```

### Option 2: Manual Entry Only
```
User Action:
  1. Select record type
  2. Fill in all text fields
  3. Save (no image)

System:
  - Stores data only
  - image_path = NULL
```

### Option 3: Both (Most Complete)
```
User Action:
  1. Select record type
  2. Attach image
  3. Extract key data from image (manual entry)
  4. Save

System:
  - Stores both image and data
  - Image serves as source document
  - Data enables search/filter
```

---

## API Changes Required

### POST /api/imaging-studies
```javascript
{
  diagnosis_id: "...",
  study_type: "CT",
  study_date: "2026-02-24",
  findings: "...",              // Optional
  image_file: <FormData>        // Optional - multipart upload
}
```

### POST /api/pathology-reports
```javascript
{
  diagnosis_id: "...",
  report_date: "2026-02-24",
  tumor_size: "3.5 cm",         // Optional
  margins: "Clear",             // Optional
  image_file: <FormData>        // Optional - multipart upload
}
```

### POST /api/biomarker-tests
```javascript
{
  diagnosis_id: "...",
  test_date: "2026-02-24",
  er_status: "Positive",        // Optional
  image_file: <FormData>        // Optional - multipart upload
}
```

---

## Summary Table

| Table | Can Attach Image? | Typical Use Case | Excel Columns |
|-------|------------------|------------------|--------------|
| `imaging_studies` | ✅ YES | CT/MRI/PET reports | 62-69 |
| `pathology_reports` | ✅ YES | Biopsy/Histo reports | 45-55 |
| `biomarker_tests` | ✅ YES | IHC/Marker lab reports | 56-61 |
| `previous_treatments` | ✅ YES | External treatment summaries | 37-44 |
| `treatment_sessions` | ✅ YES | Chemo orders/Infusion records | 77-82 |
| `patient_history` | ✅ YES | Referral letters | 5-7 |
| `reports` | ✅ YES (already) | General documents | N/A |

**Total: 6 tables need image_path added, 1 already has it**
