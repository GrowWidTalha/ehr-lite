'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';

interface PastRecordsStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

export function PastRecordsStep({ formData, onChange, error }: PastRecordsStepProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Record the patient&apos;s previous medical treatments. All fields are optional and can be updated later.
      </p>

      {/* Previous Treatments Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Previous Treatments</h3>
        </div>

        <div className="space-y-4">
          {/* Previous Chemo */}
          <div className="space-y-2">
            <Label htmlFor="PreviousChemo" className="text-sm font-medium">Previous Chemotherapy</Label>
            <Textarea
              id="PreviousChemo"
              value={formData.PreviousChemo || ''}
              onChange={(e) => onChange({ ...formData, PreviousChemo: e.target.value })}
              placeholder="Drug names, cycles, dates, outcomes..."
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">Details of any previous chemotherapy treatments</p>
          </div>

          {/* Previous RT */}
          <div className="space-y-2">
            <Label htmlFor="PreviousRT" className="text-sm font-medium">Previous Radiation Therapy (RT)</Label>
            <Textarea
              id="PreviousRT"
              value={formData.PreviousRT || ''}
              onChange={(e) => onChange({ ...formData, PreviousRT: e.target.value })}
              placeholder="Site, dose, fractions, dates, outcomes..."
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">Details of any previous radiation treatments</p>
          </div>

          {/* Previous Targeted / TKI Therapy */}
          <div className="space-y-2">
            <Label htmlFor="PreviousTargeted" className="text-sm font-medium">Previous Targeted / TKI Therapy</Label>
            <Textarea
              id="PreviousTargeted"
              value={formData.PreviousTargeted || ''}
              onChange={(e) => onChange({ ...formData, PreviousTargeted: e.target.value })}
              placeholder="Drug names, duration, response, side effects..."
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">Tyrosine kinase inhibitors or other targeted therapies</p>
          </div>

          {/* Previous HT */}
          <div className="space-y-2">
            <Label htmlFor="PreviousHT" className="text-sm font-medium">Previous Hormone Therapy (HT)</Label>
            <Textarea
              id="PreviousHT"
              value={formData.PreviousHT || ''}
              onChange={(e) => onChange({ ...formData, PreviousHT: e.target.value })}
              placeholder="Drug names, duration, response, side effects..."
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">Hormonal treatments received previously</p>
          </div>

          {/* Previous IT */}
          <div className="space-y-2">
            <Label htmlFor="PreviousIT" className="text-sm font-medium">Previous Immunotherapy (IT)</Label>
            <Textarea
              id="PreviousIT"
              value={formData.PreviousIT || ''}
              onChange={(e) => onChange({ ...formData, PreviousIT: e.target.value })}
              placeholder="Drug names, duration, response, side effects..."
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">Immunotherapy treatments received previously</p>
          </div>
        </div>
      </div>
    </div>
  );
}
