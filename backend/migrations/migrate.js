import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATA_DIR
  ? path.join(process.env.DATA_DIR, 'database.db')
  : path.resolve(__dirname, '../data/database.db');

const SQL = await initSqlJs();

let db;
if (fs.existsSync(dbPath)) {
  const buffer = fs.readFileSync(dbPath);
  db = new SQL.Database(buffer);
  console.log('Loaded existing database');
} else {
  db = new SQL.Database();
  console.log('Created new database');
}

db.run('PRAGMA foreign_keys = ON');

const statements = [
  `CREATE TABLE IF NOT EXISTS Addictions (ID INTEGER PRIMARY KEY, Addiction TEXT)`,
  `CREATE TABLE IF NOT EXISTS BloodGroups (ID INTEGER PRIMARY KEY, BloodGroup TEXT)`,
  `CREATE TABLE IF NOT EXISTS BrainTumors (ID INTEGER PRIMARY KEY, HistrologicalTypes TEXT)`,
  `CREATE TABLE IF NOT EXISTS BreastCancer (ID INTEGER PRIMARY KEY, BreastCancer TEXT)`,
  `CREATE TABLE IF NOT EXISTS Carcinoma (ID INTEGER PRIMARY KEY, Carcinoma TEXT)`,
  `CREATE TABLE IF NOT EXISTS Diseases (ID INTEGER PRIMARY KEY, Diseases TEXT)`,
  `CREATE TABLE IF NOT EXISTS District (ID INTEGER PRIMARY KEY, District TEXT)`,
  `CREATE TABLE IF NOT EXISTS Drinks (ID INTEGER PRIMARY KEY, Drinks TEXT)`,
  `CREATE TABLE IF NOT EXISTS Duration (ID INTEGER PRIMARY KEY, Duration TEXT)`,
  `CREATE TABLE IF NOT EXISTS Foods (ID INTEGER PRIMARY KEY, Food TEXT)`,
  `CREATE TABLE IF NOT EXISTS Genitourinary (ID INTEGER PRIMARY KEY, Genitourinary TEXT)`,
  `CREATE TABLE IF NOT EXISTS GITumors (ID INTEGER PRIMARY KEY, GITumors TEXT)`,
  `CREATE TABLE IF NOT EXISTS Gynecological (ID INTEGER PRIMARY KEY, Gynecological TEXT)`,
  `CREATE TABLE IF NOT EXISTS HeadNeckCancer (ID INTEGER PRIMARY KEY, HeadNeckCancer TEXT)`,
  `CREATE TABLE IF NOT EXISTS Hematological (ID INTEGER PRIMARY KEY, Hematological TEXT)`,
  `CREATE TABLE IF NOT EXISTS Hospitals (ID INTEGER PRIMARY KEY, Hospitals TEXT)`,
  `CREATE TABLE IF NOT EXISTS Laboratories (ID INTEGER PRIMARY KEY, LabName TEXT)`,
  `CREATE TABLE IF NOT EXISTS LungsCancer (ID INTEGER PRIMARY KEY, LungsCancer TEXT)`,
  `CREATE TABLE IF NOT EXISTS MotherTongue (ID INTEGER PRIMARY KEY, MotherTongue TEXT)`,
  `CREATE TABLE IF NOT EXISTS Occupation (ID INTEGER PRIMARY KEY, Occupation TEXT)`,
  `CREATE TABLE IF NOT EXISTS Province (ID INTEGER PRIMARY KEY, Province TEXT)`,
  `CREATE TABLE IF NOT EXISTS Qualifications (ID INTEGER PRIMARY KEY, QLevel TEXT)`,
  `CREATE TABLE IF NOT EXISTS Relations (ID INTEGER PRIMARY KEY, Relations TEXT)`,
  `CREATE TABLE IF NOT EXISTS Sarcoma (ID INTEGER PRIMARY KEY, Sarcoma TEXT)`,
  `CREATE TABLE IF NOT EXISTS SkinTumor (ID INTEGER PRIMARY KEY, SkinTumor TEXT)`,
  `CREATE TABLE IF NOT EXISTS Sports (ID INTEGER PRIMARY KEY, Sports TEXT)`,
  `CREATE TABLE IF NOT EXISTS SurgeryList (ID INTEGER PRIMARY KEY, SurgeryType TEXT)`,
  `CREATE TABLE IF NOT EXISTS TypeOfSamples (ID INTEGER PRIMARY KEY, TypeOfSample TEXT)`,

  `CREATE TABLE IF NOT EXISTS Patient (
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
    PlanType TEXT, SurgeryPlanned TEXT, NeoadjuvantChemo TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS FamilyHistory (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Diseas INTEGER REFERENCES Diseases(ID),
    Type TEXT,
    Relation INTEGER REFERENCES Relations(ID)
  )`,

  `CREATE TABLE IF NOT EXISTS PatientAddictions (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    AddictionID INTEGER REFERENCES Addictions(ID),
    Quantity INTEGER, QScale TEXT, Frequency TEXT, Quit TEXT, QuitPeriod TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS PatientDrinks (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    DrinkID INTEGER REFERENCES Drinks(ID),
    Cup INTEGER, Since TEXT, Frequency INTEGER, Quit TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS PatientFoods (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    FoodID INTEGER REFERENCES Foods(ID),
    Quantity INTEGER, Since TEXT, Frequency INTEGER, Quit TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS LabTestCBCHB (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, R4to16 TEXT, TLC TEXT, Neutron TEXT,
    Lympho TEXT, PLT1to600 TEXT, Blast TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS LFT (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, TotalBilirubin TEXT, DirectBilirubin TEXT,
    IndirectBilirubin TEXT, SGPTALT TEXT, SGOTAST TEXT,
    GamaGT TEXT, AlkalinePhosphatase TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS BloodUrea (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, BloodUrea TEXT, SerumCreatinine TEXT,
    CreatinineCleareance TEXT, SerumMg TEXT, SerumPhosphate TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS BloodSugar (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, BloodSugar TEXT, Fasting TEXT, Random REAL
  )`,

  `CREATE TABLE IF NOT EXISTS Electrolytes (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, SerumSodium TEXT, SerumPotasium TEXT,
    SerumChloride TEXT, SMagnasium TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS TumorMarkers (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, CA125 TEXT, CEA TEXT, CA199 TEXT,
    PSA TEXT, BHCG TEXT, AFP TEXT, HR2 TEXT, LDH TEXT, CA153 TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS PT (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, PT TEXT, CTRL1 TEXT, INR TEXT, APTT TEXT, CTRL2 TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS ESR (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, ESR TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS LDH (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, LDH TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS Calcium (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Calcium TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS UricAcid (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, UricAcid TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS BloodLipids (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, BloodLipids TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS Bicarbonate (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Bicarbonate TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS TPort (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, TPort TEXT, Albumin TEXT, Globulin TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS AntiHCV (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Reactive TEXT, Treated TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS HBSag (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Reactive TEXT, Treated TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS Urine (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, DR TEXT, Other TEXT,
    UrineChemicalSPGravity TEXT, Urobilinogel TEXT,
    LeucocytesEsterase TEXT, UnrinePhysicalColor TEXT, UrineAppearance TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS UrineDR2 (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, PhysicalColor TEXT, PhysicalVolume TEXT,
    Appearance TEXT, ChemicalSpecificGravity TEXT, ReactionPH TEXT,
    Protein TEXT, Glucose TEXT, Bilirubin TEXT, Urobillinogen TEXT,
    Niterate TEXT, Leukocytes TEXT, RedBloodCells TEXT, EpithelialCells TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS LabOtherTests (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, TestName TEXT, Result TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS xRay (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Area TEXT, Remarks TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS CTScan (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Area TEXT, Remarks TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS MRI (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Area TEXT, Remarks TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS UltraSound (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, NameOfCenter TEXT, Remarks TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS PetScan (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, NameOfCenter TEXT, Remarks TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS BoneScan (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Result TEXT, Center TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS Mammography (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, RTBIRads TEXT, LTBIRads TEXT, Report TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS Doppler (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Site TEXT, Result TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS Endoscopy (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Result TEXT, Center TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS Bronchoscopy (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Result TEXT, Center TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS Laproscopy (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Result TEXT, Center TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS ECG (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, State TEXT, Finding TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS Echocardiography (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, State TEXT, Finding TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS SRS (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Site TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS OtherTests (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, TestName TEXT, Result TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS BoneMarrowBiopsy (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, State TEXT, Result TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS Cytogenetics (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, State TEXT, Result TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS immunophenotyping (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, State TEXT, Result TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS MolecularTest (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, State TEXT, Result TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS ChemoTherapy (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Type TEXT, Cycle INTEGER
  )`,

  `CREATE TABLE IF NOT EXISTS RadioTherapy (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, Dose TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS HormonalTherapy (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, NameOfTest TEXT, Duration TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS TargettedTherapy (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, NameOfTest TEXT, Duration TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS Surgery (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME,
    Type INTEGER REFERENCES SurgeryList(ID)
  )`,

  `CREATE TABLE IF NOT EXISTS Leukemia (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, ForAcuteLeukemia TEXT, TypeOfLeukemia TEXT, Protocol TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS ChronicLeukemia (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, TypeOfLeukemia TEXT, DrugRegimen TEXT, Duration TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS Myeloma (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER REFERENCES Patient(PatientID),
    Laboratory INTEGER REFERENCES Laboratories(ID),
    TestDate DATETIME, DrugRegimen TEXT, Duration TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS ImagingTestFooter (
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
  )`,

  // Report Types for categorizing medical reports
  `CREATE TABLE IF NOT EXISTS ReportTypes (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    TypeCode TEXT UNIQUE NOT NULL,
    TypeName TEXT NOT NULL,
    Category TEXT NOT NULL,
    Description TEXT,
    DisplayOrder INTEGER DEFAULT 0,
    IsActive INTEGER DEFAULT 1
  )`,

  `CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES Patient(PatientID),
    diagnosis_id INTEGER,
    title TEXT,
    report_type TEXT,
    category TEXT DEFAULT 'Other',
    notes TEXT,
    report_date DATETIME,
    facility_name TEXT,
    ordering_physician TEXT,
    clinical_context TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS report_images (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    image_path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE INDEX IF NOT EXISTS idx_reporttypes_category ON ReportTypes(Category)`,
  `CREATE INDEX IF NOT EXISTS idx_reporttypes_code ON ReportTypes(TypeCode)`,
  `CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category)`,
  `CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type)`,
  `CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(report_date)`,
  `CREATE INDEX IF NOT EXISTS idx_reports_diagnosis ON reports(diagnosis_id)`,

  // Past Records and Past Surgeries tables
  `CREATE TABLE IF NOT EXISTS PastRecords (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER NOT NULL REFERENCES Patient(PatientID) ON DELETE CASCADE,
    PreviousChemo TEXT,
    PreviousRT TEXT,
    PreviousTargeted TEXT,
    PreviousHT TEXT,
    PreviousIT TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS PastSurgeries (
    RowID INTEGER PRIMARY KEY AUTOINCREMENT,
    PatientID INTEGER NOT NULL REFERENCES Patient(PatientID) ON DELETE CASCADE,
    SurgeryDate DATETIME,
    Description TEXT NOT NULL,
    IsCancerSurgery INTEGER DEFAULT 0,
    ImagePath TEXT,
    Notes TEXT,
    HospitalName TEXT,
    SurgeonName TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE INDEX IF NOT EXISTS idx_pastrecords_patient ON PastRecords(PatientID)`,

  `CREATE INDEX IF NOT EXISTS idx_pastsurgeries_patient ON PastSurgeries(PatientID)`,

  `CREATE INDEX IF NOT EXISTS idx_pastsurgeries_cancer ON PastSurgeries(IsCancerSurgery)`,

  // Create views for patient data access
  `CREATE VIEW IF NOT EXISTS vw_patient_list AS
    SELECT p.*,
      bg.BloodGroup AS BloodGroupName,
      h.Hospitals AS HospitalName,
      q.QLevel AS QualificationName,
      o.Occupation AS OccupationName,
      d.District AS PlaceOfBirthName
    FROM Patient p
    LEFT JOIN BloodGroups bg ON p.BloodGroup = bg.ID
    LEFT JOIN Hospitals h ON p.Hospital = h.ID
    LEFT JOIN Qualifications q ON p.Qualifications = q.ID
    LEFT JOIN Occupation o ON p.Occupation = o.ID
    LEFT JOIN District d ON p.PlaceOfBirth = d.ID`,
];

let created = 0;
let skipped = 0;

for (const stmt of statements) {
  try {
    db.run(stmt);
    if (stmt.includes('CREATE TABLE')) {
      const match = stmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
      if (match) {
        console.log(`✅ ${match[1]}`);
        created++;
      }
    } else if (stmt.includes('CREATE VIEW')) {
      const match = stmt.match(/CREATE VIEW IF NOT EXISTS (\w+)/i);
      if (match) {
        console.log(`✅ ${match[1]}`);
        created++;
      }
    }
  } catch (e) {
    console.error(`❌ Error: ${e.message}`);
    skipped++;
  }
}

// Save
const data = db.export();
fs.writeFileSync(dbPath, Buffer.from(data));
db.close();

console.log(`\nDone — ${created} tables/views created, ${skipped} errors`);
console.log(`Saved to: ${dbPath}`);