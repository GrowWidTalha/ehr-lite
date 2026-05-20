# EHR Lite — Schema Migration Spec (Option C)

## Context

This is a local-first oncology EHR system built with:
- **Backend:** Node.js + Express.js + sql.js (SQLite) — located in `backend/`
- **Frontend:** Next.js 14 (App Router) + TypeScript — located in `frontend/`
- **DB file:** `backend/data/database.db`

The system currently has two parallel schemas in the same SQLite database:

**OLD schema (to be removed):** snake_case, UUID-based primary keys
- Tables: `patients`, `patient_vitals`, `patient_history`, `patient_habits`, `cancer_diagnoses`, `previous_treatments`, `pathology_reports`, `biomarker_tests`, `imaging_studies`, `treatment_plans`, `treatment_sessions`, `reports`, `report_images`
- Views: `vw_patient_summary`, `vw_diagnosis_detail`

**NEW schema (to be kept, already exists in DB):** PascalCase, integer-based primary keys, mirrors a real oncology Access database
- Core: `Patient`, `FamilyHistory`, `PatientAddictions`, `PatientDrinks`, `PatientFoods`
- Lab tests: `LabTestCBCHB`, `LFT`, `BloodUrea`, `BloodSugar`, `Electrolytes`, `TumorMarkers`, `PT`, `ESR`, `LDH`, `Calcium`, `UricAcid`, `BloodLipids`, `Bicarbonate`, `TPort`, `AntiHCV`, `HBSag`, `Urine`, `UrineDR2`, `LabOtherTests`
- Imaging: `xRay`, `CTScan`, `MRI`, `UltraSound`, `PetScan`, `BoneScan`, `Mammography`, `Doppler`, `Endoscopy`, `Bronchoscopy`, `Laproscopy`, `ECG`, `Echocardiography`, `SRS`, `OtherTests`
- Pathology: `BoneMarrowBiopsy`, `Cytogenetics`, `immunophenotyping`, `MolecularTest`
- Treatment: `ChemoTherapy`, `RadioTherapy`, `HormonalTherapy`, `TargettedTherapy`, `Surgery`, `Leukemia`, `ChronicLeukemia`, `Myeloma`
- Diagnosis summary: `ImagingTestFooter`
- Lookup/reference tables (already seeded with data): `Addictions`, `BloodGroups`, `BrainTumors`, `BreastCancer`, `Carcinoma`, `Diseases`, `District`, `Drinks`, `Duration`, `Foods`, `Genitourinary`, `GITumors`, `Gynecological`, `HeadNeckCancer`, `Hematological`, `Hospitals`, `Laboratories`, `LungsCancer`, `MotherTongue`, `Occupation`, `Province`, `Qualifications`, `Relations`, `Sarcoma`, `SkinTumor`, `Sports`, `SurgeryList`, `TypeOfSamples`

**The `Patient` table full schema:**
```sql
Patient (
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
  DoSports INTEGER DEFAULT 0, Sports INTEGER REFERENCES Sports(ID),
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
  TumorResponseToChemo TEXT, Grade TEXT,
  RadioTherapy TEXT, Dose TEXT, ResponseR TEXT,
  ChemoRegimen TEXT, Cycles TEXT, ResponseC TEXT,
  SurgicalOutCome TEXT, SurgicalPathalogy TEXT, StatingTest TEXT,
  BrainTumor TEXT, HeadAndNeck TEXT, BreastCancer TEXT,
  Genitourinary TEXT, Gyneacological TEXT, LungsCancer TEXT,
  GITumor TEXT, SkinTumor TEXT, Hematological TEXT,
  Sarcoma TEXT, Carcinoma TEXT,
  FollowUp INTEGER DEFAULT 0,
  ExaminationDate DATETIME, DoctorName TEXT
)
```

---

## What You Must Do

### Step 1 — Update the DB schema file

**File:** `backend/src/db/schema.sql`

Rewrite this file completely. The new schema.sql must:

- Drop all old tables at the top using `DROP TABLE IF EXISTS` in reverse dependency order: `report_images`, `reports`, `treatment_sessions`, `treatment_plans`, `imaging_studies`, `biomarker_tests`, `pathology_reports`, `previous_treatments`, `cancer_diagnoses`, `patient_habits`, `patient_history`, `patient_vitals`, `patients`
- Drop old views: `DROP VIEW IF EXISTS vw_patient_summary`, `DROP VIEW IF EXISTS vw_diagnosis_detail`
- Keep all new tables exactly as they are already in the DB (do not recreate, use `CREATE TABLE IF NOT EXISTS`)
- Add two useful views at the end:

```sql
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

---

### Step 2 — Update DB connection and query helpers

**File:** `backend/src/db/connection.js`

Ensure it loads from `backend/data/database.db`. No changes likely needed but verify the path resolves correctly relative to the file's location.

**File:** `backend/src/db/query.js`

If this file has any hardcoded references to old table names (`patients`, `patient_vitals` etc.) update them. Otherwise leave it.

---

### Step 3 — Update init.js

**File:** `backend/src/db/init.js`

The init script currently skips schema execution if any tables already exist. Change the condition to check specifically for the `Patient` table (new schema) instead of any table:

```javascript
const result = db.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='Patient'`);
if (result.length > 0 && result[0].values.length > 0) {
  tablesAlreadyExist = true;
}
```

Also add a step that runs the DROP statements for old tables on first run so the migration happens cleanly when init runs.

---

### Step 4 — Rewrite the patients route

**File:** `backend/src/routes/patients.js`

Rewrite all endpoints to use the new `Patient` table. Here is the exact API contract to implement:

**GET /api/patients**
- Query params: `page` (default 1), `limit` (default 20), `search` (searches PatientName, RegistrationNo, ContactNo)
- Query from `vw_patient_list`
- Return: `{ patients: [...], total, page, limit, totalPages }`

**GET /api/patients/:id**
- `:id` is `PatientID` (integer)
- Query from `vw_patient_detail`
- Return full patient object with resolved lookup names

**POST /api/patients**
- Accept all `Patient` table fields in request body
- For foreign key fields (BloodGroup, Qualifications, Occupation, MotherTongue, PlaceOfBirth, Sports, Hospital) accept the integer ID directly
- Auto-set `RegistrationDate` to current datetime if not provided
- Return the created patient with its `PatientID`

**PUT /api/patients/:id**
- Accept any subset of `Patient` fields
- Update only provided fields
- Return updated patient

**DELETE /api/patients/:id**
- Delete patient and all related records (cascade should handle it)
- Return `{ success: true }`

**GET /api/patients/:id/labs**
- Return all lab results for this patient grouped by type:
```json
{
  "cbc": [...],
  "lft": [...],
  "bloodSugar": [...],
  "bloodUrea": [...],
  "electrolytes": [...],
  "tumorMarkers": [...],
  "pt": [...],
  "esr": [...],
  "ldh": [...],
  "calcium": [...],
  "uricAcid": [...],
  "bloodLipids": [...],
  "bicarbonate": [...],
  "tport": [...],
  "antiHCV": [...],
  "hbsag": [...],
  "urine": [...],
  "urineDR2": [...],
  "otherTests": [...]
}
```

**GET /api/patients/:id/imaging**
- Return all imaging grouped by type:
```json
{
  "xray": [...],
  "ctScan": [...],
  "mri": [...],
  "ultrasound": [...],
  "petScan": [...],
  "boneScan": [...],
  "mammography": [...],
  "doppler": [...],
  "endoscopy": [...],
  "bronchoscopy": [...],
  "laproscopy": [...],
  "ecg": [...],
  "echocardiography": [...],
  "srs": [...],
  "otherTests": [...]
}
```

**GET /api/patients/:id/treatments**
- Return all treatment records grouped:
```json
{
  "chemo": [...],
  "radio": [...],
  "hormonal": [...],
  "targeted": [...],
  "surgery": [...],
  "leukemia": [...],
  "chronicLeukemia": [...],
  "myeloma": [...]
}
```

**GET /api/patients/:id/pathology**
- Return:
```json
{
  "boneMarrow": [...],
  "cytogenetics": [...],
  "immunophenotyping": [...],
  "molecular": [...],
  "imagingFooter": {...}
}
```

**GET /api/patients/:id/lifestyle**
- Return:
```json
{
  "addictions": [...],
  "drinks": [...],
  "foods": [...],
  "familyHistory": [...]
}
```

For all sub-resource endpoints, join with the relevant lookup table where applicable (e.g. join `Surgery` with `SurgeryList` to return `SurgeryType` name, join `FamilyHistory` with `Diseases` and `Relations`).

---

### Step 5 — Add lookup endpoints

**File:** `backend/src/routes/patients.js` or a new file `backend/src/routes/lookups.js`

Add a single endpoint:

**GET /api/lookups**

Returns all lookup table data in one call (used by frontend dropdowns):

```json
{
  "bloodGroups": [...],
  "addictions": [...],
  "diseases": [...],
  "districts": [...],
  "drinks": [...],
  "durations": [...],
  "foods": [...],
  "hospitals": [...],
  "laboratories": [...],
  "motherTongues": [...],
  "occupations": [...],
  "provinces": [...],
  "qualifications": [...],
  "relations": [...],
  "sports": [...],
  "surgeryTypes": [...],
  "typeOfSamples": [...],
  "cancerTypes": {
    "brainTumors": [...],
    "breastCancer": [...],
    "carcinoma": [...],
    "genitourinary": [...],
    "giTumors": [...],
    "gynecological": [...],
    "headNeckCancer": [...],
    "hematological": [...],
    "lungsCancer": [...],
    "sarcoma": [...],
    "skinTumor": [...]
  }
}
```

Register this route in `server.js` as `app.use('/api/lookups', lookupsRouter)`.

---

### Step 6 — Update dashboard route

**File:** `backend/src/routes/dashboard.js`

Update all queries to use new table names. Key stats to return:

```javascript
{
  totalPatients: "SELECT COUNT(*) FROM Patient",
  todayRegistrations: "SELECT COUNT(*) FROM Patient WHERE date(RegistrationDate) = date('now')",
  followUpPatients: "SELECT COUNT(*) FROM Patient WHERE FollowUp = 1",
  cancerTypeBreakdown: "query Patient grouping by cancer type columns",
  recentPatients: "SELECT from vw_patient_list ORDER BY RegistrationDate DESC LIMIT 5"
}
```

---

### Step 7 — Update export and import services

**File:** `backend/src/services/export.service.js`

Update any SQL queries that reference old table names to use new ones.

**File:** `backend/src/services/import.service.js`

Update column mappings to match new `Patient` table columns. The import likely reads from Excel — map Excel headers to new column names.

**File:** `backend/src/utils/excel.mapper.js`

Update field mappings to new schema columns.

---

### Step 8 — Update frontend API types

**File:** `frontend/lib/db.types.ts`

Replace old type definitions with new ones matching the new schema. Key types needed:

```typescript
export interface Patient {
  PatientID: number;
  RegistrationNo?: string;
  RegistrationDate?: string;
  PatientName: string;
  Age?: number;
  Gender?: string;
  ContactNo?: string;
  CNICNo?: string;
  BloodGroup?: number;
  BloodGroupName?: string; // from view join
  Hospital?: number;
  HospitalName?: string; // from view join
  DoctorName?: string;
  FollowUp?: number;
  ExaminationDate?: string;
  // ... all other Patient fields
}

export interface LabResult {
  RowID: number;
  PatientID: number;
  Laboratory?: number;
  TestDate?: string;
}

export interface LookupItem {
  ID: number;
  [key: string]: string | number;
}

export interface LookupsResponse {
  bloodGroups: LookupItem[];
  hospitals: LookupItem[];
  laboratories: LookupItem[];
  // ... etc
}
```

---

### Step 9 — Update frontend API client

**File:** `frontend/lib/api.ts`

Update all API calls to use new field names and endpoints. Key changes:

- Patient list: response now has `PatientID` not `id`, `PatientName` not `full_name`, etc.
- Add `getPatientLabs(id)`, `getPatientImaging(id)`, `getPatientTreatments(id)`, `getPatientPathology(id)`, `getPatientLifestyle(id)` functions
- Add `getLookups()` function

---

### Step 10 — Update frontend hooks

Update these hooks to use new field names:
- `frontend/hooks/use-patients.ts` — `PatientID`, `PatientName`, `RegistrationNo` etc.
- `frontend/hooks/use-diagnosis.ts` — remap to new treatment/pathology endpoints
- `frontend/hooks/use-habits.ts` — remap to `/lifestyle` endpoint
- `frontend/hooks/use-history.ts` — remap to `FamilyHistory` data
- `frontend/hooks/use-vitals.ts` — patient vitals now live directly on `Patient` row

Add a new hook: `frontend/hooks/use-lookups.ts` that fetches and caches `/api/lookups`.

---

### Step 11 — Update frontend components (minimal changes)

Only update field name references in these components, do not redesign the UI:

- `frontend/components/patients/patient-table.tsx` — column keys
- `frontend/components/patients/patient-card.tsx` — field references
- `frontend/components/patients/patient-form.tsx` — field names + add lookup dropdowns for BloodGroup, Hospital, Occupation, Qualifications, MotherTongue, District
- `frontend/app/patients/new/page.tsx` — form submission field names
- `frontend/app/onboarding/new/page.tsx` — same

---

## Rules to Follow

- **Do not redesign any UI.** Only change field names and data sources.
- **Do not delete** `report_images` table logic from the images route — the image upload system stays as-is since it uses `entity_type` + `entity_id` pattern that works with any ID.
- **Keep** `backend/src/routes/backup.js`, `backend/src/routes/export.js`, `backend/src/routes/import.js`, `backend/src/routes/images.js`, `backend/src/routes/reports.js` — only update SQL queries inside them, not the route structure.
- All SQL must use `db.exec()` for SELECT and `db.run()` for INSERT/UPDATE/DELETE, matching the existing pattern in `query.js`.
- After every DB write, call the existing save function to persist the `.db` file to disk (check how `connection.js` handles this).
- The `PatientID` is an integer autoincrement — never generate UUIDs for the `Patient` table.
- Keep the `report_images` table untouched — it still works fine with integer PatientIDs as `entity_id`.
- Run the app after changes and verify: patient list loads, patient create works, lookups endpoint returns data.

---

## Files To Modify (complete list)

```
backend/src/db/schema.sql          ← rewrite
backend/src/db/init.js             ← update table existence check
backend/src/db/query.js            ← update if old table refs exist
backend/src/routes/patients.js     ← full rewrite
backend/src/routes/dashboard.js    ← update queries
backend/src/routes/lookups.js      ← create new
backend/src/server.js              ← register lookups route
backend/src/services/export.service.js   ← update column names
backend/src/services/import.service.js   ← update column mappings
backend/src/utils/excel.mapper.js        ← update field map
frontend/lib/db.types.ts           ← rewrite types
frontend/lib/api.ts                ← update all calls
frontend/hooks/use-patients.ts     ← update field names
frontend/hooks/use-diagnosis.ts    ← remap endpoints
frontend/hooks/use-habits.ts       ← remap to lifestyle
frontend/hooks/use-history.ts      ← remap to family history
frontend/hooks/use-vitals.ts       ← remap to Patient fields
frontend/hooks/use-lookups.ts      ← create new
frontend/components/patients/patient-table.tsx   ← column keys
frontend/components/patients/patient-card.tsx    ← field refs
frontend/components/patients/patient-form.tsx    ← fields + dropdowns
frontend/app/patients/new/page.tsx               ← field names
frontend/app/onboarding/new/page.tsx             ← field names
```

