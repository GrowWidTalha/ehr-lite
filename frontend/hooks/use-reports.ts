// React Query hooks for report operations
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import type { Report } from '@/lib/db.types';

// Query keys
export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (patientId: string, type?: string) =>
    [...reportKeys.lists(), patientId, type] as const,
  detail: (id: string) => [...reportKeys.all, 'detail', id] as const,
};

// Get reports for a patient
export function useReports(patientId: string, type?: string) {
  return useQuery({
    queryKey: reportKeys.list(patientId, type),
    queryFn: () => reportsApi.list(patientId, type).then((res) =>
      res.success ? res.data : []
    ),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

// Upload report
export function useUploadReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, formData }: { patientId: string; formData: FormData }) =>
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
    mutationFn: (id: string) =>
      reportsApi.delete(id).then((res) =>
        res.success ? true : Promise.reject(new Error(res.error))
      ),
    onSuccess: () => {
      // Invalidate all report queries
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
}
