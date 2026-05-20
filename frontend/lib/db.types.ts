// Type definitions for EHR Frontend - New Schema (PascalCase/Integer)
// Matches backend database schema

// Core Types
export type ISODateTime = string;

// Patient Types - New Schema (denormalized with 60+ fields)
export interface Patient {
  PatientID: number;
  RegistrationNo?: string | null;
  RegistrationDate?: ISODateTime | null;
  PatientName: string;
  WOSODO?: string | null;
  RelativeName?: string | null;
  Age?: number | null;
  Height?: number | null;
  HScale?: string | null;
  Weight?: number | null;
  WScale?: string | null;
  Gender?: 'Male' | 'Female' | 'Other' | null;
  MaritalStatus?: string | null;
  NoOfChidren?: number;
  NoOfSibling?: number;
  BloodGroup?: number | null; // FK to BloodGroups.ID
  ContactNo?: string | null;
  CNICNo?: string | null;
  Educated?: number;
  Qualifications?: number | null; // FK to Qualifications.ID
  Occupation?: number | null; // FK to Occupation.ID
  Years?: number | null;
  MonthlyIncome?: number | null;
  WaterUsage?: string | null;
  MotherTongue?: number | null; // FK to MotherTongue.ID
  PlaceOfBirth?: number | null; // FK to District.ID
  DoSports?: number;
  Sports?: number | null; // FK to Sports.ID
  HowOften?: string | null;
  DoExercise?: number;
  Exercise?: string | null;
  Durantion?: string | null;
  PresentAddress?: string | null;
  PermanentAddress?: string | null;
  TreatedBefore?: number;
  AlternativeNameDuration?: string | null;
  MedicalTreatmentSpecify?: string | null;
  PreviousTreatment?: string | null;
  ModeOfPresentation?: string | null;
  PresentedWith?: string | null;
  TreatmentOfferedAtJPMC?: string | null;
  OutComeOfTreatment?: string | null;
  ProposedTreatment?: string | null;
  PlanOfTreatment?: string | null;
  SurgicalProcedure?: string | null;
  SurgicalDate?: ISODateTime | null;
  Hospital?: number | null; // FK to Hospitals.ID
  TNM?: string | null;
  Margins?: string | null;
  LVI?: string | null;
  PNI?: string | null;
  EGFR?: string | null;
  EGFR2?: string | null;
  ENE?: string | null;
  ECE?: string | null;
  NodesDisected?: string | null;
  NodesInvolved?: string | null;
  Metastasis?: string | null;
  SitesOfMetastasis?: string | null;
  TumorLateralityRL?: string | null;
  Quadrant?: string | null;
  TumorSize?: string | null;
  TumorDepth?: string | null;
  TumorResponseToChemo?: string | null;
  Grade?: string | null;
  RadioTherapy?: string | null;
  Dose?: string | null;
  ResponseR?: string | null;
  ChemoRegimen?: string | null;
  Cycles?: string | null;
  ResponseC?: string | null;
  SurgicalOutCome?: string | null;
  SurgicalPathalogy?: string | null;
  StatingTest?: string | null;
  BrainTumor?: string | null;
  HeadAndNeck?: string | null;
  BreastCancer?: string | null;
  Genitourinary?: string | null;
  Gyneacological?: string | null;
  LungsCancer?: string | null;
  GITumor?: string | null;
  SkinTumor?: string | null;
  Hematological?: string | null;
  Sarcoma?: string | null;
  Carcinoma?: string | null;
  FollowUp?: number;
  ExaminationDate?: ISODateTime | null;
  DoctorName?: string | null;
  // Resolved lookup names (from views)
  BloodGroupName?: string | null;
  HospitalName?: string | null;
  QualificationName?: string | null;
  OccupationName?: string | null;
  MotherTongueName?: string | null;
  PlaceOfBirthName?: string | null;
  SportsName?: string | null;
  // Additional fields for compatibility (may not exist in current schema)
  PresentingComplaint?: string | null;
  Comorbidities?: string | null;
  FamilyCancerHistory?: string | null;
  CancerType?: string | null;
  DiagnosisDate?: ISODateTime | null;
  Notes?: string | null;
  WHOClassification?: string | null;
  StAge?: string | null;
  ERStatus?: string | null;
  ERPercent?: string | null;
  PRStatus?: string | null;
  PRPercent?: string | null;
  HER2Status?: string | null;
  Ki67Percent?: string | null;
  Findings?: string | null;
  Indication?: string | null;
  PlanType?: string | null;
  SurgeryPlanned?: string | null;
  NeoadjuvantChemo?: string | null;
}

export interface PatientListItem extends Patient {
  // Additional computed fields for list view
  report_count?: number;
}

export interface CreatePatientInput {
  PatientName: string;
  Age?: number;
  Gender?: 'Male' | 'Female' | 'Other';
  ContactNo?: string;
  CNICNo?: string;
  RegistrationNo?: string;
  RegistrationDate?: string;
  MaritalStatus?: string;
  NoOfChidren?: number;
  NoOfSibling?: number;
  BloodGroup?: number;
  Hospital?: number;
  Qualifications?: number;
  Occupation?: number;
  MotherTongue?: number;
  PlaceOfBirth?: number;
  Sports?: number;
  // Additional fields for compatibility
  PresentingComplaint?: string;
  Comorbidities?: string;
  FamilyCancerHistory?: string;
  CancerType?: string;
  DiagnosisDate?: string;
  Notes?: string;
  WHOClassification?: string;
  StAge?: string;
  Grade?: string;
  TumorSize?: string;
  TumorDepth?: string;
  Margins?: string;
  LVI?: string;
  PNI?: string;
  NodesDisected?: string;
  NodesInvolved?: string;
  ERStatus?: string;
  ERPercent?: string;
  PRStatus?: string;
  PRPercent?: string;
  HER2Status?: string;
  Ki67Percent?: string;
  Findings?: string;
  Indication?: string;
  PlanType?: string;
  SurgeryPlanned?: string;
  NeoadjuvantChemo?: string;
  Smoking?: string;
  SmokingQuantity?: string;
  Pan?: string;
  PanQuantity?: string;
  Gutka?: string;
  GutkaQuantity?: string;
  Naswar?: string;
  NaswarQuantity?: string;
  Alcohol?: string;
  AlcoholQuantity?: string;
  OtherHabits?: string;
  QuitPeriod?: string;
}

export interface UpdatePatientInput extends Partial<CreatePatientInput> {}

// Lab Result Types
export interface LabResult {
  RowID: number;
  PatientID: number;
  Laboratory?: number | null;
  TestDate?: ISODateTime | null;
  [key: string]: any; // Allow for test-specific fields
}

// Imaging Result Types
export interface ImagingResult {
  RowID: number;
  PatientID: number;
  TestDate?: ISODateTime | null;
  [key: string]: any;
}

// Treatment Result Types
export interface TreatmentResult {
  RowID: number;
  PatientID: number;
  TreatmentDate?: ISODateTime | null;
  [key: string]: any;
}

// Pathology Result Types
export interface PathologyResult {
  RowID: number;
  PatientID: number;
  TestDate?: ISODateTime | null;
  [key: string]: any;
}

// Lifestyle Types
export interface LifestyleResult {
  RowID: number;
  PatientID: number;
  [key: string]: any;
}

export interface FamilyHistoryResult {
  RowID: number;
  PatientID: number;
  Relation?: number | null;
  Disease?: number | null;
  Diseases?: string | null; // Resolved name
  Relations?: string | null; // Resolved name
}

// Grouped Response Types
export interface PatientLabs {
  cbc: LabResult[];
  lft: LabResult[];
  bloodSugar: LabResult[];
  bloodUrea: LabResult[];
  electrolytes: LabResult[];
  tumorMarkers: LabResult[];
  pt: LabResult[];
  esr: LabResult[];
  ldh: LabResult[];
  calcium: LabResult[];
  uricAcid: LabResult[];
  bloodLipids: LabResult[];
  bicarbonate: LabResult[];
  tport: LabResult[];
  antiHCV: LabResult[];
  hbsag: LabResult[];
  urine: LabResult[];
  urineDR2: LabResult[];
  otherTests: LabResult[];
}

export interface PatientImaging {
  xray: ImagingResult[];
  ctScan: ImagingResult[];
  mri: ImagingResult[];
  ultrasound: ImagingResult[];
  petScan: ImagingResult[];
  boneScan: ImagingResult[];
  mammography: ImagingResult[];
  doppler: ImagingResult[];
  endoscopy: ImagingResult[];
  bronchoscopy: ImagingResult[];
  laproscopy: ImagingResult[];
  ecg: ImagingResult[];
  echocardiography: ImagingResult[];
  srs: ImagingResult[];
  otherTests: ImagingResult[];
}

export interface PatientTreatments {
  chemo: TreatmentResult[];
  radio: TreatmentResult[];
  hormonal: TreatmentResult[];
  targeted: TreatmentResult[];
  surgery: TreatmentResult[];
  leukemia: TreatmentResult[];
  chronicLeukemia: TreatmentResult[];
  myeloma: TreatmentResult[];
}

export interface PatientPathology {
  boneMarrow: PathologyResult[];
  cytogenetics: PathologyResult[];
  immunophenotyping: PathologyResult[];
  molecular: PathologyResult[];
  imagingFooter?: Record<string, any>;
}

export interface PatientLifestyle {
  addictions: LifestyleResult[];
  drinks: LifestyleResult[];
  foods: LifestyleResult[];
  familyHistory: FamilyHistoryResult[];
}

// Lookup Types
export interface LookupItem {
  ID: number;
  [key: string]: string | number; // Dynamic properties like BloodGroup, Hospitals, etc.
}

export interface BloodGroup extends LookupItem {
  BloodGroup: string;
}

export interface Hospital extends LookupItem {
  Hospitals: string;
}

export interface Qualification extends LookupItem {
  QLevel: string;
}

export interface LookupsResponse {
  bloodGroups: BloodGroup[];
  hospitals: Hospital[];
  laboratories: LookupItem[];
  occupations: LookupItem[];
  qualifications: Qualification[];
  motherTongues: LookupItem[];
  districts: LookupItem[];
  provinces: LookupItem[];
  relations: LookupItem[];
  sports: LookupItem[];
  durations: LookupItem[];
  typeOfSamples: LookupItem[];
  diseases: LookupItem[];
  addictions: LookupItem[];
  drinks: LookupItem[];
  foods: LookupItem[];
  cancerTypes: {
    brainTumors: LookupItem[];
    breastCancer: LookupItem[];
    carcinoma: LookupItem[];
    genitourinary: LookupItem[];
    giTumors: LookupItem[];
    gynecological: LookupItem[];
    headNeckCancer: LookupItem[];
    hematological: LookupItem[];
    lungsCancer: LookupItem[];
    sarcoma: LookupItem[];
    skinTumor: LookupItem[];
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: true;
  data: T;
  count?: number;
}

export interface ApiListResponse<T> {
  success: true;
  data: T[];
  count: number;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// Paginated Response Type
export interface PaginatedResponse<T> {
  patients: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form State Types
export type FormErrors<T extends object> = Partial<Record<keyof T, string[]>>;

export interface FormState<T extends object> {
  values: T;
  errors: FormErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// UI Types
export type PatientListView = 'card' | 'table';

export type PatientDetailTab = 'overview' | 'history' | 'habits' | 'diagnoses' | 'reports';

// Search & Filter Types
export interface PatientSearchParams {
  search?: string;
  page?: number;
  limit?: number;
}

// Utility Types
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

// Vitals type
export interface PatientVitals {
  id: string;
  height_cm?: number;
  weight_kg?: number;
  blood_group?: string;
  recorded_at?: string;
}

// Report type
export interface Report {
  id: string;
  patient_id: string;
  title: string;
  report_type: string;
  notes?: string;
  report_date?: string;
  imAges?: Array<{ url: string; id?: string }>;
  created_at?: string;
}

// Habits input type
export interface CreateHabitsInput {
  Smoking?: string;
  SmokingQuantity?: string;
  Pan?: string;
  PanQuantity?: string;
  Gutka?: string;
  GutkaQuantity?: string;
  Naswar?: string;
  NaswarQuantity?: string;
  Alcohol?: string;
  AlcoholQuantity?: string;
  OtherHabits?: string;
  QuitPeriod?: string;
}

// Legacy diagnosis type (for compatibility during migration)
export interface CancerDiagnosis {
  id: string;
  patient_id: string;
  cancer_type: string;
  stAge?: string;
  grade?: string;
  who_classification?: string;
  diagnosis_date?: string;
  notes?: string;
  tumor_size?: string;
  depth?: string;
  margins?: string;
  lvi?: string;
  pni?: string;
  nodes_recovered?: string;
  nodes_involved?: string;
  er_status?: string;
  er_percentAge?: string;
  pr_status?: string;
  pr_percentAge?: string;
  her2_status?: string;
  ki67_percentAge?: string;
  findings?: string;
  indication?: string;
  plan_type?: string;
  surgery_planned?: string;
  neoadjuvant_chemo?: string;
  study_type?: string;
  study_date?: string;
  imaging_type?: string;
  imaging_date?: string;
  chemo_regimen?: string;
  cycles?: string;
  radio_dose?: string;
  response?: string;
}
