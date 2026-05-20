// React Query hook for patient lifestyle data - New Schema
'use client';

import { useQuery } from '@tanstack/react-query';
import { patientApi } from '@/lib/api';
import type { PatientLifestyle } from '@/lib/db.types';

// Query keys
export const lifestyleKeys = {
  all: ['lifestyle'] as const,
  detail: (id: number) => [...lifestyleKeys.all, id] as const,
};

// Get patient lifestyle data (addictions, drinks, foods, family history)
export function usePatientLifestyle(id: number) {
  return useQuery({
    queryKey: lifestyleKeys.detail(id),
    queryFn: () => patientApi.getLifestyle(id).then((res) =>
      res.success ? res.data : {
        addictions: [],
        drinks: [],
        foods: [],
        familyHistory: []
      }
    ),
    enabled: !!id && !isNaN(id),
    staleTime: 5 * 60 * 1000,
  });
}
