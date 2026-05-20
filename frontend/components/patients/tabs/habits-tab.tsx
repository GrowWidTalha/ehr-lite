// Habits tab component - Toggle-based UI
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Loader2 } from 'lucide-react';
import { usePatientHabits, useUpdateHabits } from '@/hooks/use-habits';
import { useLookups } from '@/hooks/use-lookups';
import { toast } from 'sonner';

interface HabitsTabProps {
  patientId: string;
}

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

export function HabitsTab({ patientId }: HabitsTabProps) {
  const { data: existingHabits, isLoading } = usePatientHabits(parseInt(patientId));
  const { data: lookups } = useLookups();
  const updateHabits = useUpdateHabits();
  const [isEditing, setIsEditing] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);

  // Initialize habits from addictions lookup
  useEffect(() => {
    if (lookups?.addictions && habits.length === 0) {
      const initialHabits: Habit[] = lookups.addictions.map((addiction: any) => {
        // Try to find existing habit data
        const existing = existingHabits?.find((h: any) => h.addiction_id === addiction.ID);
        return {
          addiction_id: addiction.ID,
          name: addiction.Addiction,
          has_habit: existing?.has_habit || false,
          quantity: existing?.quantity || '',
          frequency: existing?.frequency || 'per day',
          quit: existing?.quit || false,
          quit_period: existing?.quit_period || '',
        };
      });
      setHabits(initialHabits);
    }
  }, [lookups, existingHabits]);

  // Update habits when existing habits load
  useEffect(() => {
    if (existingHabits && existingHabits.length > 0 && habits.length > 0) {
      const updatedHabits = habits.map(habit => {
        const existing = existingHabits.find((h: any) => h.addiction_id === habit.addiction_id);
        return existing ? { ...habit, ...existing } : habit;
      });
      setHabits(updatedHabits);
    }
  }, [existingHabits]);

  if (isLoading || !lookups?.addictions) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const updateHabit = (index: number, updates: Partial<Habit>) => {
    const newHabits = [...habits];
    newHabits[index] = { ...newHabits[index], ...updates };
    setHabits(newHabits);
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
  };

  const handleSave = async () => {
    try {
      await updateHabits.mutateAsync({
        patientId: parseInt(patientId),
        data: { habits },
      });

      toast.success('Lifestyle habits updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update habits:', error);
      toast.error('Failed to update habits. Please try again.');
    }
  };

  const handleCancel = () => {
    // Reset to existing habits
    if (existingHabits) {
      const resetHabits = habits.map(habit => {
        const existing = existingHabits.find((h: any) => h.addiction_id === habit.addiction_id);
        return existing ? { ...habit, ...existing } : habit;
      });
      setHabits(resetHabits);
    }
    setIsEditing(false);
  };

  const activeHabits = habits.filter(h => h.has_habit);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lifestyle Habits</CardTitle>
            <CardDescription>Smoking, tobacco, alcohol, and other substance use</CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Habits
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <>
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

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={updateHabits.isPending}>
                {updateHabits.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Habits
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={updateHabits.isPending}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {activeHabits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No habits recorded for this patient.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {activeHabits.map((habit) => (
                  <div key={habit.addiction_id} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{habit.name}</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Quantity: {habit.quantity || 'Not specified'}</p>
                      <p>Frequency: {habit.frequency}</p>
                      {habit.quit ? (
                        <p>Quit: {habit.quit_period || 'Yes'}</p>
                      ) : (
                        <p className="text-amber-600">Current user</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
