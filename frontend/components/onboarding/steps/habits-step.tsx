'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const HABIT_STATUS = ['Never', 'Former', 'Current'];

interface HabitsStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

export function HabitsStep({ formData, onChange, error }: HabitsStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Record the patient&apos;s habits and substance use. All fields are optional.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Smoking */}
        <div className="space-y-2">
          <Label htmlFor="smoking_status">Smoking Status</Label>
          <Select
            value={formData.smoking_status}
            onValueChange={(value) => onChange({ ...formData, smoking_status: value })}
          >
            <SelectTrigger id="smoking_status">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {HABIT_STATUS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="smoking_quantity">Quantity/Day</Label>
          <Input
            id="smoking_quantity"
            value={formData.smoking_quantity}
            onChange={(e) => onChange({ ...formData, smoking_quantity: e.target.value })}
            placeholder="e.g., 10 cigarettes"
          />
        </div>

        {/* Pan */}
        <div className="space-y-2">
          <Label htmlFor="pan_use">Pan Use</Label>
          <Select
            value={formData.pan_use}
            onValueChange={(value) => onChange({ ...formData, pan_use: value })}
          >
            <SelectTrigger id="pan_use">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {HABIT_STATUS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pan_quantity">Pan Quantity/Day</Label>
          <Input
            id="pan_quantity"
            value={formData.pan_quantity}
            onChange={(e) => onChange({ ...formData, pan_quantity: e.target.value })}
            placeholder="e.g., 2-3 pans"
          />
        </div>

        {/* Gutka */}
        <div className="space-y-2">
          <Label htmlFor="gutka_use">Gutka Use</Label>
          <Select
            value={formData.gutka_use}
            onValueChange={(value) => onChange({ ...formData, gutka_use: value })}
          >
            <SelectTrigger id="gutka_use">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {HABIT_STATUS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gutka_quantity">Gutka Quantity/Day</Label>
          <Input
            id="gutka_quantity"
            value={formData.gutka_quantity}
            onChange={(e) => onChange({ ...formData, gutka_quantity: e.target.value })}
            placeholder="e.g., 1-2 packets"
          />
        </div>

        {/* Naswar */}
        <div className="space-y-2">
          <Label htmlFor="naswar_use">Naswar Use</Label>
          <Select
            value={formData.naswar_use}
            onValueChange={(value) => onChange({ ...formData, naswar_use: value })}
          >
            <SelectTrigger id="naswar_use">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {HABIT_STATUS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="naswar_quantity">Naswar Quantity/Day</Label>
          <Input
            id="naswar_quantity"
            value={formData.naswar_quantity}
            onChange={(e) => onChange({ ...formData, naswar_quantity: e.target.value })}
            placeholder="e.g., 2-3 times"
          />
        </div>

        {/* Alcohol */}
        <div className="space-y-2">
          <Label htmlFor="alcohol_use">Alcohol Use</Label>
          <Select
            value={formData.alcohol_use}
            onValueChange={(value) => onChange({ ...formData, alcohol_use: value })}
          >
            <SelectTrigger id="alcohol_use">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {HABIT_STATUS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="alcohol_quantity">Alcohol Quantity</Label>
          <Input
            id="alcohol_quantity"
            value={formData.alcohol_quantity}
            onChange={(e) => onChange({ ...formData, alcohol_quantity: e.target.value })}
            placeholder="e.g., 2-3 drinks/week"
          />
        </div>
      </div>

      {/* Other Habits */}
      <div className="space-y-2">
        <Label htmlFor="other_habits">Other Habits</Label>
        <Textarea
          id="other_habits"
          value={formData.other_habits}
          onChange={(e) => onChange({ ...formData, other_habits: e.target.value })}
          placeholder="Any other habits not listed above..."
          className="min-h-[60px]"
        />
      </div>

      {/* Quit Period */}
      <div className="space-y-2">
        <Label htmlFor="quit_period">Quit Period (if former user)</Label>
        <Input
          id="quit_period"
          value={formData.quit_period}
          onChange={(e) => onChange({ ...formData, quit_period: e.target.value })}
          placeholder="e.g., 2 years ago"
        />
      </div>
    </div>
  );
}
