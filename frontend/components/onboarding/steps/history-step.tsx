'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface HistoryStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

export function HistoryStep({ formData, onChange, error }: HistoryStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Record the patient&apos;s medical history. All fields are optional and can be updated later.
      </p>

      {/* Presenting Complaint */}
      <div className="space-y-2">
        <Label htmlFor="presenting_complaint">Presenting Complaint</Label>
        <Textarea
          id="presenting_complaint"
          value={formData.presenting_complaint}
          onChange={(e) => onChange({ ...formData, presenting_complaint: e.target.value })}
          placeholder="Reason for visit / chief complaint..."
          className="min-h-[80px]"
        />
      </div>

      {/* Comorbidities */}
      <div className="space-y-2">
        <Label htmlFor="comorbidities">Comorbidities</Label>
        <Textarea
          id="comorbidities"
          value={formData.comorbidities}
          onChange={(e) => onChange({ ...formData, comorbidities: e.target.value })}
          placeholder="Existing conditions (diabetes, hypertension, etc.)..."
          className="min-h-[80px]"
        />
      </div>

      {/* Family Cancer History */}
      <div className="space-y-2">
        <Label htmlFor="family_cancer_history">Family Cancer History</Label>
        <Textarea
          id="family_cancer_history"
          value={formData.family_cancer_history}
          onChange={(e) => onChange({ ...formData, family_cancer_history: e.target.value })}
          placeholder="Any family history of cancer, relationship, type..."
          className="min-h-[80px]"
        />
      </div>
    </div>
  );
}
