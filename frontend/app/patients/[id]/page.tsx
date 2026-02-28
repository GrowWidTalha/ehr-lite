// Patient detail page - User Story 3
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePatient } from '@/hooks/use-patients';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, FileText, Edit } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { formatDate } from '@/lib/utils';
import { OverviewTab } from '@/components/patients/tabs/overview-tab';
import { HistoryTab } from '@/components/patients/tabs/history-tab';
import { HabitsTab } from '@/components/patients/tabs/habits-tab';
import { DiagnosesTab } from '@/components/patients/tabs/diagnoses-tab';
import { ReportsTab } from '@/components/patients/tabs/reports-tab';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: patient, isLoading, error } = usePatient(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Patient Not Found</CardTitle>
            <CardDescription>
              The requested patient could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>Back to Patients</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{patient.full_name}</h1>
                <p className="text-sm text-muted-foreground">
                  {patient.age ? `${patient.age} years` : 'Age unknown'} • {patient.sex || 'Unknown'}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Patient
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="habits">Habits</TabsTrigger>
            <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab patient={patient} />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <HistoryTab patientId={patient.id} />
          </TabsContent>

          <TabsContent value="habits" className="space-y-6">
            <HabitsTab patientId={patient.id} />
          </TabsContent>

          <TabsContent value="diagnoses" className="space-y-6">
            <DiagnosesTab patientId={patient.id} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsTab patientId={patient.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
