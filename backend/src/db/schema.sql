-- EHR Lite Database Schema
-- SQLite Schema
-- Version: 1.1.0

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- ============================================================================
-- CORE PATIENT TABLES
-- ============================================================================

-- 1. patients
-- Core patient demographic information
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    registration_number TEXT UNIQUE,
    registration_date TEXT,

    -- Core Identity
    full_name TEXT NOT NULL,
    age INTEGER,
    sex TEXT CHECK(sex IN ('Male', 'Female', 'Other')),

    -- Contact
    phone TEXT,
    cnic TEXT,

    -- Demographics
    marital_status TEXT,
    education TEXT,
    language TEXT,
    territory TEXT,

    -- Family
    children_count INTEGER DEFAULT 0,
    sibling_count INTEGER DEFAULT 0,

    -- Metadata
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(full_name);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_cnic ON patients(cnic);
CREATE INDEX IF NOT EXISTS idx_patients_reg_no ON patients(registration_number);

-- 2. patient_vitals
-- Physical measurements - supports multiple records for tracking history
CREATE TABLE IF NOT EXISTS patient_vitals (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,

    height_cm REAL,
    weight_kg REAL,
    blood_group TEXT CHECK(blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),

    recorded_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_vitals_patient ON patient_vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_vitals_date ON patient_vitals(recorded_at);

-- 3. patient_history
-- Medical history - supports image attachment for referral documents
CREATE TABLE IF NOT EXISTS patient_history (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL UNIQUE,

    presenting_complaint TEXT,
    comorbidities TEXT,
    family_cancer_history TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 4. patient_habits
-- Lifestyle habits and substance use
CREATE TABLE IF NOT EXISTS patient_habits (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL UNIQUE,

    -- Smoking
    smoking_status TEXT CHECK(smoking_status IN ('Never', 'Former', 'Current')),
    smoking_quantity TEXT,

    -- Smokeless Tobacco
    pan_use TEXT CHECK(pan_use IN ('Never', 'Former', 'Current')),
    pan_quantity TEXT,

    gutka_use TEXT CHECK(gutka_use IN ('Never', 'Former', 'Current')),
    gutka_quantity TEXT,

    naswar_use TEXT CHECK(naswar_use IN ('Never', 'Former', 'Current')),
    naswar_quantity TEXT,

    -- Alcohol
    alcohol_use TEXT CHECK(alcohol_use IN ('Never', 'Former', 'Current')),
    alcohol_quantity TEXT,

    -- Other
    other_habits TEXT,
    quit_period TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- ============================================================================
-- ONCOLOGY TABLES
-- ============================================================================

-- 5. cancer_diagnoses
-- Each patient can have multiple cancer diagnoses
CREATE TABLE IF NOT EXISTS cancer_diagnoses (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,

    -- Diagnosis Details
    cancer_type TEXT NOT NULL,
    stage TEXT,
    grade TEXT,
    who_classification TEXT,

    diagnosis_date TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_diagnoses_patient ON cancer_diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_type ON cancer_diagnoses(cancer_type);

-- 6. previous_treatments
-- Treatments received before current presentation
CREATE TABLE IF NOT EXISTS previous_treatments (
    id TEXT PRIMARY KEY,
    diagnosis_id TEXT NOT NULL,

    -- Previous Treatment Flags
    previous_chemo TEXT DEFAULT 'No',
    previous_radiotherapy TEXT DEFAULT 'No',
    previous_targeted_therapy TEXT DEFAULT 'No',
    previous_hormonal TEXT DEFAULT 'No',
    previous_immunotherapy TEXT DEFAULT 'No',

    -- Surgeries
    previous_surgery TEXT,
    second_surgery TEXT,
    non_cancer_surgery TEXT,

    notes TEXT,

    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (diagnosis_id) REFERENCES cancer_diagnoses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_previous_treatments_diagnosis ON previous_treatments(diagnosis_id);

-- 7. pathology_reports
-- Surgical pathology findings
CREATE TABLE IF NOT EXISTS pathology_reports (
    id TEXT PRIMARY KEY,
    diagnosis_id TEXT NOT NULL,

    report_date TEXT,
    report_type TEXT,

    -- Staging
    pathological_stage TEXT,

    -- Tumor Details
    tumor_size TEXT,
    depth TEXT,
    margins TEXT,

    -- Lymphovascular
    lvi TEXT,
    pni TEXT,

    -- Lymph Nodes
    nodes_recovered INTEGER,
    nodes_involved INTEGER,
    extra_nodal_extension TEXT,

    -- Surgery Assessment
    surgery_adequacy TEXT,

    -- Recurrence
    recurrence TEXT,

    notes TEXT,

    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (diagnosis_id) REFERENCES cancer_diagnoses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pathology_diagnosis ON pathology_reports(diagnosis_id);
CREATE INDEX IF NOT EXISTS idx_pathology_type ON pathology_reports(report_type);

-- 8. biomarker_tests
-- IHC and tumor marker results
CREATE TABLE IF NOT EXISTS biomarker_tests (
    id TEXT PRIMARY KEY,
    diagnosis_id TEXT NOT NULL,

    test_date TEXT,
    test_type TEXT,

    -- Breast Cancer Markers
    er_status TEXT,
    er_percentage INTEGER,

    pr_status TEXT,
    pr_percentage INTEGER,

    her2_status TEXT,
    her2_score TEXT,

    ki67_percentage INTEGER,
    mitosis_count INTEGER,

    -- Other Markers
    ihc_markers TEXT,
    tumor_markers TEXT,

    notes TEXT,

    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (diagnosis_id) REFERENCES cancer_diagnoses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_biomarker_diagnosis ON biomarker_tests(diagnosis_id);
CREATE INDEX IF NOT EXISTS idx_biomarker_type ON biomarker_tests(test_type);

-- 9. imaging_studies
-- Radiology and imaging records
CREATE TABLE IF NOT EXISTS imaging_studies (
    id TEXT PRIMARY KEY,
    diagnosis_id TEXT NOT NULL,

    study_type TEXT NOT NULL,
    study_date TEXT,

    findings TEXT,
    indication TEXT,

    notes TEXT,

    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (diagnosis_id) REFERENCES cancer_diagnoses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_imaging_diagnosis ON imaging_studies(diagnosis_id);
CREATE INDEX IF NOT EXISTS idx_imaging_type ON imaging_studies(study_type);
CREATE INDEX IF NOT EXISTS idx_imaging_date ON imaging_studies(study_date);

-- 10. treatment_plans
-- Planned treatment approach
CREATE TABLE IF NOT EXISTS treatment_plans (
    id TEXT PRIMARY KEY,
    diagnosis_id TEXT NOT NULL UNIQUE,

    plan_type TEXT,

    -- Surgical Planning
    surgery_planned TEXT DEFAULT 'No',
    radical_surgery TEXT DEFAULT 'No',
    palliative_surgery TEXT DEFAULT 'No',

    -- Chemotherapy Planning
    neoadjuvant_chemo TEXT DEFAULT 'No',
    adjuvant_chemo TEXT DEFAULT 'No',
    induction_chemo TEXT DEFAULT 'No',

    notes TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (diagnosis_id) REFERENCES cancer_diagnoses(id) ON DELETE CASCADE
);

-- 11. treatment_sessions
-- Actual treatments delivered
CREATE TABLE IF NOT EXISTS treatment_sessions (
    id TEXT PRIMARY KEY,
    diagnosis_id TEXT NOT NULL,
    plan_id TEXT,

    session_date TEXT,
    treatment_type TEXT NOT NULL,

    -- Chemotherapy Details
    chemo_regimen TEXT,
    chemo_cycle INTEGER,

    -- Radiotherapy Details
    rt_site TEXT,
    rt_dose TEXT,
    rt_fractions INTEGER,

    -- Systemic Therapy Details
    hormonal_agent TEXT,
    targeted_agent TEXT,
    immunotherapy_agent TEXT,

    notes TEXT,

    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (diagnosis_id) REFERENCES cancer_diagnoses(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES treatment_plans(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_treatment_diagnosis ON treatment_sessions(diagnosis_id);
CREATE INDEX IF NOT EXISTS idx_treatment_date ON treatment_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_treatment_type ON treatment_sessions(treatment_type);

-- ============================================================================
-- DOCUMENT STORAGE
-- ============================================================================

-- 12. reports
-- General document storage
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    diagnosis_id TEXT,

    title TEXT NOT NULL,
    report_type TEXT NOT NULL,
    notes TEXT,

    report_date TEXT,

    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (diagnosis_id) REFERENCES cancer_diagnoses(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_patient ON reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_reports_diagnosis ON reports(diagnosis_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(report_date);

-- 13. report_images
-- Universal image storage for all entities
CREATE TABLE IF NOT EXISTS report_images (
    id TEXT PRIMARY KEY,

    -- Polymorphic link to any entity
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,

    -- File info
    image_path TEXT NOT NULL,
    file_name TEXT,
    file_type TEXT,
    file_size INTEGER,

    -- Metadata
    caption TEXT,
    sequence INTEGER DEFAULT 0,

    captured_at TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_report_images_entity ON report_images(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_report_images_sequence ON report_images(entity_type, entity_id, sequence);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- vw_patient_summary
CREATE VIEW IF NOT EXISTS vw_patient_summary AS
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
    COUNT(DISTINCT r.id) as report_count
FROM patients p
LEFT JOIN cancer_diagnoses cd ON p.id = cd.patient_id
LEFT JOIN reports r ON p.id = r.patient_id
GROUP BY p.id;

-- vw_diagnosis_detail
CREATE VIEW IF NOT EXISTS vw_diagnosis_detail AS
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
    COUNT(DISTINCT pr.id) as pathology_count
FROM cancer_diagnoses cd
JOIN patients p ON cd.patient_id = p.id
LEFT JOIN treatment_plans tp ON cd.id = tp.diagnosis_id
LEFT JOIN treatment_sessions ts ON cd.id = ts.diagnosis_id
LEFT JOIN pathology_reports pr ON cd.id = pr.diagnosis_id
GROUP BY cd.id;
