// Overview tab component - User Story 3
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Calendar, Phone, FileText, Plus, PenTool } from 'lucide-react';
import Link from 'next/link';
import type { Patient } from '@/lib/db.types';
import { formatDate } from '@/lib/utils';
import { useDiagnoses } from '@/hooks/use-diagnosis';
import { useVitalsList } from '@/hooks/use-vitals';
import { VitalsForm } from '@/components/patients/vitals-form';
import { VitalsHistory } from '@/components/patients/vitals-history';

interface OverviewTabProps {
  patient: Patient;
}

export function OverviewTab({ patient }: OverviewTabProps) {
  const { data: diagnoses } = useDiagnoses(patient.id);
  const { data: vitals } = useVitalsList(patient.id);
  const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Patient Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Patient Information</CardTitle>
            <Link href={`/patients/${patient.id}/edit`}>
              <Button variant="outline" size="sm">
                <PenTool className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">{patient.full_name}</p>
              <p className="text-sm text-muted-foreground">
                {patient.age ? `${patient.age} years` : 'Age unknown'} • {patient.sex || 'Unknown'}
              </p>
            </div>
          </div>

          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{patient.phone || 'No phone recorded'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Registered: {patient.registration_date ? formatDate(patient.registration_date) : 'Unknown'}</span>
            </div>
            {patient.cnic && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>CNIC: {patient.cnic}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vitals Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vitals</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setVitalsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Vitals
            </Button>
          </div>
          <CardDescription>Latest vital signs measurements</CardDescription>
        </CardHeader>
        <CardContent>
          <VitalsHistory vitals={vitals || []} />
        </CardContent>
      </Card>

      {/* Active Diagnoses Card */}
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Diagnoses</CardTitle>
              <CardDescription>Recorded cancer diagnoses</CardDescription>
            </div>
            <Link href={`/patients/${patient.id}/diagnoses/new`}>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Diagnosis
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {diagnoses && diagnoses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {diagnoses.map((diagnosis) => (
                <Card key={diagnosis.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{diagnosis.cancer_type}</h4>
                      <Badge variant="secondary">{diagnosis.stage || 'Unknown Stage'}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Grade: {diagnosis.grade || 'Unknown'}</p>
                      {diagnosis.who_classification && (
                        <p>WHO: {diagnosis.who_classification}</p>
                      )}
                      {diagnosis.diagnosis_date && (
                        <p>Diagnosed: {formatDate(diagnosis.diagnosis_date)}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No diagnoses recorded yet.</p>
              <Link href={`/patients/${patient.id}/diagnoses/new`}>
                <Button className="mt-4" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Diagnosis
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vitals Form Dialog */}
      <VitalsForm
        patientId={patient.id}
        open={vitalsDialogOpen}
        onOpenChange={setVitalsDialogOpen}
      />
    </div>
  );
}
