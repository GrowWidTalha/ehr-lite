'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { STUDY_TYPES } from '@/lib/utils';

interface ImagingStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

export function ImagingStep({ formData, onChange, error }: ImagingStepProps) {
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
    </div>
  );
}
