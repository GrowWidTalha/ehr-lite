// React Query hook for Past Records - New tables
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Query keys
export const pastRecordsKeys = {
  all: ['pastRecords'] as const,
  detail: (id: number) => [...pastRecordsKeys.all, id] as const,
  patient: (id: number) => [...pastRecordsKeys.all, 'patient', id] as const,
};

// Past Records types
export interface PastRecords {
  RowID?: number;
  PatientID: number;
  PreviousChemo?: string | null;
  PreviousRT?: string | null;
  PreviousTargeted?: string | null;
  PreviousHT?: string | null;
  PreviousIT?: string | null;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface CreatePastRecordsInput {
  PreviousChemo?: string;
  PreviousRT?: string;
  PreviousTargeted?: string;
  PreviousHT?: string;
  PreviousIT?: string;
}

// Get past records for a patient
export function usePastRecords(patientId: number | string) {
  return useQuery({
    queryKey: pastRecordsKeys.patient(typeof patientId === 'string' ? parseInt(patientId) : patientId),
    queryFn: async () => {
      const result = await api<PastRecords | null>(`/patients/${patientId}/past-records`);
      return result.success ? result.data : null;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

// Create or update past records
export function useUpdatePastRecords() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: number | string; data: CreatePastRecordsInput }) =>
      api<PastRecords>(`/patients/${patientId}/past-records`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      const id = typeof variables.patientId === 'string' ? parseInt(variables.patientId) : variables.patientId;
      queryClient.invalidateQueries({ queryKey: pastRecordsKeys.patient(id) });
      queryClient.invalidateQueries({ queryKey: ['patients', id] });
    },
  });
}
