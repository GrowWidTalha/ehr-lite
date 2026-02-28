// React Query hooks for history operations
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { historyApi } from '@/lib/api';
import type { PatientHistory, CreateHistoryInput } from '@/lib/db.types';

// Query keys
export const historyKeys = {
  all: ['history'] as const,
  detail: (patientId: string) => [...historyKeys.all, patientId] as const,
};

// Get patient history
export function usePatientHistory(patientId: string) {
  return useQuery({
    queryKey: historyKeys.detail(patientId),
    queryFn: () => historyApi.get(patientId).then((res) =>
      res.success ? res.data : null
    ),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Update patient history
export function useUpdateHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: CreateHistoryInput }) =>
      historyApi.update(patientId, data).then((res) =>
        res.success ? res.data : Promise.reject(new Error(res.error))
      ),
    onSuccess: (data, variables) => {
      // Update history in cache with response data
      queryClient.setQueryData(historyKeys.detail(variables.patientId), data);
    },
  });
}
