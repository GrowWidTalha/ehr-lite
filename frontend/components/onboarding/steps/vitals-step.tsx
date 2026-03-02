'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Weight, Ruler, Droplets } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface VitalsStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-yellow-600' };
  if (bmi < 25) return { label: 'Normal weight', color: 'text-green-600' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-600' };
  return { label: 'Obese', color: 'text-red-600' };
}

function getBPCategory(systolic: number, diastolic: number): { label: string; color: string } {
  if (systolic < 120 && diastolic < 80) return { label: 'Normal', color: 'text-green-600' };
  if (systolic < 130 && diastolic < 85) return { label: 'Elevated', color: 'text-yellow-600' };
  if (systolic < 140 || diastolic < 90) return { label: 'High Stage 1', color: 'text-orange-600' };
  return { label: 'High Stage 2', color: 'text-red-600' };
}

export function VitalsStep({ formData, onChange, error }: VitalsStepProps) {
  const height = parseFloat(formData.height_cm);
  const weight = parseFloat(formData.weight_kg);
  const systolic = parseFloat(formData.blood_pressure_systolic);
  const diastolic = parseFloat(formData.blood_pressure_diastolic);

  const bmi = height && weight ? weight / Math.pow(height / 100, 2) : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;
  const bpCategory = systolic && diastolic ? getBPCategory(systolic, diastolic) : null;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Record the patient&apos;s vital measurements. These are optional but recommended for comprehensive care.
      </p>

      {/* Body Measurements Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Body Measurements</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Height */}
          <div className="space-y-2">
            <Label htmlFor="height_cm" className="text-sm font-medium">Height</Label>
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <Input
                id="height_cm"
                type="number"
                step="0.1"
                value={formData.height_cm}
                onChange={(e) => onChange({ ...formData, height_cm: e.target.value })}
                placeholder="e.g., 165"
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">cm</span>
            </div>
            <p className="text-xs text-muted-foreground">Patient height in centimeters</p>
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weight_kg" className="text-sm font-medium">Weight</Label>
            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-muted-foreground" />
              <Input
                id="weight_kg"
                type="number"
                step="0.1"
                value={formData.weight_kg}
                onChange={(e) => onChange({ ...formData, weight_kg: e.target.value })}
                placeholder="e.g., 65"
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">kg</span>
            </div>
            <p className="text-xs text-muted-foreground">Patient weight in kilograms</p>
          </div>
        </div>

        {/* BMI Display */}
        {bmi && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Calculated BMI</p>
                <p className="text-2xl font-bold text-foreground">{bmi.toFixed(1)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Category</p>
                <p className={`text-lg font-semibold ${bmiCategory?.color}`}>{bmiCategory?.label}</p>
              </div>
            </div>
          </div>
        )}
      </div>

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

      {/* Blood Group Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Blood Type</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Blood Group */}
          <div className="space-y-2">
            <Label htmlFor="blood_group" className="text-sm font-medium">Blood Group</Label>
            <Select
              value={formData.blood_group}
              onValueChange={(value) => onChange({ ...formData, blood_group: value })}
            >
              <SelectTrigger id="blood_group">
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_GROUPS.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Important for transfusions and emergencies</p>
          </div>
        </div>
      </div>
    </div>
  );
}
