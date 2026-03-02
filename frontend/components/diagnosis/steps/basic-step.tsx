'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CANCER_STAGES, CANCER_GRADES, CANCER_TYPES } from '@/lib/utils';
import { AlertCircle, Calendar } from 'lucide-react';

interface BasicStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

export function BasicStep({ formData, onChange, error }: BasicStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Basic Diagnosis Information</h3>
        <p className="text-sm text-muted-foreground">
          Enter the primary cancer diagnosis details
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <AlertCircle className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">Primary Diagnosis</h4>
        </div>

        {/* Required: Cancer Type */}
        <div className="space-y-2">
          <Label htmlFor="cancer_type" className="text-sm font-medium">
            Cancer Type <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.cancer_type}
            onValueChange={(value) => onChange({ ...formData, cancer_type: value })}
            required
          >
            <SelectTrigger
              id="cancer_type"
              className={error && !formData.cancer_type ? 'border-destructive focus-visible:ring-destructive' : ''}
            >
              <SelectValue placeholder="Select cancer type" />
            </SelectTrigger>
            <SelectContent>
              {CANCER_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && !formData.cancer_type && (
            <p className="text-xs text-destructive">Please select a cancer type</p>
          )}
          <p className="text-xs text-muted-foreground">
            Select the primary type and location of the cancer
          </p>
        </div>

        {/* WHO Classification */}
        <div className="space-y-2">
          <Label htmlFor="who_classification" className="text-sm font-medium">WHO Classification</Label>
          <Input
            id="who_classification"
            value={formData.who_classification}
            onChange={(e) => onChange({ ...formData, who_classification: e.target.value })}
            placeholder="e.g., Infiltrating ductal carcinoma"
          />
          <p className="text-xs text-muted-foreground">
            Histological classification per WHO guidelines
          </p>
        </div>
      </div>

      {/* Staging Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Calendar className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">Staging & Timing</h4>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Stage */}
          <div className="space-y-2">
            <Label htmlFor="stage" className="text-sm font-medium">Cancer Stage</Label>
            <Select
              value={formData.stage}
              onValueChange={(value) => onChange({ ...formData, stage: value })}
            >
              <SelectTrigger id="stage">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {CANCER_STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    Stage {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">TNM staging (I-IV)</p>
          </div>

          {/* Grade */}
          <div className="space-y-2">
            <Label htmlFor="grade" className="text-sm font-medium">Tumor Grade</Label>
            <Select
              value={formData.grade}
              onValueChange={(value) => onChange({ ...formData, grade: value })}
            >
              <SelectTrigger id="grade">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {CANCER_GRADES.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    Grade {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Histological grade (1-3)</p>
          </div>

          {/* Diagnosis Date */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="diagnosis_date" className="text-sm font-medium">Diagnosis Date</Label>
            <Input
              id="diagnosis_date"
              type="date"
              value={formData.diagnosis_date}
              onChange={(e) => onChange({ ...formData, diagnosis_date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-muted-foreground">Date of initial confirmed diagnosis</p>
          </div>
        </div>
      </div>

      {/* Stage Information Card */}
      {formData.stage && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">
            Stage {formData.stage}
          </p>
          <p className="text-xs text-muted-foreground">
            {formData.stage === '0' && 'Abnormal cells are present but have not spread (in situ)'}
            {formData.stage === 'I' && 'Cancer is limited to the primary site (localized)'}
            {formData.stage === 'II' && 'Cancer has spread locally but not to lymph nodes'}
            {formData.stage === 'III' && 'Cancer has spread to nearby lymph nodes'}
            {formData.stage === 'IV' && 'Cancer has metastasized to distant organs'}
          </p>
        </div>
      )}
    </div>
  );
}
