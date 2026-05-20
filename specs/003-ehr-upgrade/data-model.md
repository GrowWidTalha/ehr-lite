# Data Model: EHR Schema Migration

**Feature**: 003-ehr-upgrade
**Date**: 2026-04-28

## Overview

New schema uses PascalCase tables with integer autoincrement primary keys, mirroring an oncology Access database.

## Core Entities

### Patient

Primary table with 60+ fields containing demographics, contact info, and diagnosis summary.

```sql
Patient (
  PatientID INTEGER PRIMARY KEY AUTOINCREMENT,
  RegistrationNo TEXT UNIQUE,
  RegistrationDate DATETIME,
  PatientName TEXT NOT NULL,
  WOSODO TEXT,
  RelativeName TEXT,
  Age INTEGER,
  Height REAL,
  HScale TEXT,
  Weight REAL,
  WScale TEXT,
  Gender TEXT,
  MaritalStatus TEXT,
  NoOfChidren INTEGER,
  NoOfSibling INTEGER,
  BloodGroup INTEGER REFERENCES BloodGroups(ID),
  ContactNo TEXT,
  CNICNo TEXT,
  Educated INTEGER DEFAULT 0,
  Qualifications INTEGER REFERENCES Qualifications(ID),
  Occupation INTEGER REFERENCES Occupation(ID),
  Years INTEGER,
  MonthlyIncome INTEGER,
  WaterUsage TEXT,
  MotherTongue INTEGER REFERENCES MotherTongue(ID),
  PlaceOfBirth INTEGER REFERENCES District(ID),
  DoSports INTEGER DEFAULT 0,
  Sports INTEGER REFERENCES Sports(ID),
  HowOften TEXT,
  DoExercise INTEGER DEFAULT 0,
  Exercise TEXT,
  Durantion TEXT,
  PresentAddress TEXT,
  PermanentAddress TEXT,
  TreatedBefore INTEGER DEFAULT 0,
  AlternativeNameDuration TEXT,
  MedicalTreatmentSpecify TEXT,
  PreviousTreatment TEXT,
  ModeOfPresentation TEXT,
  PresentedWith TEXT,
  TreatmentOfferedAtJPMC TEXT,
  OutComeOfTreatment TEXT,
  ProposedTreatment TEXT,
  PlanOfTreatment TEXT,
  SurgicalProcedure TEXT,
  SurgicalDate DATETIME,
  Hospital INTEGER REFERENCES Hospitals(ID),
  TNM TEXT,
  Margins TEXT,
  LVI TEXT,
  PNI TEXT,
  EGFR TEXT,
  EGFR2 TEXT,
  ENE TEXT,
  ECE TEXT,
  NodesDisected TEXT,
  NodesInvolved TEXT,
  Metastasis TEXT,
  SitesOfMetastasis TEXT,
  TumorLateralityRL TEXT,
  Quadrant TEXT,
  TumorSize TEXT,
  TumorDepth TEXT,
  TumorResponseToChemo TEXT,
  Grade TEXT,
  RadioTherapy TEXT,
  Dose TEXT,
  ResponseR TEXT,
  ChemoRegimen TEXT,
  Cycles TEXT,
  ResponseC TEXT,
  SurgicalOutCome TEXT,
  SurgicalPathalogy TEXT,
  StatingTest TEXT,
  -- Cancer type flags
  BrainTumor TEXT,
  HeadAndNeck TEXT,
  BreastCancer TEXT,
  Genitourinary TEXT,
  Gyneacological TEXT,
  LungsCancer TEXT,
  GITumor TEXT,
  SkinTumor TEXT,
  Hematological TEXT,
  Sarcoma TEXT,
  Carcinoma TEXT,
  FollowUp INTEGER DEFAULT 0,
  ExaminationDate DATETIME,
  DoctorName TEXT
)
```

### Family History

```sql
FamilyHistory (
  RowID INTEGER PRIMARY KEY AUTOINCREMENT,
  PatientID INTEGER NOT NULL,
  Relation INTEGER REFERENCES Relations(ID),
  Disease INTEGER REFERENCES Diseases(ID),
  FOREIGN KEY (PatientID) REFERENCES Patient(PatientID) ON DELETE CASCADE
)
```

### Lifestyle Tables

```sql
PatientAddictions (
  RowID INTEGER PRIMARY KEY AUTOINCREMENT,
  PatientID INTEGER NOT NULL,
  Addiction INTEGER REFERENCES Addictions(ID),
  FOREIGN KEY (PatientID) REFERENCES Patient(PatientID) ON DELETE CASCADE
)

PatientDrinks (
  RowID INTEGER PRIMARY KEY AUTOINCREMENT,
  PatientID INTEGER NOT NULL,
  Drink INTEGER REFERENCES Drinks(ID),
  FOREIGN KEY (PatientID) REFERENCES Patient(PatientID) ON DELETE CASCADE
)

PatientFoods (
  RowID INTEGER PRIMARY KEY AUTOINCREMENT,
  PatientID INTEGER NOT NULL,
  Food INTEGER REFERENCES Foods(ID),
  FOREIGN KEY (PatientID) REFERENCES Patient(PatientID) ON DELETE CASCADE
)
```

## Lab Test Tables

Each specialized lab test has its own table:

```sql
LabTestCBCHB (
  RowID INTEGER PRIMARY KEY AUTOINCREMENT,
  PatientID INTEGER NOT NULL,
  Laboratory INTEGER REFERENCES Laboratories(ID),
  TestDate DATETIME,
  Hb REAL,
  TLC REAL,
  DLC REAL,
  Platelets REAL,
  -- ... other CBC fields
  FOREIGN KEY (PatientID) REFERENCES Patient(PatientID) ON DELETE CASCADE
)

LFT (
  RowID INTEGER PRIMARY KEY AUTOINCREMENT,
  PatientID INTEGER NOT NULL,
  Laboratory INTEGER REFERENCES Laboratories(ID),
  TestDate DATETIME,
  Bilirubin REAL,
  SGPT REAL,
  -- ... other LFT fields
  FOREIGN KEY (PatientID) REFERENCES Patient(PatientID) ON DELETE CASCADE
)

-- Similar structure for:
-- BloodUrea, BloodSugar, Electrolytes, TumorMarkers, PT, ESR, LDH,
-- Calcium, UricAcid, BloodLipids, Bicarbonate, TPort, AntiHCV,
-- HBSag, Urine, UrineDR2, LabOtherTests
```

## Imaging Tables

```sql
xRay, CTScan, MRI, UltraSound, PetScan, BoneScan, Mammography,
Doppler, Endoscopy, Bronchoscopy, Laproscopy, ECG, Echocardiography,
SRS, OtherTests

-- Common structure:
(
  RowID INTEGER PRIMARY KEY AUTOINCREMENT,
  PatientID INTEGER NOT NULL,
  TestDate DATETIME,
  -- ... imaging-specific fields
  FOREIGN KEY (PatientID) REFERENCES Patient(PatientID) ON DELETE CASCADE
)
```

## Pathology Tables

```sql
BoneMarrowBiopsy, Cytogenetics, immunophenotyping, MolecularTest

-- Common structure:
(
  RowID INTEGER PRIMARY KEY AUTOINCREMENT,
  PatientID INTEGER NOT NULL,
  TestDate DATETIME,
  -- ... pathology-specific fields
  FOREIGN KEY (PatientID) REFERENCES Patient(PatientID) ON DELETE CASCADE
)
```

## Treatment Tables

```sql
ChemoTherapy, RadioTherapy, HormonalTherapy, TargettedTherapy,
Surgery, Leukemia, ChronicLeukemia, Myeloma

-- Common structure:
(
  RowID INTEGER PRIMARY KEY AUTOINCREMENT,
  PatientID INTEGER NOT NULL,
  TreatmentDate DATETIME,
  -- ... treatment-specific fields
  FOREIGN KEY (PatientID) REFERENCES Patient(PatientID) ON DELETE CASCADE
)
```

## Lookup Tables

Reference tables with seeded data:

| Table | Purpose |
|-------|---------|
| BloodGroups | A+, A-, B+, B-, AB+, AB-, O+, O- |
| Addictions | Smoking, tobacco, alcohol types |
| Drinks | Alcohol beverage types |
| Foods | Dietary habit types |
| Qualifications | Education levels |
| Occupation | Job types |
| MotherTongue | Languages |
| District | Geographic districts |
| Sports | Sports types |
| Hospitals | Hospital names |
| Laboratories | Lab names |
| Relations | Family relationships |
| Diseases | Disease types |
| Provinces | Geographic provinces |
| Duration | Duration types |
| TypeOfSamples | Sample types |

Cancer type lookup tables:
- BrainTumors, BreastCancer, Carcinoma, Genitourinary, GITumors
- Gynecological, HeadNeckCancer, Hematological, LungsCancer, Sarcoma, SkinTumor

## Views

### vw_patient_list

Lightweight view for patient list/search:

```sql
CREATE VIEW vw_patient_list AS
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
```

### vw_patient_detail

Full patient view with all lookup values resolved:

```sql
CREATE VIEW vw_patient_detail AS
SELECT
  p.*,
  bg.BloodGroup AS BloodGroupName,
  q.QLevel AS QualificationName,
  o.Occupation AS OccupationName,
  mt.MotherTongue AS MotherTongueName,
  d.District AS PlaceOfBirthName,
  sp.Sports AS SportsName,
  h.Hospitals AS HospitalName
FROM Patient p
LEFT JOIN BloodGroups bg ON p.BloodGroup = bg.ID
LEFT JOIN Qualifications q ON p.Qualifications = q.ID
LEFT JOIN Occupation o ON p.Occupation = o.ID
LEFT JOIN MotherTongue mt ON p.MotherTongue = mt.ID
LEFT JOIN District d ON p.PlaceOfBirth = d.ID
LEFT JOIN Sports sp ON p.Sports = sp.ID
LEFT JOIN Hospitals h ON p.Hospital = h.ID;
```

## Relationships

```
Patient (1) ──< (N) FamilyHistory
Patient (1) ──< (N) PatientAddictions
Patient (1) ──< (N) PatientDrinks
Patient (1) ──< (N) PatientFoods
Patient (1) ──< (N) LabTestCBCHB
Patient (1) ──< (N) LFT
... (all lab tables)
Patient (1) ──< (N) xRay
Patient (1) ──< (N) CTScan
... (all imaging tables)
Patient (1) ──< (N) ChemoTherapy
... (all treatment tables)

Patient (N) ──> (1) BloodGroups
Patient (N) ──> (1) Hospitals
Patient (N) ──> (1) Qualifications
... (other lookups)
```

## Validation Rules

- `PatientName`: REQUIRED
- `RegistrationNo`: UNIQUE if provided
- Foreign key fields: Must reference valid ID or be NULL
- Date fields: ISO datetime string or NULL
- Integer flags: 0 or 1 (Educated, DoSports, DoExercise, TreatedBefore, FollowUp)

## Migration Notes

- Old `patients.id` (UUID) → new `Patient.PatientID` (integer)
- Old `patient_vitals` data → merged into Patient (height, weight)
- Old `patient_history` data → new FamilyHistory table
- Old `patient_habits` data → new PatientAddictions/PatientDrinks/PatientFoods
- Old tables will be dropped after migration verified
