import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface DashboardStats {
  totalPatients: number;
  todayRegistrations: number;
  followUpPatients: number;
  activeDiagnoses: number;
  totalReports: number;
  cancerTypeBreakdown: {
    brainTumor: number;
    headAndNeck: number;
    breastCancer: number;
    genitourinary: number;
    gynecological: number;
    lungsCancer: number;
    giTumor: number;
    skinTumor: number;
    hematological: number;
    sarcoma: number;
    carcinoma: number;
  };
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api<any>('/dashboard/stats');
      if (!res.success) {
        throw new Error(res.error || 'Failed to fetch dashboard stats');
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
