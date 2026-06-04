'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Droplets, Activity } from 'lucide-react';

interface VitalsStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

function getBPCategory(systolic: number, diastolic: number): { label: string; color: string } {
  if (systolic < 120 && diastolic < 80) return { label: 'Normal', color: 'text-green-600' };
  if (systolic < 130 && diastolic < 85) return { label: 'Elevated', color: 'text-yellow-600' };
  if (systolic < 140 || diastolic < 90) return { label: 'High Stage 1', color: 'text-orange-600' };
  return { label: 'High Stage 2', color: 'text-red-600' };
}

export function VitalsStep({ formData, onChange, error }: VitalsStepProps) {
  const systolic = parseFloat(formData.blood_pressure_systolic);
  const diastolic = parseFloat(formData.blood_pressure_diastolic);
  const bpCategory = systolic && diastolic ? getBPCategory(systolic, diastolic) : null;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Record the patient&apos;s blood pressure. These measurements are optional but recommended for comprehensive care.
        <br />
        <span className="text-muted-foreground/70">Note: Height, Weight, and Blood Group are now recorded in the Basic Info step.</span>
      </p>

      {/* Blood Pressure Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Droplets className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Blood Pressure</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Blood Pressure Systolic */}
          <div className="space-y-2">
            <Label htmlFor="blood_pressure_systolic" className="text-sm font-medium">Systolic (Upper)</Label>
            <Input
              id="blood_pressure_systolic"
              type="number"
              value={formData.blood_pressure_systolic}
              onChange={(e) => onChange({ ...formData, blood_pressure_systolic: e.target.value })}
              placeholder="e.g., 120"
              min="60"
              max="250"
            />
            <p className="text-xs text-muted-foreground">Normal: 90-120 mmHg</p>
          </div>

          {/* Blood Pressure Diastolic */}
          <div className="space-y-2">
            <Label htmlFor="blood_pressure_diastolic" className="text-sm font-medium">Diastolic (Lower)</Label>
            <Input
              id="blood_pressure_diastolic"
              type="number"
              value={formData.blood_pressure_diastolic}
              onChange={(e) => onChange({ ...formData, blood_pressure_diastolic: e.target.value })}
              placeholder="e.g., 80"
              min="40"
              max="150"
            />
            <p className="text-xs text-muted-foreground">Normal: 60-80 mmHg</p>
          </div>
        </div>

        {/* BP Category Display */}
        {bpCategory && (
          <div className="p-3 bg-muted rounded-md">
            <span className="text-sm text-muted-foreground">
              Blood Pressure Category:{' '}
              <span className={`font-semibold ${bpCategory.color}`}>{bpCategory.label}</span>
            </span>
            <span className="text-xs text-muted-foreground block mt-1">
              ({systolic}/{diastolic} mmHg)
            </span>
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <Activity className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100">Additional Measurements</p>
            <p className="text-blue-700 dark:text-blue-300 mt-1">
              Height, Weight, and Blood Group have been moved to the Basic Info step for better workflow efficiency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
