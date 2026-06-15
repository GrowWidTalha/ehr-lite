-- EHR Lite Database Schema (New Schema - PascalCase/Integer)
-- SQLite Schema
-- Version: 2.0.0
-- Migration from old snake_case/UUID schema to new PascalCase/integer schema

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- ============================================================================
-- DROP OLD TABLES (snake_case/UUID schema)
-- ============================================================================

-- Drop old views first
DROP VIEW IF EXISTS vw_patient_summary;
DROP VIEW IF EXISTS vw_diagnosis_detail;

-- Drop old tables in reverse dependency order
DROP TABLE IF EXISTS report_images;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS treatment_sessions;
DROP TABLE IF EXISTS treatment_plans;
DROP TABLE IF EXISTS imaging_studies;
DROP TABLE IF EXISTS biomarker_tests;
DROP TABLE IF EXISTS pathology_reports;
DROP TABLE IF EXISTS previous_treatments;
DROP TABLE IF EXISTS cancer_diagnoses;
DROP TABLE IF EXISTS patient_habits;
DROP TABLE IF EXISTS patient_history;
DROP TABLE IF EXISTS patient_vitals;
DROP TABLE IF EXISTS patients;

-- ============================================================================
-- NEW SCHEMA TABLES (PascalCase/Integer)
-- ============================================================================
-- Note: All tables below use CREATE TABLE IF NOT EXISTS to preserve existing data

CREATE TABLE Addictions (ID INTEGER PRIMARY KEY, Addiction TEXT)
CREATE TABLE AntiHCV (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Reactive TEXT, Treated TEXT
  )
CREATE TABLE Bicarbonate (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Bicarbonate TEXT
  )
CREATE TABLE BloodGroups (ID INTEGER PRIMARY KEY, BloodGroup TEXT)
CREATE TABLE BloodLipids (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, BloodLipids TEXT
  )
CREATE TABLE BloodSugar (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, BloodSugar TEXT, Fasting TEXT, Random REAL
  )
CREATE TABLE BloodUrea (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, BloodUrea TEXT, SerumCreatinine TEXT,
    CreatinineCleareance TEXT, SerumMg TEXT, SerumPhosphate TEXT
  )
CREATE TABLE BoneMarrowBiopsy (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, State TEXT, Result TEXT
  )
CREATE TABLE BoneScan (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Result TEXT, Center TEXT
  )
CREATE TABLE BrainTumors (ID INTEGER PRIMARY KEY, HistrologicalTypes TEXT)
CREATE TABLE BreastCancer (ID INTEGER PRIMARY KEY, BreastCancer TEXT)
CREATE TABLE Bronchoscopy (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Result TEXT, Center TEXT
  )
CREATE TABLE CTScan (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Area TEXT, Remarks TEXT
  )
CREATE TABLE Calcium (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Calcium TEXT
  )
CREATE TABLE Carcinoma (ID INTEGER PRIMARY KEY, Carcinoma TEXT)
CREATE TABLE ChemoTherapy (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Type TEXT, Cycle INTEGER
  )
CREATE TABLE ChronicLeukemia (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, TypeOfLeukemia TEXT, DrugRegimen TEXT, Duration TEXT
  )
CREATE TABLE Cytogenetics (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, State TEXT, Result TEXT
  )
CREATE TABLE Diseases (ID INTEGER PRIMARY KEY, Diseases TEXT)
CREATE TABLE District (ID INTEGER PRIMARY KEY, District TEXT)
CREATE TABLE Doppler (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Site TEXT, Result TEXT
  )
CREATE TABLE Drinks (ID INTEGER PRIMARY KEY, Drinks TEXT)
CREATE TABLE Duration (ID INTEGER PRIMARY KEY, Duration TEXT)
CREATE TABLE ECG (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, State TEXT, Finding TEXT
  )
CREATE TABLE ESR (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, ESR TEXT
  )
CREATE TABLE Echocardiography (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, State TEXT, Finding TEXT
  )
CREATE TABLE Electrolytes (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, SerumSodium TEXT, SerumPotasium TEXT,
    SerumChloride TEXT, SMagnasium TEXT
  )
CREATE TABLE Endoscopy (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Result TEXT, Center TEXT
  )
CREATE TABLE FamilyHistory (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Diseas INTEGER REFERENCES Diseases(ID),
    Type TEXT,
    Relation INTEGER REFERENCES Relations(ID)
  )
CREATE TABLE Foods (ID INTEGER PRIMARY KEY, Food TEXT)
CREATE TABLE GITumors (ID INTEGER PRIMARY KEY, GITumors TEXT)
CREATE TABLE Genitourinary (ID INTEGER PRIMARY KEY, Genitourinary TEXT)
CREATE TABLE Gynecological (ID INTEGER PRIMARY KEY, Gynecological TEXT)
CREATE TABLE HBSag (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Reactive TEXT, Treated TEXT
  )
CREATE TABLE HeadNeckCancer (ID INTEGER PRIMARY KEY, HeadNeckCancer TEXT)
CREATE TABLE Hematological (ID INTEGER PRIMARY KEY, Hematological TEXT)
CREATE TABLE HormonalTherapy (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, NameOfTest TEXT, Duration TEXT
  )
CREATE TABLE Hospitals (ID INTEGER PRIMARY KEY, Hospitals TEXT)
CREATE TABLE ImagingTestFooter (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    ECOGPS TEXT, ClinicalStage TEXT, PathalogicalStage TEXT,
    FinalDiagnoses TEXT, DateOfDiagnoses DATETIME,
    PathalogyAndGrade TEXT, IHCMarkers TEXT, Mitosis10HPF TEXT,
    KI67 TEXT, EFGR TEXT, ALK TEXT, Kras TEXT, MSI TEXT, PDL TEXT,
    Estrogen TEXT, progesterone TEXT, Her TEXT,
    LabName TEXT, SpcimenID TEXT,
    TypeOfSample INTEGER REFERENCES TypeOfSamples(ID),
    WhoReffered TEXT, ReferralCenterName TEXT, Reason TEXT,
    Hospital INTEGER REFERENCES Hospitals(ID)
  )
CREATE TABLE LDH (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, LDH TEXT
  )
CREATE TABLE LFT (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, TotalBilirubin TEXT, DirectBilirubin TEXT,
    IndirectBilirubin TEXT, SGPTALT TEXT, SGOTAST TEXT,
    GamaGT TEXT, AlkalinePhosphatase TEXT
  )
CREATE TABLE LabOtherTests (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, TestName TEXT, Result TEXT
  )
CREATE TABLE LabTestCBCHB (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, R4to16 TEXT, TLC TEXT, Neutron TEXT,
    Lympho TEXT, PLT1to600 TEXT, Blast TEXT
  )
CREATE TABLE Laboratories (ID INTEGER PRIMARY KEY, LabName TEXT)
CREATE TABLE Laproscopy (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Result TEXT, Center TEXT
  )
CREATE TABLE Leukemia (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, ForAcuteLeukemia TEXT, TypeOfLeukemia TEXT, Protocol TEXT
  )
CREATE TABLE LungsCancer (ID INTEGER PRIMARY KEY, LungsCancer TEXT)
CREATE TABLE MRI (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Area TEXT, Remarks TEXT
  )
CREATE TABLE Mammography (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, RTBIRads TEXT, LTBIRads TEXT, Report TEXT
  )
CREATE TABLE MolecularTest (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, State TEXT, Result TEXT
  )
CREATE TABLE MotherTongue (ID INTEGER PRIMARY KEY, MotherTongue TEXT)
CREATE TABLE Myeloma (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, DrugRegimen TEXT, Duration TEXT
  )
CREATE TABLE Occupation (ID INTEGER PRIMARY KEY, Occupation TEXT)
CREATE TABLE OtherTests (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, TestName TEXT, Result TEXT
  )
CREATE TABLE PT (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, PT TEXT, CTRL1 TEXT, INR TEXT, APTT TEXT, CTRL2 TEXT
  )
CREATE TABLE Patient (
    PatientID INTEGER PRIMARY KEY AUTOINCREMENT,
    RegistrationNo TEXT, RegistrationDate DATETIME,
    PatientName TEXT, WOSODO TEXT, RelativeName TEXT,
    Age INTEGER, Height REAL, HScale TEXT, Weight REAL, WScale TEXT,
    Gender TEXT, MaritalStatus TEXT, NoOfChidren INTEGER, NoOfSibling INTEGER,
    BloodGroup INTEGER REFERENCES BloodGroups(ID),
    ContactNo TEXT, CNICNo TEXT,
    Educated INTEGER DEFAULT 0,
    Qualifications INTEGER REFERENCES Qualifications(ID),
    Occupation INTEGER REFERENCES Occupation(ID),
    Years INTEGER, MonthlyIncome INTEGER, WaterUsage TEXT,
    MotherTongue INTEGER REFERENCES MotherTongue(ID),
    PlaceOfBirth INTEGER REFERENCES District(ID),
    DoSports INTEGER DEFAULT 0,
    Sports INTEGER REFERENCES Sports(ID),
    HowOften TEXT, DoExercise INTEGER DEFAULT 0, Exercise TEXT, Durantion TEXT,
    PresentAddress TEXT, PermanentAddress TEXT,
    TreatedBefore INTEGER DEFAULT 0,
    AlternativeNameDuration TEXT, MedicalTreatmentSpecify TEXT, PreviousTreatment TEXT,
    ModeOfPresentation TEXT, PresentedWith TEXT,
    TreatmentOfferedAtJPMC TEXT, OutComeOfTreatment TEXT,
    ProposedTreatment TEXT, PlanOfTreatment TEXT,
    SurgicalProcedure TEXT, SurgicalDate DATETIME,
    Hospital INTEGER REFERENCES Hospitals(ID),
    TNM TEXT, Margins TEXT, LVI TEXT, PNI TEXT,
    EGFR TEXT, EGFR2 TEXT, ENE TEXT, ECE TEXT,
    NodesDisected TEXT, NodesInvolved TEXT,
    Metastasis TEXT, SitesOfMetastasis TEXT,
    TumorLateralityRL TEXT, Quadrant TEXT, TumorSize TEXT, TumorDepth TEXT,
    TumorResponseToChemo TEXT, Grade TEXT, StAge TEXT,
    RadioTherapy TEXT, Dose TEXT, ResponseR TEXT,
    ChemoRegimen TEXT, Cycles TEXT, ResponseC TEXT,
    SurgicalOutCome TEXT, SurgicalPathalogy TEXT, StatingTest TEXT,
    BrainTumor TEXT, HeadAndNeck TEXT, BreastCancer TEXT,
    Genitourinary TEXT, Gyneacological TEXT, LungsCancer TEXT,
    GITumor TEXT, SkinTumor TEXT, Hematological TEXT,
    Sarcoma TEXT, Carcinoma TEXT,
    FollowUp INTEGER DEFAULT 0,
    ExaminationDate DATETIME, DoctorName TEXT,
    PresentingComplaint TEXT, Comorbidities TEXT, FamilyCancerHistory TEXT,
    WHOClassification TEXT, ERStatus TEXT, ERPercent TEXT,
    PRStatus TEXT, PRPercent TEXT, HER2Status TEXT, Ki67Percent TEXT,
    StudyType TEXT, StudyDate DATETIME, Findings TEXT, Indication TEXT,
    PlanType TEXT, SurgeryPlanned TEXT, NeoadjuvantChemo TEXT,
    Notes TEXT
  )
CREATE TABLE PatientAddictions (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    AddictionID INTEGER REFERENCES Addictions(ID),
    Quantity INTEGER, QScale TEXT, Frequency TEXT, Quit TEXT, QuitPeriod TEXT
  )
CREATE TABLE PatientDrinks (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    DrinkID INTEGER REFERENCES Drinks(ID),
    Cup INTEGER, Since TEXT, Frequency INTEGER, Quit TEXT
  )
CREATE TABLE PatientFoods (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    FoodID INTEGER REFERENCES Foods(ID),
    Quantity INTEGER, Since TEXT, Frequency INTEGER, Quit TEXT
  )
CREATE TABLE PetScan (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, NameOfCenter TEXT, Remarks TEXT
  )
CREATE TABLE Province (ID INTEGER PRIMARY KEY, Province TEXT)
CREATE TABLE Qualifications (ID INTEGER PRIMARY KEY, QLevel TEXT)
CREATE TABLE RadioTherapy (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Dose TEXT
  )
CREATE TABLE Relations (ID INTEGER PRIMARY KEY, Relations TEXT)
CREATE TABLE SRS (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Site TEXT
  )
CREATE TABLE Sarcoma (ID INTEGER PRIMARY KEY, Sarcoma TEXT)
CREATE TABLE SkinTumor (ID INTEGER PRIMARY KEY, SkinTumor TEXT)
CREATE TABLE Sports (ID INTEGER PRIMARY KEY, Sports TEXT)
CREATE TABLE Surgery (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME,
    Type INTEGER REFERENCES SurgeryList(ID)
  )
CREATE TABLE SurgeryList (ID INTEGER PRIMARY KEY, SurgeryType TEXT)
CREATE TABLE TPort (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, TPort TEXT, Albumin TEXT, Globulin TEXT
  )
CREATE TABLE TargettedTherapy (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, NameOfTest TEXT, Duration TEXT
  )
CREATE TABLE TumorMarkers (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, CA125 TEXT, CEA TEXT, CA199 TEXT,
    PSA TEXT, BHCG TEXT, AFP TEXT, HR2 TEXT, LDH TEXT, CA153 TEXT
  )
CREATE TABLE TypeOfSamples (ID INTEGER PRIMARY KEY, TypeOfSample TEXT)
CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES Patient(PatientID),
  diagnosis_id INTEGER,
  title TEXT,
  report_type TEXT,
  notes TEXT,
  report_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
CREATE TABLE report_images (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  image_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  caption TEXT,
  sequence INTEGER DEFAULT 0,
  captured_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
CREATE TABLE UltraSound (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, NameOfCenter TEXT, Remarks TEXT
  )
CREATE TABLE UricAcid (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, UricAcid TEXT
  )
CREATE TABLE Urine (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, DR TEXT, Other TEXT,
    UrineChemicalSPGravity TEXT, Urobilinogel TEXT,
    LeucocytesEsterase TEXT, UnrinePhysicalColor TEXT, UrineAppearance TEXT
  )
CREATE TABLE UrineDR2 (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, PhysicalColor TEXT, PhysicalVolume TEXT,
    Appearance TEXT, ChemicalSpecificGravity TEXT, ReactionPH TEXT,
    Protein TEXT, Glucose TEXT, Bilirubin TEXT, Urobillinogen TEXT,
    Niterate TEXT, Leukocytes TEXT, RedBloodCells TEXT, EpithelialCells TEXT
  )
CREATE TABLE immunophenotyping (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, State TEXT, Result TEXT
  )
CREATE TABLE sqlite_sequence(name,seq)
CREATE TABLE xRay (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Area TEXT, Remarks TEXT
  )

-- ============================================================================
-- NEW VIEWS (Patient List and Detail)
-- ============================================================================

CREATE VIEW IF NOT EXISTS vw_patient_list AS
SELECT
  p.PatientID,
  p.RegistrationNo,
  p.PatientName,
  p.Age,
  p.Gender,
  p.ContactNo,
  p.RegistrationDate,
  p.ExaminationDate,
  p.DoctorName,
  bg.BloodGroup,
  h.Hospitals AS HospitalName,
  p.FollowUp
FROM Patient p
LEFT JOIN BloodGroups bg ON p.BloodGroup = bg.ID
LEFT JOIN Hospitals h ON p.Hospital = h.ID;

CREATE VIEW IF NOT EXISTS vw_patient_detail AS
SELECT
  p.*,
  bg.BloodGroup AS BloodGroupName,
  q.QLevel AS QualificationName,
  o.Occupation AS OccupationName,
  mt.MotherTongue AS MotherTongueName,
  d.District AS PlaceOfBirthName,
  sp.Sports AS SportsName,
  h.Hospitals AS HospitalName,
  -- Consolidate cancer type into single field
  CASE
    WHEN p.BrainTumor IS NOT NULL AND p.BrainTumor != '' THEN p.BrainTumor
    WHEN p.HeadAndNeck IS NOT NULL AND p.HeadAndNeck != '' THEN p.HeadAndNeck
    WHEN p.BreastCancer IS NOT NULL AND p.BreastCancer != '' THEN p.BreastCancer
    WHEN p.Genitourinary IS NOT NULL AND p.Genitourinary != '' THEN p.Genitourinary
    WHEN p.Gyneacological IS NOT NULL AND p.Gyneacological != '' THEN p.Gyneacological
    WHEN p.LungsCancer IS NOT NULL AND p.LungsCancer != '' THEN p.LungsCancer
    WHEN p.GITumor IS NOT NULL AND p.GITumor != '' THEN p.GITumor
    WHEN p.SkinTumor IS NOT NULL AND p.SkinTumor != '' THEN p.SkinTumor
    WHEN p.Hematological IS NOT NULL AND p.Hematological != '' THEN p.Hematological
    WHEN p.Sarcoma IS NOT NULL AND p.Sarcoma != '' THEN p.Sarcoma
    WHEN p.Carcinoma IS NOT NULL AND p.Carcinoma != '' THEN p.Carcinoma
    ELSE NULL
  END AS CancerType
FROM Patient p
LEFT JOIN BloodGroups bg ON p.BloodGroup = bg.ID
LEFT JOIN Qualifications q ON p.Qualifications = q.ID
LEFT JOIN Occupation o ON p.Occupation = o.ID
LEFT JOIN MotherTongue mt ON p.MotherTongue = mt.ID
LEFT JOIN District d ON p.PlaceOfBirth = d.ID
LEFT JOIN Sports sp ON p.Sports = sp.ID
LEFT JOIN Hospitals h ON p.Hospital = h.ID;
