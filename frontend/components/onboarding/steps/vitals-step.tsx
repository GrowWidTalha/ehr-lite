'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface VitalsStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

export function VitalsStep({ formData, onChange, error }: VitalsStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Record the patient&apos;s vital measurements. All fields are optional.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Height */}
        <div className="space-y-2">
          <Label htmlFor="height_cm">Height (cm)</Label>
          <Input
            id="height_cm"
            type="number"
            step="0.1"
            value={formData.height_cm}
            onChange={(e) => onChange({ ...formData, height_cm: e.target.value })}
            placeholder="e.g., 165"
          />
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <Label htmlFor="weight_kg">Weight (kg)</Label>
          <Input
            id="weight_kg"
            type="number"
            step="0.1"
            value={formData.weight_kg}
            onChange={(e) => onChange({ ...formData, weight_kg: e.target.value })}
            placeholder="e.g., 65"
          />
        </div>

        {/* Blood Pressure Systolic */}
        <div className="space-y-2">
          <Label htmlFor="blood_pressure_systolic">Blood Pressure (Systolic)</Label>
          <Input
            id="blood_pressure_systolic"
            type="number"
            value={formData.blood_pressure_systolic}
            onChange={(e) => onChange({ ...formData, blood_pressure_systolic: e.target.value })}
            placeholder="e.g., 120"
          />
        </div>

        {/* Blood Pressure Diastolic */}
        <div className="space-y-2">
          <Label htmlFor="blood_pressure_diastolic">Blood Pressure (Diastolic)</Label>
          <Input
            id="blood_pressure_diastolic"
            type="number"
            value={formData.blood_pressure_diastolic}
            onChange={(e) => onChange({ ...formData, blood_pressure_diastolic: e.target.value })}
            placeholder="e.g., 80"
          />
        </div>

        {/* Blood Group */}
        <div className="space-y-2">
          <Label htmlFor="blood_group">Blood Group</Label>
          <Select
            value={formData.blood_group}
            onValueChange={(value) => onChange({ ...formData, blood_group: value })}
          >
            <SelectTrigger id="blood_group">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_GROUPS.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* BMI Display (calculated) */}
      {formData.height_cm && formData.weight_kg && (
        <div className="p-3 bg-muted rounded-md">
          <span className="text-sm text-muted-foreground">
            Calculated BMI:{' '}
            <span className="font-medium">
              {(parseFloat(formData.weight_kg) / Math.pow(parseFloat(formData.height_cm) / 100, 2)).toFixed(1)}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
