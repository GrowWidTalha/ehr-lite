// React Query hooks for patient operations
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '@/lib/api';
import type {
  CreatePatientInput,
  Patient,
  PatientListItem,
  UpdatePatientInput,
  PatientSearchParams,
} from '@/lib/db.types';

// Query keys
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (params: PatientSearchParams) => [...patientKeys.lists(), params] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
};

// Get patient list
export function usePatientList(params?: PatientSearchParams) {
  return useQuery({
    queryKey: patientKeys.list(params || {}),
    queryFn: () => patientApi.list(params).then((res) =>
      res.success ? res.data : []
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single patient
export function usePatient(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => patientApi.get(id).then((res) =>
      res.success ? res.data : null
    ),
    enabled: !!id,
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
      queryClient.setQueryData(patientKeys.detail(data.id), data);
    },
  });
}

// Update patient
export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientInput }) =>
      patientApi.update(id, data).then((res) =>
        res.success ? res.data : Promise.reject(new Error(res.error))
      ),
    onSuccess: (data) => {
      // Update patient in cache
      queryClient.setQueryData(patientKeys.detail(data.id), data);
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
}

// Delete patient
export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
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

// Get patient history
export function usePatientHistory(patientId: string) {
  return useQuery({
    queryKey: ['patient-history', patientId],
    queryFn: () => patientApi.get(patientId).then((res: any) => {
      // Extract history from patient data or fetch separately
      // For now, return a mock history object
      return {
        presenting_complaint: res.data?.presenting_complaint || null,
        comorbidities: res.data?.comorbidities || null,
        family_cancer_history: res.data?.family_cancer_history || null,
      };
    }),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

// Get patient habits
export function usePatientHabits(patientId: string) {
  return useQuery({
    queryKey: ['patient-habits', patientId],
    queryFn: () => patientApi.get(patientId).then((res: any) => {
      // Extract habits from patient data or fetch separately
      // For now, return a mock habits object
      return {
        smoking_status: res.data?.smoking_status || null,
        smoking_quantity: res.data?.smoking_quantity || null,
        alcohol_use: res.data?.alcohol_use || null,
      };
    }),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}
