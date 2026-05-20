// React Query hook for patient vitals - New Schema (Patient fields)
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '@/lib/api';
import type { Patient, CreatePatientInput } from '@/lib/db.types';

// Query keys
export const vitalsKeys = {
  all: ['vitals'] as const,
  detail: (id: number) => [...vitalsKeys.all, id] as const,
  list: (id: number) => [...vitalsKeys.all, 'list', id] as const,
};

// Vitals data extracted from Patient table
export interface PatientVitals {
  height?: number | null;
  weight?: number | null;
  bloodGroup?: string | null;
  hScale?: string | null;
  wScale?: string | null;
}

// Vitals input for creation
export interface CreateVitalsInput {
  Height?: number;
  Weight?: number;
  HScale?: string;
  WScale?: string;
  BloodGroup?: number;
  height_cm?: number;
  weight_kg?: number;
  blood_group?: string | number;
}

// Get patient vitals (now fields in Patient table)
export function usePatientVitals(id: number) {
  return useQuery({
    queryKey: vitalsKeys.detail(id),
    queryFn: () => patientApi.get(id).then((res) => {
      if (res.success && res.data) {
        return {
          height: res.data.Height,
          weight: res.data.Weight,
          bloodGroup: res.data.BloodGroupName,
          hScale: res.data.HScale,
          wScale: res.data.WScale
        } as PatientVitals;
      }
      return {} as PatientVitals;
    }),
    enabled: !!id && !isNaN(id),
    staleTime: 5 * 60 * 1000,
  });
}

// Get list of vitals for a patient (same as patient vitals)
export function useVitalsList(id: number) {
  return usePatientVitals(id);
}

// Create/update patient vitals (via patient update)
export function useCreateVitals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: number; data: CreateVitalsInput }) =>
      patientApi.update(patientId, data).then((res) =>
        res.success ? res.data : Promise.reject(new Error(res.error))
      ),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: vitalsKeys.detail(variables.patientId) });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.patientId] });
    },
  });
}
