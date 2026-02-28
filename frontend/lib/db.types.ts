// Type definitions for EHR Frontend
// Matches backend database schema

// Core Types
export type UUID = string;
export type ISODateTime = string;

// Patient Types
export interface Patient {
  id: UUID;
  registration_number: string | null;
  registration_date: ISODateTime | null;
  full_name: string;
  age: number | null;
  sex: 'Male' | 'Female' | 'Other' | null;
  phone: string | null;
  cnic: string | null;
  marital_status: string | null;
  education: string | null;
  language: string | null;
  territory: string | null;
  children_count: number;
  sibling_count: number;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface PatientListItem extends Patient {
  report_count: number;
  diagnosis_count?: number;
}

export interface CreatePatientInput {
  full_name: string;
  age?: number;
  sex?: 'Male' | 'Female' | 'Other';
  phone?: string;
  cnic?: string;
  registration_number?: string;
  registration_date?: string;
  marital_status?: string;
  education?: string;
  language?: string;
  territory?: string;
  children_count?: number;
  sibling_count?: number;
}

export interface UpdatePatientInput extends Partial<CreatePatientInput> {}

// Vitals Types
export interface PatientVitals {
  id: UUID;
  patient_id: UUID;
  height_cm: number | null;
  weight_kg: number | null;
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
  recorded_at: ISODateTime;
}

export interface CreateVitalsInput {
  height_cm?: number;
  weight_kg?: number;
  blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
}

// History Types
export interface PatientHistory {
  id: UUID;
  patient_id: UUID;
  presenting_complaint: string | null;
  comorbidities: string | null;
  family_cancer_history: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CreateHistoryInput {
  presenting_complaint?: string;
  comorbidities?: string;
  family_cancer_history?: string;
}

// Habits Types
export interface PatientHabits {
  id: UUID;
  patient_id: UUID;
  smoking_status: 'Never' | 'Former' | 'Current' | null;
  smoking_quantity: string | null;
  pan_use: 'Never' | 'Former' | 'Current' | null;
  pan_quantity: string | null;
  gutka_use: 'Never' | 'Former' | 'Current' | null;
  gutka_quantity: string | null;
  naswar_use: 'Never' | 'Former' | 'Current' | null;
  naswar_quantity: string | null;
  alcohol_use: 'Never' | 'Former' | 'Current' | null;
  alcohol_quantity: string | null;
  other_habits: string | null;
  quit_period: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CreateHabitsInput {
  smoking_status?: 'Never' | 'Former' | 'Current';
  smoking_quantity?: string;
  pan_use?: 'Never' | 'Former' | 'Current';
  pan_quantity?: string;
  gutka_use?: 'Never' | 'Former' | 'Current';
  gutka_quantity?: string;
  naswar_use?: 'Never' | 'Former' | 'Current';
  naswar_quantity?: string;
  alcohol_use?: 'Never' | 'Former' | 'Current';
  alcohol_quantity?: string;
  other_habits?: string;
  quit_period?: string;
}

// Diagnosis Types
export interface CancerDiagnosis {
  id: UUID;
  patient_id: UUID;
  cancer_type: string;
  stage: 'I' | 'II' | 'III' | 'IV' | null;
  grade: '1' | '2' | '3' | null;
  who_classification: string | null;
  diagnosis_date: ISODateTime | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  image_count?: number;
  // Pathology fields
  tumor_size?: string | null;
  depth?: string | null;
  margins?: string | null;
  lvi?: string | null;
  pni?: string | null;
  nodes_recovered?: number | null;
  nodes_involved?: number | null;
  // Biomarker fields
  er_status?: string | null;
  er_percentage?: string | null;
  pr_status?: string | null;
  pr_percentage?: string | null;
  her2_status?: string | null;
  ki67_percentage?: string | null;
  // Imaging fields
  study_type?: string | null;
  study_date?: string | null;
  findings?: string | null;
  indication?: string | null;
  // Treatment fields
  plan_type?: string | null;
  surgery_planned?: string | null;
  neoadjuvant_chemo?: string | null;
  adjuvant_chemo?: string | null;
}

export interface CreateDiagnosisInput {
  cancer_type: string;
  stage?: 'I' | 'II' | 'III' | 'IV';
  grade?: '1' | '2' | '3';
  who_classification?: string;
  diagnosis_date?: string;
  // Pathology
  tumor_size?: string;
  depth?: string;
  margins?: string;
  lvi?: string;
  pni?: string;
  nodes_recovered?: string;
  nodes_involved?: string;
  // Biomarkers
  er_status?: string;
  er_percentage?: string;
  pr_status?: string;
  pr_percentage?: string;
  her2_status?: string;
  ki67_percentage?: string;
  // Imaging
  study_type?: string;
  study_date?: string;
  findings?: string;
  indication?: string;
  // Treatment
  plan_type?: string;
  surgery_planned?: string;
  neoadjuvant_chemo?: string;
  adjuvant_chemo?: string;
}

// Report Types
export interface Report {
  id: UUID;
  patient_id: UUID;
  diagnosis_id: UUID | null;
  title: string;
  report_type: string;
  notes: string | null;
  report_date: ISODateTime | null;
  created_at: ISODateTime;
  image_count?: number;
}

export interface GroupedReports {
  pathology: Report[];
  imaging: Report[];
  lab: Report[];
  consultation: Report[];
  other: Report[];
}

export interface CreateReportInput {
  patient_id: UUID;
  diagnosis_id?: UUID;
  title: string;
  report_type: string;
  notes?: string;
  report_date?: string;
}

export interface UpdateReportInput {
  diagnosis_id?: UUID;
  title?: string;
  report_type?: string;
  notes?: string;
  report_date?: string;
}

// Image Types
export interface ReportImage {
  id: UUID;
  entity_type: string;
  entity_id: UUID;
  image_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  caption: string | null;
  sequence: number;
  captured_at: ISODateTime;
  created_at: ISODateTime;
}

export interface CreateImageInput {
  entity_type: string;
  entity_id: UUID;
  image: File;
  caption?: string;
  sequence?: number;
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

export type DiagnosisWizardStep =
  | 'basic'
  | 'pathology'
  | 'biomarker'
  | 'imaging'
  | 'treatment';

export interface WizardState {
  currentStep: DiagnosisWizardStep;
  completedSteps: DiagnosisWizardStep[];
  data: Partial<CreateDiagnosisInput>;
}

// Search & Filter Types
export interface PatientSearchParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ReportFilters {
  patient_id: UUID;
  diagnosis_id?: UUID;
  report_type?: string;
  limit?: number;
  offset?: number;
}

// Utility Types
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};
