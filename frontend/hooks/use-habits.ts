// React Query hooks for habits operations
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { habitsApi } from '@/lib/api';
import type { PatientHabits, CreateHabitsInput } from '@/lib/db.types';

// Query keys
export const habitsKeys = {
  all: ['habits'] as const,
  detail: (patientId: string) => [...habitsKeys.all, patientId] as const,
};

// Get patient habits
export function usePatientHabits(patientId: string) {
  return useQuery({
    queryKey: habitsKeys.detail(patientId),
    queryFn: () => habitsApi.get(patientId).then((res) =>
      res.success ? res.data : null
    ),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Update patient habits
export function useUpdateHabits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: CreateHabitsInput }) =>
      habitsApi.update(patientId, data).then((res) =>
        res.success ? res.data : Promise.reject(new Error(res.error))
      ),
    onSuccess: (_, variables) => {
      // Update habits in cache
      queryClient.setQueryData(habitsKeys.detail(variables.patientId), variables.data);
    },
  });
}
