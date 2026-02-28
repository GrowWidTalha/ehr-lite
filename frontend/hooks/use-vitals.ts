// React Query hooks for vitals operations
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vitalsApi } from '@/lib/api';
import type { PatientVitals, CreateVitalsInput } from '@/lib/db.types';

// Query keys
export const vitalsKeys = {
  all: ['vitals'] as const,
  lists: () => [...vitalsKeys.all, 'list'] as const,
  list: (patientId: string) => [...vitalsKeys.lists(), patientId] as const,
};

// Get vitals list for a patient
export function useVitalsList(patientId: string) {
  return useQuery({
    queryKey: vitalsKeys.list(patientId),
    queryFn: () => vitalsApi.list(patientId).then((res) =>
      res.success ? res.data : []
    ),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create new vitals record
export function useCreateVitals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: CreateVitalsInput }) =>
      vitalsApi.create(patientId, data).then((res) =>
        res.success ? res.data : Promise.reject(new Error(res.error))
      ),
    onSuccess: (_, variables) => {
      // Invalidate vitals queries for this patient
      queryClient.invalidateQueries({ queryKey: vitalsKeys.list(variables.patientId) });
    },
  });
}
