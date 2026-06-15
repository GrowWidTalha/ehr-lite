// Clinical Records tab component - Merged Surgeries, Diagnosis, and Past History
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiagnosesTab } from '@/components/patients/tabs/diagnoses-tab';
import { PastSurgeriesTab } from '@/components/patients/tabs/past-surgeries-tab';
import { PastHistoryTab } from '@/components/patients/tabs/past-history-tab';
import { FileText, Scissors, History } from 'lucide-react';

interface ClinicalRecordsTabProps {
  patientId: string;
}

export function ClinicalRecordsTab({ patientId }: ClinicalRecordsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Clinical Records</CardTitle>
          <CardDescription>
            Complete medical record including diagnoses, surgeries, and treatment history
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="diagnoses">
            <div className="flex flex-col md:flex-row gap-6 mt-4">
              {/* Left Sidebar - Vertical Tabs */}
              <TabsList className="flex flex-row md:flex-col h-fit w-full md:w-48 gap-2 bg-muted/30 p-3 rounded-xl border">
                <TabsTrigger
                  value="diagnoses"
                  className="w-full justify-start gap-3 h-11 px-4 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border-primary/50 hover:bg-accent/50 transition-all"
                >
                  <FileText className="h-4 w-4" />
                  Diagnoses
                </TabsTrigger>
                <TabsTrigger
                  value="surgeries"
                  className="w-full justify-start gap-3 h-11 px-4 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border-primary/50 hover:bg-accent/50 transition-all"
                >
                  <Scissors className="h-4 w-4" />
                  Surgeries
                </TabsTrigger>
                <TabsTrigger
                  value="pastHistory"
                  className="w-full justify-start gap-3 h-11 px-4 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border-primary/50 hover:bg-accent/50 transition-all"
                >
                  <History className="h-4 w-4" />
                  Past History
                </TabsTrigger>
              </TabsList>

              {/* Right Content Area */}
              <div className="flex-1 min-w-0">
                <TabsContent value="diagnoses" className="space-y-4 mt-0">
                  <DiagnosesTab patientId={patientId} />
                </TabsContent>

                <TabsContent value="surgeries" className="space-y-4 mt-0">
                  <PastSurgeriesTab patientId={patientId} />
                </TabsContent>

                <TabsContent value="pastHistory" className="space-y-4 mt-0">
                  <PastHistoryTab patientId={patientId} />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
