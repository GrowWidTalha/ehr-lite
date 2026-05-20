// React Query hook for lookup data - New Schema
'use client';

import { useQuery } from '@tanstack/react-query';
import { lookupsApi } from '@/lib/api';
import type { LookupsResponse } from '@/lib/db.types';

// Query keys
export const lookupsKeys = {
  all: ['lookups'] as const,
};

// Get all lookup data for dropdowns
export function useLookups() {
  return useQuery({
    queryKey: lookupsKeys.all,
    queryFn: () => lookupsApi.getAll().then((res) =>
      res.success ? res.data : {
        bloodGroups: [],
        hospitals: [],
        laboratories: [],
        occupations: [],
        qualifications: [],
        motherTongues: [],
        districts: [],
        provinces: [],
        relations: [],
        sports: [],
        durations: [],
        typeOfSamples: [],
        diseases: [],
        addictions: [],
        drinks: [],
        foods: [],
        cancerTypes: {
          brainTumors: [],
          breastCancer: [],
          carcinoma: [],
          genitourinary: [],
          giTumors: [],
          gynecological: [],
          headNeckCancer: [],
          hematological: [],
          lungsCancer: [],
          sarcoma: [],
          skinTumor: []
        }
      }
    ),
    staleTime: 60 * 60 * 1000, // 1 hour - lookups change infrequently
  });
}

// Convenience hooks for specific lookup types
export function useBloodGroups() {
  const { data } = useLookups();
  return data?.bloodGroups || [];
}

export function useHospitals() {
  const { data } = useLookups();
  return data?.hospitals || [];
}

export function useLaboratories() {
  const { data } = useLookups();
  return data?.laboratories || [];
}

export function useOccupations() {
  const { data } = useLookups();
  return data?.occupations || [];
}

export function useQualifications() {
  const { data } = useLookups();
  return data?.qualifications || [];
}
