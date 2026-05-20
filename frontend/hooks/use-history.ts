// React Query hook for patient family history - New Schema
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '@/lib/api';
import type { PatientLifestyle } from '@/lib/db.types';

// Query keys
export const historyKeys = {
  all: ['history'] as const,
  detail: (id: number) => [...historyKeys.all, id] as const,
};

// History input for update
export interface UpdateHistoryInput {
  PresentingComplaint?: string;
  Comorbidities?: string;
  FamilyCancerHistory?: string;
}

// Get patient family history (from patient record)
export function usePatientHistory(id: number) {
  return useQuery({
    queryKey: historyKeys.detail(id),
    queryFn: () => patientApi.get(id).then((res) => {
      if (res.success) {
        const patient = res.data;
        return {
          PresentingComplaint: patient.PresentingComplaint || undefined,
          Comorbidities: patient.Comorbidities || undefined,
          FamilyCancerHistory: patient.FamilyCancerHistory || undefined,
        };
      }
      return {
        PresentingComplaint: undefined,
        Comorbidities: undefined,
        FamilyCancerHistory: undefined,
      };
    }),
    enabled: !!id && !isNaN(id),
    staleTime: 5 * 60 * 1000,
  });
}

// Update patient family history (via patient update)
export function useUpdateHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: number; data: UpdateHistoryInput }) =>
      patientApi.update(patientId, data).then((res) =>
        res.success ? res.data : Promise.reject(new Error(res.error))
      ),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: historyKeys.detail(variables.patientId) });
      queryClient.invalidateQueries({ queryKey: ['lifestyle', variables.patientId] });
    },
  });
}
