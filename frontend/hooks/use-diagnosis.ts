// React Query hooks for diagnosis/treatment data - New Schema
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '@/lib/api';
import type { PatientTreatments, PatientPathology, CancerDiagnosis } from '@/lib/db.types';

// Query keys
export const diagnosisKeys = {
  all: ['diagnosis'] as const,
  detail: (id: number) => [...diagnosisKeys.all, id] as const,
  treatments: (id: number) => [...diagnosisKeys.all, 'treatments', id] as const,
  pathology: (id: number) => [...diagnosisKeys.all, 'pathology', id] as const,
};

// Diagnosis input for creation/update
export interface CreateDiagnosisInput {
  PatientID?: number;
  CancerType?: string;
  DiagnosisDate?: string;
  Stage?: string;
  Notes?: string;
  // Old field names for compatibility
  cancer_type?: string;
  stAge?: string;
  stage?: string;
  grade?: string;
  who_classification?: string;
  diagnosis_date?: string;
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
  study_type?: string;
  study_date?: string;
  findings?: string;
  indication?: string;
  plan_type?: string;
  surgery_planned?: string;
  neoadjuvant_chemo?: string;
}

// Get patient diagnosis (combined treatments and pathology)
export function useDiagnosis(id: number) {
  return useQuery({
    queryKey: diagnosisKeys.detail(id),
    queryFn: async () => {
      const [treatmentsRes, pathologyRes] = await Promise.all([
        patientApi.getTreatments(id),
        patientApi.getPathology(id)
      ]);

      return {
        treatments: treatmentsRes.success ? treatmentsRes.data : {},
        pathology: pathologyRes.success ? pathologyRes.data : {}
      };
    },
    enabled: !!id && !isNaN(id),
    staleTime: 5 * 60 * 1000,
  });
}

// Get all diagnoses for a patient (from patient record for compatibility)
export function useDiagnoses(id: number) {
  return useQuery({
    queryKey: diagnosisKeys.detail(id),
    queryFn: async () => {
      const res = await patientApi.get(id);
      if (!res.success) return [];

      const patient = res.data;
      // Check if patient has cancer diagnosis data
      if (!patient.CancerType) return [];

      // Transform patient diagnosis data to CancerDiagnosis format
      const diagnosis: CancerDiagnosis = {
        id: `diagnosis-${patient.PatientID}`,
        patient_id: patient.PatientID.toString(),
        cancer_type: patient.CancerType || '',
        stAge: patient.StAge || undefined,
        grade: (patient as any).Grade || undefined,
        who_classification: patient.WHOClassification || undefined,
        diagnosis_date: patient.DiagnosisDate || undefined,
        notes: patient.Notes || undefined,
        margins: (patient as any).Margins || undefined,
        lvi: (patient as any).LVI || undefined,
        pni: (patient as any).PNI || undefined,
        nodes_recovered: (patient as any).NodesDisected || undefined,
        nodes_involved: (patient as any).NodesInvolved || undefined,
        findings: (patient as any).Findings || undefined,
        indication: (patient as any).Indication || undefined,
        plan_type: (patient as any).PlanType || undefined,
        surgery_planned: (patient as any).SurgeryPlanned || undefined,
        neoadjuvant_chemo: (patient as any).NeoadjuvantChemo || undefined,
        study_type: (patient as any).StudyType || undefined,
        study_date: (patient as any).StudyDate || undefined,
        imaging_type: (patient as any).ImagingType || undefined,
        imaging_date: (patient as any).ImagingDate || undefined,
        chemo_regimen: (patient as any).ChemoRegimen || undefined,
        cycles: (patient as any).Cycles || undefined,
        radio_dose: (patient as any).RadioDose || undefined,
        response: (patient as any).ResponseR || undefined,
      };

      return [diagnosis];
    },
    enabled: !!id && !isNaN(id),
    staleTime: 5 * 60 * 1000,
  });
}

// Get patient treatments (chemo, radio, hormonal, etc.)
export function usePatientTreatments(id: number) {
  return useQuery({
    queryKey: diagnosisKeys.treatments(id),
    queryFn: () => patientApi.getTreatments(id).then((res) =>
      res.success ? res.data : {
        chemo: [], radio: [], hormonal: [], targeted: [],
        surgery: [], leukemia: [], chronicLeukemia: [], myeloma: []
      }
    ),
    enabled: !!id && !isNaN(id),
    staleTime: 5 * 60 * 1000,
  });
}

// Get patient pathology results
export function usePatientPathology(id: number) {
  return useQuery({
    queryKey: diagnosisKeys.pathology(id),
    queryFn: () => patientApi.getPathology(id).then((res) =>
      res.success ? res.data : {
        boneMarrow: [], cytogenetics: [], immunophenotyping: [], molecular: [], imagingFooter: null
      }
    ),
    enabled: !!id && !isNaN(id),
    staleTime: 5 * 60 * 1000,
  });
}

// Create diagnosis (updates patient with cancer diagnosis info)
export function useCreateDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: number; data: CreateDiagnosisInput }) =>
      patientApi.update(patientId, data).then((res) =>
        res.success ? res.data : Promise.reject(new Error(res.error))
      ),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: diagnosisKeys.detail(variables.patientId) });
      queryClient.invalidateQueries({ queryKey: diagnosisKeys.treatments(variables.patientId) });
      queryClient.invalidateQueries({ queryKey: diagnosisKeys.pathology(variables.patientId) });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.patientId] });
    },
  });
}

// Update diagnosis (via patient update)
export function useUpdateDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: number; data: CreateDiagnosisInput }) =>
      patientApi.update(patientId, data).then((res) =>
        res.success ? res.data : Promise.reject(new Error(res.error))
      ),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: diagnosisKeys.detail(variables.patientId) });
      queryClient.invalidateQueries({ queryKey: diagnosisKeys.treatments(variables.patientId) });
      queryClient.invalidateQueries({ queryKey: diagnosisKeys.pathology(variables.patientId) });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.patientId] });
    },
  });
}

// Delete diagnosis (clears cancer diagnosis info from patient)
export function useDeleteDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId }: { patientId: number }) =>
      patientApi.update(patientId, {
        BrainTumor: '',
        HeadAndNeck: '',
        BreastCancer: '',
        Genitourinary: '',
        Gyneacological: '',
        LungsCancer: '',
        GITumor: '',
        SkinTumor: '',
        Hematological: '',
        Sarcoma: '',
        Carcinoma: '',
        DiagnosisDate: '',
        StAge: '',
        Grade: '',
        WHOClassification: '',
        Notes: '',
      } as any).then((res) =>
        res.success ? res.data : Promise.reject(new Error(res.error))
      ),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: diagnosisKeys.detail(variables.patientId) });
      queryClient.invalidateQueries({ queryKey: diagnosisKeys.treatments(variables.patientId) });
      queryClient.invalidateQueries({ queryKey: diagnosisKeys.pathology(variables.patientId) });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.patientId] });
    },
  });
}
