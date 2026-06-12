'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { STUDY_TYPES } from '@/lib/utils';
import { DiagnosisReportUpload } from '@/components/reports/diagnosis-report-upload';

interface ImagingStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
  patientId?: string;
}

export function ImagingStep({ formData, onChange, error, patientId }: ImagingStepProps) {
  const [uploadedReports, setUploadedReports] = useState<any[]>([]);

  const handleUploadComplete = (reportData: any) => {
    setUploadedReports([...uploadedReports, reportData]);
    onChange({
      ...formData,
      uploadedReports: [...(formData.uploadedReports || []), reportData]
    });
  };
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Imaging Studies (Optional)</h3>
      <p className="text-sm text-muted-foreground">
        CT, MRI, PET, Ultrasound, Mammogram
      </p>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="study_type">Study Type</Label>
        <Select
          value={formData.study_type}
          onValueChange={(value) => onChange({ ...formData, study_type: value })}
        >
          <SelectTrigger id="study_type">
            <SelectValue placeholder="Select type..." />
          </SelectTrigger>
          <SelectContent>
            {STUDY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="study_date">Study Date</Label>
        <Input
          id="study_date"
          type="date"
          value={formData.study_date}
          onChange={(e) => onChange({ ...formData, study_date: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="findings">Findings</Label>
        <Textarea
          id="findings"
          value={formData.findings}
          onChange={(e) => onChange({ ...formData, findings: e.target.value })}
          placeholder="Enter imaging findings..."
          className="min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="indication">Indication</Label>
        <Textarea
          id="indication"
          value={formData.indication}
          onChange={(e) => onChange({ ...formData, indication: e.target.value })}
          placeholder="Reason for imaging..."
          className="min-h-[60px]"
        />
      </div>

      {/* Uploaded Reports Summary */}
      {uploadedReports.length > 0 && (
        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm font-medium text-green-900 dark:text-green-100">
            {uploadedReports.length} Imaging Report{uploadedReports.length > 1 ? 's' : ''} Attached
          </p>
          <div className="mt-2 space-y-1">
            {uploadedReports.map((report, idx) => (
              <div key={idx} className="text-xs text-green-700 dark:text-green-300">
                ✓ {report.reportType} {report.notes ? `- ${report.notes}` : ''}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Imaging Report Upload */}
      {patientId && (
        <div className="pt-4 border-t">
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-1">Attach Imaging Reports</h4>
            <p className="text-xs text-muted-foreground">
              Upload CT, MRI, PET, ultrasound, or other imaging studies
            </p>
          </div>
          <DiagnosisReportUpload
            patientId={parseInt(patientId)}
            onUploadComplete={handleUploadComplete}
            title='Attach Imaging Report'
            description='Upload or capture CT, MRI, PET, ultrasound, or other imaging studies'
            defaultReportType='IMG_CT'
            compact={true}
          />
        </div>
      )}
    </div>
  );
}
