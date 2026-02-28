// Patient card component - User Story 1
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, User } from 'lucide-react';
import type { PatientListItem } from '@/lib/db.types';
import { formatDate } from '@/lib/utils';

interface PatientCardProps {
  patient: PatientListItem;
}

export function PatientCard({ patient }: PatientCardProps) {
  return (
    <Link href={`/patients/${patient.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg leading-tight">
                  {patient.full_name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {patient.age ? `${patient.age} years` : 'Age unknown'} • {patient.sex || 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span>{patient.phone || 'No phone'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Reg: {patient.registration_date ? formatDate(patient.registration_date) : 'Unknown'}</span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className="gap-1">
              <FileText className="h-3 w-3" />
              {patient.report_count || 0} Reports
            </Badge>
            {patient.diagnosis_count !== undefined && patient.diagnosis_count > 0 && (
              <Badge variant="secondary">
                {patient.diagnosis_count} Diagnosis{patient.diagnosis_count > 1 ? 'es' : ''}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
