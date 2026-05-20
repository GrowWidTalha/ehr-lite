'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useLookups } from '@/hooks/use-lookups';

const FREQUENCY_OPTIONS = [
  'per day',
  'per week',
  'per month',
  'occasionally',
  'socially'
];

interface Habit {
  addiction_id: number;
  name: string;
  has_habit: boolean;
  quantity: string;
  frequency: string;
  quit: boolean;
  quit_period: string;
}

interface HabitsStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

export function HabitsStep({ formData, onChange, error }: HabitsStepProps) {
  const { data: lookups } = useLookups();
  const [habits, setHabits] = useState<Habit[]>([]);

  // Initialize habits from addictions lookup
  useEffect(() => {
    if (lookups?.addictions && habits.length === 0) {
      const initialHabits: Habit[] = lookups.addictions.map((addiction: any) => ({
        addiction_id: addiction.ID,
        name: addiction.Addiction,
        has_habit: false,
        quantity: '',
        frequency: 'per day',
        quit: false,
        quit_period: '',
      }));
      setHabits(initialHabits);
    }
  }, [lookups]);

  // Load existing habits if editing
  useEffect(() => {
    if (formData.habits && formData.habits.length > 0 && habits.length > 0) {
      setHabits(formData.habits);
    }
  }, [formData.habits]);

  const updateHabit = (index: number, updates: Partial<Habit>) => {
    const newHabits = [...habits];
    newHabits[index] = { ...newHabits[index], ...updates };
    setHabits(newHabits);
    onChange({ ...formData, habits: newHabits });
  };

  const toggleHabit = (index: number) => {
    const newHabits = [...habits];
    newHabits[index] = {
      ...newHabits[index],
      has_habit: !newHabits[index].has_habit,
      // Reset fields when turning off
      ...(!newHabits[index].has_habit ? {} : {
        quantity: '',
        frequency: 'per day',
        quit: false,
        quit_period: '',
      })
    };
    setHabits(newHabits);
    onChange({ ...formData, habits: newHabits });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Select which habits/addictions apply to this patient. For each selected habit, provide details about quantity, frequency, and quit status.
      </p>

      <div className="space-y-4">
        {habits.map((habit, index) => (
          <div key={habit.addiction_id} className="border rounded-lg p-4 space-y-4">
            {/* Habit Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  checked={habit.has_habit}
                  onCheckedChange={() => toggleHabit(index)}
                />
                <Label className="font-medium">{habit.name}</Label>
              </div>
            </div>

            {/* Habit Details - only shown when toggled on */}
            {habit.has_habit && (
              <div className="grid gap-4 md:grid-cols-2 pt-2">
                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor={`quantity-${habit.addiction_id}`}>Quantity</Label>
                  <Input
                    id={`quantity-${habit.addiction_id}`}
                    value={habit.quantity}
                    onChange={(e) => updateHabit(index, { quantity: e.target.value })}
                    placeholder="e.g., 1 pack, 2 cigarettes"
                  />
                </div>

                {/* Frequency */}
                <div className="space-y-2">
                  <Label htmlFor={`frequency-${habit.addiction_id}`}>Frequency</Label>
                  <select
                    id={`frequency-${habit.addiction_id}`}
                    value={habit.frequency}
                    onChange={(e) => updateHabit(index, { frequency: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  >
                    {FREQUENCY_OPTIONS.map((freq) => (
                      <option key={freq} value={freq}>
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quit Status - full width */}
                <div className="md:col-span-2 flex items-center gap-3 pt-2">
                  <Checkbox
                    id={`quit-${habit.addiction_id}`}
                    checked={habit.quit}
                    onCheckedChange={(checked) => updateHabit(index, { quit: !!checked, quit_period: !!checked ? habit.quit_period : '' })}
                  />
                  <Label htmlFor={`quit-${habit.addiction_id}`} className="cursor-pointer">
                    Has quit this habit
                  </Label>
                </div>

                {/* Quit Period - shown only when quit is checked */}
                {habit.quit && (
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor={`quit_period-${habit.addiction_id}`}>Quit Period</Label>
                    <Input
                      id={`quit_period-${habit.addiction_id}`}
                      value={habit.quit_period}
                      onChange={(e) => updateHabit(index, { quit_period: e.target.value })}
                      placeholder="e.g., 2 years ago, 6 months ago"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
