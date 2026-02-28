// Zod validation schemas for EHR Frontend
import { z } from 'zod';

// Patient Validation Schema
export const patientSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  age: z.number().min(0).max(150).optional(),
  sex: z.enum(['Male', 'Female', 'Other']).optional(),
  phone: z.string().optional(),
  cnic: z.string().optional(),
  registration_number: z.string().optional(),
  registration_date: z.string().optional(),
  marital_status: z.string().optional(),
  education: z.string().optional(),
  language: z.string().optional(),
  territory: z.string().optional(),
  children_count: z.number().min(0).optional(),
  sibling_count: z.number().min(0).optional(),
});

export const createPatientSchema = patientSchema.extend({
  full_name: z.string().min(1, 'Name is required'),
});

// Vitals Validation Schema
export const vitalsSchema = z.object({
  height_cm: z.number().min(0).max(300).optional(),
  weight_kg: z.number().min(0).max(500).optional(),
  blood_group: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
});

// History Validation Schema
export const historySchema = z.object({
  presenting_complaint: z.string().optional(),
  comorbidities: z.string().optional(),
  family_cancer_history: z.string().optional(),
});

// Habits Validation Schema
export const habitsSchema = z.object({
  smoking_status: z.enum(['Never', 'Former', 'Current']).optional(),
  smoking_quantity: z.string().optional(),
  pan_use: z.enum(['Never', 'Former', 'Current']).optional(),
  pan_quantity: z.string().optional(),
  gutka_use: z.enum(['Never', 'Former', 'Current']).optional(),
  gutka_quantity: z.string().optional(),
  naswar_use: z.enum(['Never', 'Former', 'Current']).optional(),
  naswar_quantity: z.string().optional(),
  alcohol_use: z.enum(['Never', 'Former', 'Current']).optional(),
  alcohol_quantity: z.string().optional(),
  other_habits: z.string().optional(),
  quit_period: z.string().optional(),
});

// Diagnosis Validation Schema
export const diagnosisSchema = z.object({
  cancer_type: z.string().min(1, 'Cancer type is required'),
  stage: z.enum(['I', 'II', 'III', 'IV']).optional(),
  grade: z.enum(['1', '2', '3']).optional(),
  who_classification: z.string().optional(),
  diagnosis_date: z.string().optional(),
});

// Report Validation Schema
export const reportSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  report_type: z.string().min(1, 'Report type is required'),
  notes: z.string().optional(),
  report_date: z.string().optional(),
  diagnosis_id: z.string().uuid().optional(),
});

// Search Validation Schema
export const searchSchema = z.object({
  search: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

// Export type for form inference
export type PatientFormData = z.infer<typeof patientSchema>;
export type CreatePatientFormData = z.infer<typeof createPatientSchema>;
export type VitalsFormData = z.infer<typeof vitalsSchema>;
export type HistoryFormData = z.infer<typeof historySchema>;
export type HabitsFormData = z.infer<typeof habitsSchema>;
export type DiagnosisFormData = z.infer<typeof diagnosisSchema>;
export type ReportFormData = z.infer<typeof reportSchema>;
