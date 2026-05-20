// React Query hooks for report operations
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import type { Report } from '@/lib/db.types';

// Query keys
export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (patientId: number, type?: string) =>
    [...reportKeys.lists(), patientId, type] as const,
  detail: (id: number) => [...reportKeys.all, 'detail', id] as const,
};

// Get reports for a patient
export function useReports(patientId: number, type?: string) {
  return useQuery({
    queryKey: reportKeys.list(patientId, type),
    queryFn: () => reportsApi.list(patientId, type).then((res) =>
      res.success ? res.data : []
    ),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

// Get report types (from TypeOfSamples table)
export function useReportTypes() {
  return useQuery({
    queryKey: [...reportKeys.all, 'types'],
    queryFn: () => reportsApi.getTypes().then((res) =>
      res.success ? res.data : []
    ),
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });
}

// Upload report
export function useUploadReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, formData }: { patientId: number; formData: FormData }) =>
      reportsApi.upload(patientId, formData).then((res) =>
        res.success ? res.data : Promise.reject(new Error(res.error))
      ),
    onSuccess: (data, variables) => {
      // Invalidate reports list for this patient
      queryClient.invalidateQueries({
        queryKey: reportKeys.list(variables.patientId),
      });
    },
  });
}

// Delete report
export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      reportsApi.delete(id).then((res) =>
        res.success ? true : Promise.reject(new Error(res.error))
      ),
    onSuccess: () => {
      // Invalidate all report queries
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
}
