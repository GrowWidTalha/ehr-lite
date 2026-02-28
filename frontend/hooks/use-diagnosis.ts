// React Query hooks for diagnosis operations
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { diagnosisApi } from '@/lib/api';
import type {
  CancerDiagnosis,
  CreateDiagnosisInput,
} from '@/lib/db.types';

// Query keys
export const diagnosisKeys = {
  all: ['diagnoses'] as const,
  lists: () => [...diagnosisKeys.all, 'list'] as const,
  list: (patientId: string) => [...diagnosisKeys.lists(), patientId] as const,
  details: () => [...diagnosisKeys.all, 'detail'] as const,
  detail: (id: string) => [...diagnosisKeys.details(), id] as const,
};

// Get diagnoses for a patient
export function useDiagnoses(patientId: string) {
  return useQuery({
    queryKey: diagnosisKeys.list(patientId),
    queryFn: () => diagnosisApi.list(patientId).then((res) =>
      res.success ? res.data : []
    ),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

// Get single diagnosis
export function useDiagnosis(id: string, patientId: string) {
  return useQuery({
    queryKey: [...diagnosisKeys.detail(id), patientId],
    queryFn: () => diagnosisApi.get(patientId, id).then((res) =>
      res.success ? res.data : null
    ),
    enabled: !!id && !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

// Create diagnosis
export function useCreateDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: CreateDiagnosisInput }) =>
      diagnosisApi.create(patientId, data).then((res) =>
        res.success ? res.data : Promise.reject(new Error(res.error))
      ),
    onSuccess: (data, variables) => {
      // Invalidate diagnoses list for this patient
      queryClient.invalidateQueries({ queryKey: diagnosisKeys.list(variables.patientId) });
      // Add new diagnosis to cache
      queryClient.setQueryData(diagnosisKeys.detail(data.id), data);
    },
  });
}

// Update diagnosis
export function useUpdateDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, id, data }: { patientId: string; id: string; data: Partial<CreateDiagnosisInput> }) =>
      diagnosisApi.update(patientId, id, data).then((res) =>
        res.success ? res.data : Promise.reject(new Error(res.error))
      ),
    onSuccess: (data, variables) => {
      // Update diagnosis in cache
      queryClient.setQueryData([...diagnosisKeys.detail(data.id), variables.patientId], data);
      // Invalidate list for this patient
      queryClient.invalidateQueries({ queryKey: diagnosisKeys.list(variables.patientId) });
    },
  });
}

// Delete diagnosis
export function useDeleteDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, id }: { patientId: string; id: string }) =>
      diagnosisApi.delete(patientId, id).then((res) =>
        res.success ? true : Promise.reject(new Error(res.error))
      ),
    onSuccess: (_, variables) => {
      // Remove diagnosis from cache
      queryClient.removeQueries({ queryKey: diagnosisKeys.detail(variables.id) });
      // Invalidate diagnosis list for this patient
      queryClient.invalidateQueries({ queryKey: diagnosisKeys.list(variables.patientId) });
    },
  });
}
