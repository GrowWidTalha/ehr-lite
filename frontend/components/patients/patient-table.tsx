// Patient table component - New Schema (PascalCase/Integer)
'use client';

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import type { PatientListItem } from '@/lib/db.types';
import { formatDate } from '@/lib/utils';

interface PatientTableProps {
  patients: PatientListItem[];
}

export function PatientTable({ patients }: PatientTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Registration Date</TableHead>
            <TableHead>Reports</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.PatientID}>
              <TableCell className="font-medium">{patient.PatientName}</TableCell>
              <TableCell>{patient.Age ?? '-'}</TableCell>
              <TableCell>{patient.Gender ?? '-'}</TableCell>
              <TableCell>{patient.ContactNo ?? '-'}</TableCell>
              <TableCell>
                {patient.RegistrationDate ? formatDate(patient.RegistrationDate) : '-'}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1">
                  {patient.report_count || 0}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/patients/${patient.PatientID}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
