// Report upload page - User Story 4
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { ReportUploadForm } from '@/components/reports/report-upload-form';

export default function NewReportPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = parseInt(params.id as string);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <Link href={`/patients/${params.id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patient
        </Link>

        <Card>
          <ReportUploadForm
            patientId={patientId}
            onSuccess={() => router.push(`/patients/${params.id}`)}
            onCancel={() => router.back()}
          />
        </Card>
      </div>
    </div>
  );
}
