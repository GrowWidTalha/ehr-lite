import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
  total_patients: number;
  active_diagnoses: number;
  total_reports: number;
  new_this_month: number;
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/stats`);
      if (!res.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
