-- Migration: Add Report Categories and Improve Reports System
-- This adds comprehensive report categorization and improves the reports system

-- Update existing reports table structure
ALTER TABLE reports ADD COLUMN category TEXT DEFAULT 'General';
ALTER TABLE reports ADD COLUMN facility_name TEXT;
ALTER TABLE reports ADD COLUMN ordering_physician TEXT;
ALTER TABLE reports ADD COLUMN clinical_context TEXT;

-- Create report types lookup table
CREATE TABLE IF NOT EXISTS ReportTypes (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  TypeCode TEXT UNIQUE NOT NULL,
  TypeName TEXT NOT NULL,
  Category TEXT NOT NULL,
  Description TEXT,
  DisplayOrder INTEGER DEFAULT 0,
  IsActive INTEGER DEFAULT 1
);

-- Insert comprehensive report types
INSERT INTO ReportTypes (TypeCode, TypeName, Category, Description, DisplayOrder) VALUES
-- Imaging Reports
('CT_SCAN', 'CT Scan', 'Imaging', 'Computed Tomography scan', 1),
('MRI', 'MRI', 'Imaging', 'Magnetic Resonance Imaging', 2),
('PET_SCAN', 'PET Scan', 'Imaging', 'Positron Emission Tomography', 3),
('ULTRASOUND', 'Ultrasound', 'Imaging', 'Ultrasound imaging', 4),
('MAMMOGRAM', 'Mammogram', 'Imaging', 'Breast mammography', 5),
('BONE_SCAN', 'Bone Scan', 'Imaging', 'Nuclear bone scan', 6),
('X_RAY', 'X-Ray', 'Imaging', 'X-ray imaging', 7),
('ECHOCARDIOGRAM', 'Echocardiogram', 'Imaging', 'Heart ultrasound', 8),
('ELECTROCARDIOGRAM', 'ECG/EKG', 'Imaging', 'Heart electrical activity', 9),

-- Pathology Reports
('BIOPSY', 'Biopsy Report', 'Pathology', 'Tissue biopsy analysis', 10),
('SURGICAL_PATHOLOGY', 'Surgical Pathology', 'Pathology', 'Surgical specimen analysis', 11),
('CYTOLOGY', 'Cytology Report', 'Pathology', 'Cell analysis (Pap smear, etc.)', 12),
('MOLECULAR', 'Molecular Pathology', 'Pathology', 'DNA/RNA analysis', 13),
('IHC_MARKERS', 'IHC Markers', 'Pathology', 'Immunohistochemistry markers', 14),
('BONE_MARROW', 'Bone Marrow Biopsy', 'Pathology', 'Bone marrow analysis', 15),

-- Lab Results
('BLOOD_WORK', 'Blood Work', 'Lab', 'Complete blood count, chemistry', 16),
('TUMOR_MARKERS', 'Tumor Markers', 'Lab', 'CEA, CA125, CA19-9, PSA, AFP', 17),
('HORMONE_RECEPTORS', 'Hormone Receptors', 'Lab', 'ER, PR status and percentages', 18),
('HER2_TEST', 'HER2 Testing', 'Lab', 'HER2/neu status', 19),
('KI67', 'Ki-67 Index', 'Lab', 'Proliferation marker', 20),
('GENETIC_TEST', 'Genetic Testing', 'Lab', 'EGFR, ALK, KRAS, MSI, PD-L1', 21),
('COAGULATION', 'Coagulation Profile', 'Lab', 'PT, INR, APTT', 22),
('LIVER_FUNCTION', 'Liver Function', 'Lab', 'LFT: bilirubin, SGPT, SGOT, ALP', 23),
('KIDNEY_FUNCTION', 'Kidney Function', 'Lab', 'Renal function tests', 24),

-- Treatment Reports
('CHEMOTHERAPY', 'Chemotherapy Record', 'Treatment', 'Chemo regimen and cycles', 25),
('RADIOTHERAPY', 'Radiotherapy Record', 'Treatment', 'Radiation dose and fields', 26),
('SURGICAL_REPORT', 'Surgical Report', 'Treatment', 'Operative report', 27),
('TARGETED_THERAPY', 'Targeted Therapy', 'Treatment', 'TKI and targeted agents', 28),
('IMMUNOTHERAPY', 'Immunotherapy', 'Treatment', 'Immunotherapy records', 29),
('HORMONE_THERAPY', 'Hormone Therapy', 'Treatment', 'Hormonal treatment records', 30),

-- Clinical Documents
('CONSULTATION', 'Consultation Note', 'Clinical', 'Specialist consultation', 31),
('DISCHARGE_SUMMARY', 'Discharge Summary', 'Clinical', 'Hospital discharge summary', 32),
('PROGRESS_NOTE', 'Progress Note', 'Clinical', 'Clinical progress notes', 33),
('REFERRAL', 'Referral Letter', 'Clinical', 'Doctor referral letter', 34),

-- Other
('GENERAL', 'General Report', 'Other', 'Other medical reports', 35),
('CONSENT', 'Consent Form', 'Other', 'Treatment consent forms', 36);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(report_date);
CREATE INDEX IF NOT EXISTS idx_reports_diagnosis ON reports(diagnosis_id);

-- Update existing reports to have proper types
UPDATE reports SET category = 'Imaging' WHERE report_type IN ('CT Scan', 'MRI', 'PET Scan', 'Ultrasound', 'Mammogram', 'Bone Scan', 'X-Ray', 'Echocardiogram', 'ECG/EKG');
UPDATE reports SET category = 'Pathology' WHERE report_type IN ('Biopsy', 'Surgical Pathology', 'Cytology', 'Molecular', 'IHC Markers', 'Bone Marrow');
UPDATE reports SET category = 'Lab' WHERE report_type IN ('Blood Work', 'Tumor Markers', 'Hormone Receptors', 'HER2 Testing', 'Ki-67', 'Genetic Testing', 'Coagulation', 'Liver Function', 'Kidney Function');
UPDATE reports SET category = 'Treatment' WHERE report_type IN ('Chemotherapy', 'Radiotherapy', 'Surgical Report', 'Targeted Therapy', 'Immunotherapy', 'Hormone Therapy');
UPDATE reports SET category = 'Clinical' WHERE report_type IN ('Consultation Note', 'Discharge Summary', 'Progress Note', 'Referral Letter');
UPDATE reports SET category = 'Other' WHERE report_type IN ('General Report', 'Consent Form') OR category IS NULL OR category = 'General';
