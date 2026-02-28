'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { YES_NO_OPTIONS } from '@/lib/utils';

interface TreatmentStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

export function TreatmentStep({ formData, onChange, error }: TreatmentStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Treatment Plan (Optional)</h3>
      <p className="text-sm text-muted-foreground">
        Planned surgery, chemotherapy, radiotherapy
      </p>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="plan_type">Plan Type</Label>
        <Select
          value={formData.plan_type}
          onValueChange={(value) => onChange({ ...formData, plan_type: value })}
        >
          <SelectTrigger id="plan_type">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="curative">Curative</SelectItem>
            <SelectItem value="palliative">Palliative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="surgery_planned">Surgery Planned</Label>
        <Select
          value={formData.surgery_planned}
          onValueChange={(value) => onChange({ ...formData, surgery_planned: value })}
        >
          <SelectTrigger id="surgery_planned">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {YES_NO_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option === 'yes' ? 'Yes' : 'No'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="neoadjuvant_chemo">Neoadjuvant Chemotherapy</Label>
        <Select
          value={formData.neoadjuvant_chemo}
          onValueChange={(value) => onChange({ ...formData, neoadjuvant_chemo: value })}
        >
          <SelectTrigger id="neoadjuvant_chemo">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {YES_NO_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option === 'yes' ? 'Yes' : 'No'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
