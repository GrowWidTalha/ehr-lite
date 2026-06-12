// React Query hook for Report Types
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Query keys
export const reportTypesKeys = {
  all: ['reportTypes'] as const,
  categories: ['reportTypes', 'categories'] as const,
  category: (category: string) => [...reportTypesKeys.all, 'category', category] as const,
};

// Report type interface
export interface ReportType {
  id: number;
  code: string;
  name: string;
  category: string;
  description?: string;
  displayOrder: number;
}

// Get all report types grouped by category
export function useReportTypes() {
  return useQuery({
    queryKey: reportTypesKeys.all,
    queryFn: async () => {
      const result = await api<Record<string, ReportType[]>>('/reports/types');
      return result.success ? result.data : {};
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get report types for a specific category
export function useReportTypesByCategory(category: string) {
  return useQuery({
    queryKey: reportTypesKeys.category(category),
    queryFn: async () => {
      const result = await api<Record<string, ReportType[]>>(`/reports/types?category=${category}`);
      return result.success ? result.data : {};
    },
    enabled: !!category,
    staleTime: 10 * 60 * 1000,
  });
}

// Get all report categories
export function useReportCategories() {
  return useQuery({
    queryKey: reportTypesKeys.categories,
    queryFn: async () => {
      const result = await api<string[]>('/reports/categories');
      return result.success ? result.data : [];
    },
    staleTime: 10 * 60 * 1000,
  });
}
