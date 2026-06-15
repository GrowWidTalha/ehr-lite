// Biomarker Step - Integrated Report Upload
'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, FileText, Upload, ArrowRight, CheckCircle2 } from 'lucide-react';
import { DiagnosisReportUpload } from '@/components/reports/diagnosis-report-upload';
import Link from 'next/link';

interface BiomarkerStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
  patientId?: string;
}

export function BiomarkerStep({ formData, onChange, error, patientId }: BiomarkerStepProps) {
  const [uploadedReports, setUploadedReports] = useState<any[]>([]);

  const handleUploadComplete = (reportData: any) => {
    setUploadedReports([...uploadedReports, reportData]);
    // Update form data with report references
    onChange({
      ...formData,
      uploadedReports: [...(formData.uploadedReports || []), reportData]
    });
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='space-y-1'>
        <h3 className='text-lg font-semibold'>Biomarker & Pathology Reports</h3>
        <p className='text-sm text-muted-foreground'>
          Upload pathology reports directly to support this diagnosis
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className='flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm'>
          <Info className='h-4 w-4 mt-0.5 flex-shrink-0' />
          <span>{error}</span>
        </div>
      )}

      {/* Uploaded Reports Summary */}
      {uploadedReports.length > 0 && (
        <Card className='border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <CheckCircle2 className='h-5 w-5 text-green-600 dark:text-green-400' />
              <h4 className='font-medium text-green-900 dark:text-green-100'>
                {uploadedReports.length} Report{uploadedReports.length > 1 ? 's' : ''} Attached
              </h4>
            </div>
            <div className='space-y-1'>
              {uploadedReports.map((report, idx) => (
                <div key={idx} className='text-sm text-green-700 dark:text-green-300 flex items-center gap-2'>
                  <CheckCircle2 className='h-3 w-3' />
                  {report.reportType} - {report.notes || 'No notes'}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integrated Report Upload */}
      <div className='space-y-4'>
        <div className='p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800'>
          <p className='text-sm text-blue-900 dark:text-blue-100'>
            <strong>Attach Pathology & Biomarker Reports</strong><br/>
            <span className='text-xs'>Upload official reports containing ER, PR, HER2, Ki-67, and molecular testing results.</span>
          </p>
        </div>

        <DiagnosisReportUpload
          patientId={parseInt(patientId || '0')}
          onUploadComplete={handleUploadComplete}
          title='Attach Pathology/Biomarker Report'
          description='Capture or upload pathology reports, biomarker studies, and lab results'
          defaultReportType='IHC_MARKERS'
          compact={true}
          categoryFilter={['Pathology', 'Lab']}
        />
      </div>

      {/* Quick Reference - What Reports Provide */}
      <div className='space-y-3'>
        <h4 className='text-sm font-medium'>What These Reports Contain:</h4>
        <div className='grid gap-2 md:grid-cols-2 text-xs'>
          <div className='flex items-start gap-2 p-2 bg-muted rounded'>
            <span className='font-semibold'>ER/PR Status:</span>
            <span className='text-muted-foreground'>Hormone receptor testing from pathology</span>
          </div>
          <div className='flex items-start gap-2 p-2 bg-muted rounded'>
            <span className='font-semibold'>HER2 Testing:</span>
            <span className='text-muted-foreground'>IHC scores and FISH results</span>
          </div>
          <div className='flex items-start gap-2 p-2 bg-muted rounded'>
            <span className='font-semibold'>Ki-67 Index:</span>
            <span className='text-muted-foreground'>Proliferation marker percentage</span>
          </div>
          <div className='flex items-start gap-2 p-2 bg-muted rounded'>
            <span className='font-semibold'>Molecular:</span>
            <span className='text-muted-foreground'>EGFR, ALK, KRAS, MSI, PD-L1 status</span>
          </div>
          <div className='flex items-start gap-2 p-2 bg-muted rounded'>
            <span className='font-semibold'>Tumor Size:</span>
            <span className='text-muted-foreground'>Exact measurements from pathology</span>
          </div>
          <div className='flex items-start gap-2 p-2 bg-muted rounded'>
            <span className='font-semibold'>Margins:</span>
            <span className='text-muted-foreground'>Surgical margin status</span>
          </div>
        </div>
      </div>

      {/* Existing Reports Section */}
      {patientId && (
        <div className='flex items-center justify-between p-4 bg-muted rounded-lg'>
          <div>
            <p className='text-sm font-medium'>View All Patient Reports</p>
            <p className='text-xs text-muted-foreground'>
              See previously uploaded pathology, imaging, and lab reports
            </p>
          </div>
          <Link href={`/patients/${patientId}`}>
            <Button size='sm' variant='outline'>
              View Reports
              <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
