// React Query hooks for habits operations - New Schema (lifestyle)
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '@/lib/api';
import type { PatientLifestyle, CreateHabitsInput } from '@/lib/db.types';

// Expanded habits input for onboarding compatibility
export interface HabitsFormData extends CreateHabitsInput {
  smoking_status?: string;
  smoking_quantity?: string;
  pan_use?: string;
  pan_quantity?: string;
  gutka_use?: string;
  gutka_quantity?: string;
  naswar_use?: string;
  naswar_quantity?: string;
  alcohol_use?: string;
  alcohol_quantity?: string;
  other_habits?: string;
  quit_period?: string;
  // New array-based structure
  habits?: Array<{
    addiction_id: number;
    name: string;
    has_habit: boolean;
    quantity: string;
    frequency: string;
    quit: boolean;
    quit_period: string;
  }>;
}

// Query keys
export const habitsKeys = {
  all: ['habits'] as const,
  detail: (patientId: number) => [...habitsKeys.all, patientId] as const,
};

// Get patient habits (now part of lifestyle endpoint)
export function usePatientHabits(patientId: number) {
  return useQuery({
    queryKey: habitsKeys.detail(patientId),
    queryFn: () => patientApi.getLifestyle(patientId).then((res) => {
      if (!res.success) {
        return [];
      }

      // Transform lifestyle addictions to habits array format
      const lifestyle = res.data;
      const addictions = lifestyle.addictions || [];

      return addictions.map((addiction: any) => ({
        addiction_id: addiction.AddictionID,
        name: addiction.Addiction?.Addiction || '',
        has_habit: true, // If it's in the database, they have/had the habit
        quantity: addiction.Quantity?.toString() || '',
        frequency: addiction.Frequency || 'per day',
        quit: addiction.Quit === 'Yes',
        quit_period: addiction.QuitPeriod || '',
      }));
    }),
    enabled: !!patientId && !isNaN(patientId),
    staleTime: 5 * 60 * 1000,
  });
}

// Update patient habits (via patient update)
export function useUpdateHabits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: number; data: HabitsFormData | CreateHabitsInput }) =>
      patientApi.update(patientId, data).then((res) =>
        res.success ? res.data : Promise.reject(new Error(res.error))
      ),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: habitsKeys.detail(variables.patientId) });
      queryClient.invalidateQueries({ queryKey: ['lifestyle', variables.patientId] });
    },
  });
}
