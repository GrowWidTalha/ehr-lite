'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Activity, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  className?: string;
}

function StatCard({ title, value, change, icon, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className={change.startsWith('+') ? 'text-green-600' : 'text-muted-foreground'}>
              {change}
            </span>
            {' '}this month
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  totalPatients?: number;
  activeDiagnoses?: number;
  totalReports?: number;
  newThisMonth?: number;
  className?: string;
}

export function DashboardStats({
  totalPatients = 0,
  activeDiagnoses = 0,
  totalReports = 0,
  newThisMonth = 0,
  className
}: DashboardStatsProps) {
  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      <StatCard
        title="Total Patients"
        value={totalPatients}
        change={newThisMonth > 0 ? `+${newThisMonth} new` : undefined}
        icon={<Users className="h-4 w-4" />}
      />
      <StatCard
        title="Active Diagnoses"
        value={activeDiagnoses}
        icon={<Activity className="h-4 w-4" />}
      />
      <StatCard
        title="Medical Reports"
        value={totalReports}
        icon={<FileText className="h-4 w-4" />}
      />
      <StatCard
        title="Patient Growth"
        value={totalPatients > 0 ? `${Math.round((newThisMonth / totalPatients) * 100)}%` : '0%'}
        change={newThisMonth > 0 ? 'Growing' : undefined}
        icon={<TrendingUp className="h-4 w-4" />}
      />
    </div>
  );
}
