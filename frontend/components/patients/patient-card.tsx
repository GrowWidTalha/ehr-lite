// Patient card component - New Schema (PascalCase/Integer)
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
    <Link href={`/patients/${patient.PatientID}`}>
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-[var(--color-blue)]/10 flex items-center justify-center group-hover:bg-[var(--color-blue)]/20 transition-colors">
                <User className="h-5 w-5 text-[var(--color-blue)]" />
              </div>
              <div>
                <CardTitle className="text-lg leading-tight">
                  {patient.PatientName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {patient.Age ? `${patient.Age} years` : 'Age unknown'} • {patient.Gender || 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span>{patient.ContactNo || 'No ContactNo'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Reg: {patient.RegistrationDate ? formatDate(patient.RegistrationDate) : 'Unknown'}</span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Badge variant="blue" className="gap-1">
              <FileText className="h-3 w-3" />
              {patient.report_count || 0} Reports
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
