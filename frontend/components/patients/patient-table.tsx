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
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-[var(--color-blue)]/5 hover:bg-[var(--color-blue)]/10">
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
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-green)]/10 text-[var(--color-green)] text-xs font-medium">
                  {patient.report_count || 0}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/patients/${patient.PatientID}`}>
                  <Button variant="ghost" size="sm" className="hover:bg-[var(--color-blue-light)] hover:text-[var(--color-blue)] transition-colors">
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
