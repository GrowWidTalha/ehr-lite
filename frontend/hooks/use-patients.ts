// React Query hooks for patient operations - New Schema (PascalCase/Integer)
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '@/lib/api';
import type {
  CreatePatientInput,
  Patient,
  PatientListItem,
  UpdatePatientInput,
  PatientSearchParams,
  PatientLabs,
  PatientImaging,
  PatientTreatments,
  PatientPathology,
  PatientLifestyle,
} from '@/lib/db.types';

// Query keys
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (params: PatientSearchParams) => [...patientKeys.lists(), params] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: number) => [...patientKeys.details(), id] as const,
  labs: (id: number) => [...patientKeys.all, 'labs', id] as const,
  imaging: (id: number) => [...patientKeys.all, 'imaging', id] as const,
  treatments: (id: number) => [...patientKeys.all, 'treatments', id] as const,
  pathology: (id: number) => [...patientKeys.all, 'pathology', id] as const,
  lifestyle: (id: number) => [...patientKeys.all, 'lifestyle', id] as const,
};

// Get patient list
export function usePatientList(params?: PatientSearchParams) {
  return useQuery({
    queryKey: patientKeys.list(params || {}),
    queryFn: () => patientApi.list(params).then((res) =>
      res.success ? res.data : { patients: [], total: 0, page: 1, limit: 20, totalPages: 0 }
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single patient
export function usePatient(id: number) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => patientApi.get(id).then((res) =>
      res.success ? res.data : null
    ),
    enabled: !!id && !isNaN(id),
    staleTime: 5 * 60 * 1000,
  });
}

// Create patient
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePatientInput) =>
      patientApi.create(data).then((res) =>
        res.success ? res.data : Promise.reject(new Error(res.error))
      ),
    onSuccess: (data) => {
      // Invalidate patient list queries
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      // Add new patient to cache
      queryClient.setQueryData(patientKeys.detail(data.PatientID), data);
    },
  });
}

// Update patient
export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePatientInput }) =>
      patientApi.update(id, data).then((res) =>
        res.success ? res.data : Promise.reject(new Error(res.error))
      ),
    onSuccess: (data) => {
      // Update patient in cache
      queryClient.setQueryData(patientKeys.detail(data.PatientID), data);
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
}

// Delete patient
export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      patientApi.delete(id).then((res) =>
        res.success ? true : Promise.reject(new Error(res.error))
      ),
    onSuccess: (_, id) => {
      // Remove patient from cache
      queryClient.removeQueries({ queryKey: patientKeys.detail(id) });
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
}

// Get patient labs
export function usePatientLabs(id: number) {
  return useQuery({
    queryKey: patientKeys.labs(id),
    queryFn: () => patientApi.getLabs(id).then((res) =>
      res.success ? res.data : {
        cbc: [], lft: [], bloodSugar: [], bloodUrea: [], electrolytes: [],
        tumorMarkers: [], pt: [], esr: [], ldh: [], calcium: [], uricAcid: [],
        bloodLipids: [], bicarbonate: [], tport: [], antiHCV: [],
        hbsag: [], urine: [], urineDR2: [], otherTests: []
      }
    ),
    enabled: !!id && !isNaN(id),
    staleTime: 5 * 60 * 1000,
  });
}

// Get patient imaging
export function usePatientImaging(id: number) {
  return useQuery({
    queryKey: patientKeys.imaging(id),
    queryFn: () => patientApi.getImaging(id).then((res) =>
      res.success ? res.data : {
        xray: [], ctScan: [], mri: [], ultrasound: [], petScan: [],
        boneScan: [], mammography: [], doppler: [], endoscopy: [],
        bronchoscopy: [], laproscopy: [], ecg: [], echocardiography: [],
        srs: [], otherTests: []
      }
    ),
    enabled: !!id && !isNaN(id),
    staleTime: 5 * 60 * 1000,
  });
}

// Get patient treatments
export function usePatientTreatments(id: number) {
  return useQuery({
    queryKey: patientKeys.treatments(id),
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

// Get patient pathology
export function usePatientPathology(id: number) {
  return useQuery({
    queryKey: patientKeys.pathology(id),
    queryFn: () => patientApi.getPathology(id).then((res) =>
      res.success ? res.data : {
        boneMarrow: [], cytogenetics: [], immunophenotyping: [], molecular: [], imagingFooter: null
      }
    ),
    enabled: !!id && !isNaN(id),
    staleTime: 5 * 60 * 1000,
  });
}

// Get patient lifestyle
export function usePatientLifestyle(id: number) {
  return useQuery({
    queryKey: patientKeys.lifestyle(id),
    queryFn: () => patientApi.getLifestyle(id).then((res) =>
      res.success ? res.data : {
        addictions: [], drinks: [], foods: [], familyHistory: []
      }
    ),
    enabled: !!id && !isNaN(id),
    staleTime: 5 * 60 * 1000,
  });
}
