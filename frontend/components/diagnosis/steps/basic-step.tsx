'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CANCER_STAGES, CANCER_GRADES, CANCER_TYPES } from '@/lib/utils';

interface BasicStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

export function BasicStep({ formData, onChange, error }: BasicStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Basic Diagnosis Information</h3>
      <p className="text-sm text-muted-foreground">
        Cancer type, stage, and grade information
      </p>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Required: Cancer Type */}
      <div className="space-y-2">
        <Label htmlFor="cancer_type">
          Cancer Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.cancer_type}
          onValueChange={(value) => onChange({ ...formData, cancer_type: value })}
          required
        >
          <SelectTrigger id="cancer_type">
            <SelectValue placeholder="Select cancer type..." />
          </SelectTrigger>
          <SelectContent>
            {CANCER_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Optional: Stage */}
        <div className="space-y-2">
          <Label htmlFor="stage">Stage (Optional)</Label>
          <Select
            value={formData.stage}
            onValueChange={(value) => onChange({ ...formData, stage: value })}
          >
            <SelectTrigger id="stage">
              <SelectValue placeholder="Select stage..." />
            </SelectTrigger>
            <SelectContent>
              {CANCER_STAGES.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  Stage {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Optional: Grade */}
        <div className="space-y-2">
          <Label htmlFor="grade">Grade (Optional)</Label>
          <Select
            value={formData.grade}
            onValueChange={(value) => onChange({ ...formData, grade: value })}
          >
            <SelectTrigger id="grade">
              <SelectValue placeholder="Select grade..." />
            </SelectTrigger>
            <SelectContent>
              {CANCER_GRADES.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  Grade {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Optional: WHO Classification */}
        <div className="space-y-2">
          <Label htmlFor="who_classification">WHO Classification (Optional)</Label>
          <Input
            id="who_classification"
            type="text"
            value={formData.who_classification}
            onChange={(e) => onChange({ ...formData, who_classification: e.target.value })}
            placeholder="e.g., Infiltrating ductal carcinoma"
          />
        </div>

        {/* Optional: Diagnosis Date */}
        <div className="space-y-2">
          <Label htmlFor="diagnosis_date">Diagnosis Date (Optional)</Label>
          <Input
            id="diagnosis_date"
            type="date"
            value={formData.diagnosis_date}
            onChange={(e) => onChange({ ...formData, diagnosis_date: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
