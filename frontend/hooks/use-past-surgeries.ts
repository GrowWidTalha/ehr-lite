// React Query hook for Past Surgeries - New table
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, uploadApi } from '@/lib/api';

// Query keys
export const pastSurgeriesKeys = {
  all: ['pastSurgeries'] as const,
  detail: (id: number) => [...pastSurgeriesKeys.all, id] as const,
  patient: (id: number) => [...pastSurgeriesKeys.all, 'patient', id] as const,
};

// Past Surgeries types
export interface PastSurgery {
  RowID?: number;
  PatientID: number;
  SurgeryDate?: string | null;
  Description: string;
  IsCancerSurgery: number;
  ImagePath?: string | null;
  images?: Array<{ id: string; url: string; fileName: string }>;
  Notes?: string | null;
  HospitalName?: string | null;
  SurgeonName?: string | null;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface CreatePastSurgeryInput {
  SurgeryDate?: string;
  Description: string;
  IsCancerSurgery: number;
  Notes?: string;
  HospitalName?: string;
  SurgeonName?: string;
}

// Get past surgeries for a patient
export function usePastSurgeries(patientId: number | string) {
  return useQuery({
    queryKey: pastSurgeriesKeys.patient(typeof patientId === 'string' ? parseInt(patientId) : patientId),
    queryFn: async () => {
      const result = await api<PastSurgery[]>(`/patients/${patientId}/past-surgeries`);
      return result.success ? result.data : [];
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

// Create past surgery
export function useCreatePastSurgery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: number | string; data: CreatePastSurgeryInput }) =>
      api<PastSurgery>(`/patients/${patientId}/past-surgeries`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      const id = typeof variables.patientId === 'string' ? parseInt(variables.patientId) : variables.patientId;
      queryClient.invalidateQueries({ queryKey: pastSurgeriesKeys.patient(id) });
      queryClient.invalidateQueries({ queryKey: ['patients', id] });
    },
    onError: (error: any) => {
      console.error('Failed to create past surgery:', error);
      throw error;
    },
  });
}

// Update past surgery
export function useUpdatePastSurgery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ surgeryId, data }: { surgeryId: number; data: Partial<CreatePastSurgeryInput> }) =>
      api<PastSurgery>(`/past-surgeries/${surgeryId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pastSurgeriesKeys.all });
    },
  });
}

// Delete past surgery
export function useDeletePastSurgery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, surgeryId }: { patientId: number | string; surgeryId: number }) =>
      api<{ success: boolean }>(`/past-surgeries/${surgeryId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_, variables) => {
      const id = typeof variables.patientId === 'string' ? parseInt(variables.patientId) : variables.patientId;
      queryClient.invalidateQueries({ queryKey: pastSurgeriesKeys.patient(id) });
      queryClient.invalidateQueries({ queryKey: ['patients', id] });
    },
    onError: (error: any) => {
      console.error('Failed to delete past surgery:', error);
      throw error;
    },
  });
}

// Upload surgery images (multiple)
export function useUploadSurgeryImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ surgeryId, files, patientId }: { surgeryId: number; files: File[]; patientId: number }) => {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));

      return uploadApi<{ images: Array<{ id: string; url: string; fileName: string }> }>(
        `/patients/past-surgeries/${surgeryId}/images`,
        formData
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pastSurgeriesKeys.patient(variables.patientId) });
    },
    onError: (error: any) => {
      console.error('Failed to upload surgery images:', error);
      throw error;
    },
  });
}

// Upload single surgery image (legacy, for compatibility)
export function useUploadSurgeryImage() {
  return useMutation({
    mutationFn: ({ surgeryId, file }: { surgeryId: number; file: File }) => {
      const formData = new FormData();
      const files = [file];
      files.forEach(f => formData.append('images', f));

      return uploadApi<{ images: Array<{ id: string; url: string; fileName: string }> }>(
        `/patients/past-surgeries/${surgeryId}/images`,
        formData
      );
    },
    onError: (error: any) => {
      console.error('Failed to upload surgery image:', error);
      throw error;
    },
  });
}
