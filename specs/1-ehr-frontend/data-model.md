# Data Model: Frontend Types

**Feature**: 1-ehr-frontend
**Date**: 2026-02-25
**Backend Schema**: [database-schema.md](../../../.specify/memory/database-schema.md)

## Overview

This document defines TypeScript types for the frontend that mirror the backend database schema. These types ensure type safety across components, API calls, and form validations.

---

## Core Types

### UUID

```typescript
type UUID = string; // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
```

### Date/Time

```typescript
type ISODateTime = string; // ISO 8601 format: 2024-02-25T10:30:00.000Z
```

---

## Entity Types

### Patient

```typescript
interface Patient {
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

// Patient list item (with computed fields)
interface PatientListItem extends Patient {
  report_count: number;
}

// Patient creation payload
interface CreatePatientInput {
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

// Patient update payload (all fields optional)
interface UpdatePatientInput extends Partial<CreatePatientInput> {}
```

### Patient Vitals

```typescript
interface PatientVitals {
  id: UUID;
  patient_id: UUID;
  height_cm: number | null;
  weight_kg: number | null;
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
  recorded_at: ISODateTime;
}

interface CreateVitalsInput {
  height_cm?: number;
  weight_kg?: number;
  blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
}
```

### Patient History

```typescript
interface PatientHistory {
  id: UUID;
  patient_id: UUID;
  presenting_complaint: string | null;
  comorbidities: string | null;
  family_cancer_history: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

interface CreateHistoryInput {
  presenting_complaint?: string;
  comorbidities?: string;
  family_cancer_history?: string;
}
```

### Patient Habits

```typescript
interface PatientHabits {
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

interface CreateHabitsInput {
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
```

---

## Oncology Types

### Cancer Diagnosis

```typescript
interface CancerDiagnosis {
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
}

// Diagnosis list item with computed fields
interface DiagnosisListItem extends CancerDiagnosis {
  // Add computed fields as needed
}

interface CreateDiagnosisInput {
  cancer_type: string;
  stage?: 'I' | 'II' | 'III' | 'IV';
  grade?: '1' | '2' | '3';
  who_classification?: string;
  diagnosis_date?: string;
}
```

### Pathology Report

```typescript
interface PathologyReport {
  id: UUID;
  diagnosis_id: UUID;
  report_date: ISODateTime | null;
  report_type: string | null;
  pathological_stage: string | null;
  tumor_size: string | null;
  depth: string | null;
  margins: string | null;
  lvi: string | null;
  pni: string | null;
  nodes_recovered: number | null;
  nodes_involved: number | null;
  extra_nodal_extension: string | null;
  surgery_adequacy: string | null;
  recurrence: string | null;
  notes: string | null;
  created_at: ISODateTime;
}

interface CreatePathologyInput {
  diagnosis_id: UUID;
  report_date?: string;
  report_type?: string;
  pathological_stage?: string;
  tumor_size?: string;
  depth?: string;
  margins?: string;
  lvi?: string;
  pni?: string;
  nodes_recovered?: number;
  nodes_involved?: number;
  extra_nodal_extension?: string;
  surgery_adequacy?: string;
  recurrence?: string;
  notes?: string;
}
```

### Biomarker Test

```typescript
interface BiomarkerTest {
  id: UUID;
  diagnosis_id: UUID;
  test_date: ISODateTime | null;
  test_type: string | null;
  er_status: string | null;
  er_percentage: number | null;
  pr_status: string | null;
  pr_percentage: number | null;
  her2_status: string | null;
  her2_score: string | null;
  ki67_percentage: number | null;
  mitosis_count: number | null;
  ihc_markers: string | null;
  tumor_markers: string | null;
  notes: string | null;
  created_at: ISODateTime;
}

interface CreateBiomarkerInput {
  diagnosis_id: UUID;
  test_date?: string;
  test_type?: string;
  er_status?: string;
  er_percentage?: number;
  pr_status?: string;
  pr_percentage?: number;
  her2_status?: string;
  her2_score?: string;
  ki67_percentage?: number;
  mitosis_count?: number;
  ihc_markers?: string;
  tumor_markers?: string;
  notes?: string;
}
```

### Imaging Study

```typescript
interface ImagingStudy {
  id: UUID;
  diagnosis_id: UUID;
  study_type: 'CT' | 'MRI' | 'PET' | 'US' | 'Mammogram' | 'Bone Scan' | 'Echo' | 'BSC';
  study_date: ISODateTime | null;
  findings: string | null;
  indication: string | null;
  notes: string | null;
  created_at: ISODateTime;
}

interface CreateImagingInput {
  diagnosis_id: UUID;
  study_type: 'CT' | 'MRI' | 'PET' | 'US' | 'Mammogram' | 'Bone Scan' | 'Echo' | 'BSC';
  study_date?: string;
  findings?: string;
  indication?: string;
  notes?: string;
}
```

### Treatment Plan

```typescript
interface TreatmentPlan {
  id: UUID;
  diagnosis_id: UUID;
  plan_type: string | null;
  surgery_planned: string;
  radical_surgery: string;
  palliative_surgery: string;
  neoadjuvant_chemo: string;
  adjuvant_chemo: string;
  induction_chemo: string;
  notes: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

interface CreateTreatmentPlanInput {
  diagnosis_id: UUID;
  plan_type?: string;
  surgery_planned?: string;
  radical_surgery?: string;
  palliative_surgery?: string;
  neoadjuvant_chemo?: string;
  adjuvant_chemo?: string;
  induction_chemo?: string;
  notes?: string;
}
```

---

## Document Types

### Report

```typescript
interface Report {
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

// Report grouped by type
interface GroupedReports {
  pathology: Report[];
  imaging: Report[];
  lab: Report[];
  consultation: Report[];
  other: Report[];
}

interface CreateReportInput {
  patient_id: UUID;
  diagnosis_id?: UUID;
  title: string;
  report_type: string;
  notes?: string;
  report_date?: string;
}

interface UpdateReportInput {
  diagnosis_id?: UUID;
  title?: string;
  report_type?: string;
  notes?: string;
  report_date?: string;
}
```

### Report Image

```typescript
interface ReportImage {
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

// Image upload payload
interface CreateImageInput {
  entity_type: string;
  entity_id: UUID;
  image: File;
  caption?: string;
  sequence?: number;
}

interface UpdateImageInput {
  caption?: string;
  sequence?: number;
}
```

---

## API Response Types

### Success Response

```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  count?: number;
}

interface ApiListResponse<T> {
  success: true;
  data: T[];
  count: number;
}
```

### Error Response

```typescript
interface ApiError {
  success: false;
  error: string;
}
```

### Union Type

```typescript
type ApiResult<T> = ApiResponse<T> | ApiError;
```

---

## Form State Types

### Form Errors

```typescript
interface FormErrors<T> {
  [K in keyof T]?: string[];
}
```

### Form State

```typescript
interface FormState<T> {
  values: T;
  errors: FormErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}
```

---

## UI Component Props

### View Toggle

```typescript
type PatientListView = 'card' | 'table';
```

### Tab Navigation

```typescript
type PatientDetailTab = 'overview' | 'history' | 'habits' | 'diagnoses' | 'reports';
```

### Wizard Steps

```typescript
type DiagnosisWizardStep =
  | 'basic'
  | 'pathology'
  | 'biomarker'
  | 'imaging'
  | 'treatment';

interface WizardState {
  currentStep: DiagnosisWizardStep;
  completedSteps: DiagnosisWizardStep[];
  data: Partial<CreateDiagnosisInput & CreatePathologyInput & CreateBiomarkerInput & CreateImagingInput & CreateTreatmentPlanInput>;
}
```

---

## Search & Filter Types

### Patient Search

```typescript
interface PatientSearchParams {
  search?: string;
  limit?: number;
  offset?: number;
}
```

### Report Filters

```typescript
interface ReportFilters {
  patient_id: UUID;
  diagnosis_id?: UUID;
  report_type?: string;
  limit?: number;
  offset?: number;
}
```

---

## Utility Types

### With Required

```typescript
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
```

### Nullable Fields

```typescript
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};
```

---

## Index

All types are exported from `frontend/src/lib/db.types.ts`:

```typescript
export type {
  UUID,
  ISODateTime,
  Patient,
  PatientListItem,
  CreatePatientInput,
  UpdatePatientInput,
  PatientVitals,
  CreateVitalsInput,
  PatientHistory,
  CreateHistoryInput,
  PatientHabits,
  CreateHabitsInput,
  CancerDiagnosis,
  DiagnosisListItem,
  CreateDiagnosisInput,
  PathologyReport,
  CreatePathologyInput,
  BiomarkerTest,
  CreateBiomarkerInput,
  ImagingStudy,
  CreateImagingInput,
  TreatmentPlan,
  CreateTreatmentPlanInput,
  Report,
  GroupedReports,
  CreateReportInput,
  UpdateReportInput,
  ReportImage,
  CreateImageInput,
  UpdateImageInput,
  ApiResponse,
  ApiListResponse,
  ApiError,
  ApiResult,
  FormErrors,
  FormState,
  PatientListView,
  PatientDetailTab,
  DiagnosisWizardStep,
  WizardState,
  PatientSearchParams,
  ReportFilters,
};
```
