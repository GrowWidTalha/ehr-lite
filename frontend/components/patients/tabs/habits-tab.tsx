// Habits tab component - User Story 3 & 9
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { usePatientHabits, useUpdateHabits } from '@/hooks/use-habits';
import { toast } from 'sonner';

interface HabitsTabProps {
  patientId: string;
}

const HABIT_STATUS = ['Never', 'Former', 'Current'];

export function HabitsTab({ patientId }: HabitsTabProps) {
  const { data: habits, isLoading } = usePatientHabits(patientId);
  const updateHabits = useUpdateHabits();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    smoking_status: 'Never',
    smoking_quantity: '',
    pan_use: 'Never',
    pan_quantity: '',
    gutka_use: 'Never',
    gutka_quantity: '',
    naswar_use: 'Never',
    naswar_quantity: '',
    alcohol_use: 'Never',
    alcohol_quantity: '',
    other_habits: '',
    quit_period: '',
  });

  // Update form data when habits load
  useEffect(() => {
    if (habits) {
      setFormData({
        smoking_status: habits.smoking_status || 'Never',
        smoking_quantity: habits.smoking_quantity || '',
        pan_use: habits.pan_use || 'Never',
        pan_quantity: habits.pan_quantity || '',
        gutka_use: habits.gutka_use || 'Never',
        gutka_quantity: habits.gutka_quantity || '',
        naswar_use: habits.naswar_use || 'Never',
        naswar_quantity: habits.naswar_quantity || '',
        alcohol_use: habits.alcohol_use || 'Never',
        alcohol_quantity: habits.alcohol_quantity || '',
        other_habits: habits.other_habits || '',
        quit_period: habits.quit_period || '',
      });
    }
  }, [habits]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateHabits.mutateAsync({
        patientId,
        data: formData as any,
      });

      toast.success('Lifestyle habits updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update habits:', error);
      toast.error('Failed to update habits. Please try again.');
    }
  };

  const handleCancel = () => {
    // Reset form to original data
    if (habits) {
      setFormData({
        smoking_status: habits.smoking_status || 'Never',
        smoking_quantity: habits.smoking_quantity || '',
        pan_use: habits.pan_use || 'Never',
        pan_quantity: habits.pan_quantity || '',
        gutka_use: habits.gutka_use || 'Never',
        gutka_quantity: habits.gutka_quantity || '',
        naswar_use: habits.naswar_use || 'Never',
        naswar_quantity: habits.naswar_quantity || '',
        alcohol_use: habits.alcohol_use || 'Never',
        alcohol_quantity: habits.alcohol_quantity || '',
        other_habits: habits.other_habits || '',
        quit_period: habits.quit_period || '',
      });
    }
    setIsEditing(false);
  };

  const formatHabitDisplay = (status: string, quantity?: string | null) => {
    if (!status || status === 'Never') return 'Never';
    const quant = quantity ? ` - ${quantity}` : '';
    return `${status}${quant}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lifestyle Habits</CardTitle>
            <CardDescription>Smoking, tobacco (pan, gutka, naswar), and alcohol use</CardDescription>
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
            {/* Smoking */}
            <div className="space-y-4">
              <h3 className="font-medium">Smoking</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smoking_status">Status</Label>
                  <Select
                    value={formData.smoking_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, smoking_status: value })
                    }
                  >
                    <SelectTrigger id="smoking_status">
                      <SelectValue />
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
                  <Label htmlFor="smoking_quantity">Quantity/Duration</Label>
                  <Input
                    id="smoking_quantity"
                    value={formData.smoking_quantity}
                    onChange={(e) => setFormData({ ...formData, smoking_quantity: e.target.value })}
                    placeholder="e.g., 10 cigarettes/day for 15 years"
                  />
                </div>
              </div>
            </div>

            {/* Pan */}
            <div className="space-y-4">
              <h3 className="font-medium">Pan (Betel Leaf)</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pan_status">Status</Label>
                  <Select
                    value={formData.pan_use}
                    onValueChange={(value) =>
                      setFormData({ ...formData, pan_use: value })
                    }
                  >
                    <SelectTrigger id="pan_status">
                      <SelectValue />
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
                  <Label htmlFor="pan_quantity">Quantity/Duration</Label>
                  <Input
                    id="pan_quantity"
                    value={formData.pan_quantity}
                    onChange={(e) => setFormData({ ...formData, pan_quantity: e.target.value })}
                    placeholder="e.g., 5-6 per day for 10 years"
                  />
                </div>
              </div>
            </div>

            {/* Gutka */}
            <div className="space-y-4">
              <h3 className="font-medium">Gutka (Chewable Tobacco)</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gutka_status">Status</Label>
                  <Select
                    value={formData.gutka_use}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gutka_use: value })
                    }
                  >
                    <SelectTrigger id="gutka_status">
                      <SelectValue />
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
                  <Label htmlFor="gutka_quantity">Quantity/Duration</Label>
                  <Input
                    id="gutka_quantity"
                    value={formData.gutka_quantity}
                    onChange={(e) => setFormData({ ...formData, gutka_quantity: e.target.value })}
                    placeholder="e.g., 3-4 packets per day for 8 years"
                  />
                </div>
              </div>
            </div>

            {/* Naswar */}
            <div className="space-y-4">
              <h3 className="font-medium">Naswar (Snuff)</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="naswar_status">Status</Label>
                  <Select
                    value={formData.naswar_use}
                    onValueChange={(value) =>
                      setFormData({ ...formData, naswar_use: value })
                    }
                  >
                    <SelectTrigger id="naswar_status">
                      <SelectValue />
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
                  <Label htmlFor="naswar_quantity">Quantity/Duration</Label>
                  <Input
                    id="naswar_quantity"
                    value={formData.naswar_quantity}
                    onChange={(e) => setFormData({ ...formData, naswar_quantity: e.target.value })}
                    placeholder="e.g., 2-3 times per day for 5 years"
                  />
                </div>
              </div>
            </div>

            {/* Alcohol */}
            <div className="space-y-4">
              <h3 className="font-medium">Alcohol</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="alcohol_status">Status</Label>
                  <Select
                    value={formData.alcohol_use}
                    onValueChange={(value) =>
                      setFormData({ ...formData, alcohol_use: value })
                    }
                  >
                    <SelectTrigger id="alcohol_status">
                      <SelectValue />
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
                  <Label htmlFor="alcohol_quantity">Quantity/Duration</Label>
                  <Input
                    id="alcohol_quantity"
                    value={formData.alcohol_quantity}
                    onChange={(e) => setFormData({ ...formData, alcohol_quantity: e.target.value })}
                    placeholder="e.g., 2 drinks per week"
                  />
                </div>
              </div>
            </div>

            {/* Other Habits & Quit Period */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="other_habits">Other Habits</Label>
                <Input
                  id="other_habits"
                  value={formData.other_habits}
                  onChange={(e) => setFormData({ ...formData, other_habits: e.target.value })}
                  placeholder="e.g., Vaping, betel nut, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quit_period">Quit Period (if applicable)</Label>
                <Input
                  id="quit_period"
                  value={formData.quit_period}
                  onChange={(e) => setFormData({ ...formData, quit_period: e.target.value })}
                  placeholder="e.g., 2 years ago, 6 months ago"
                />
              </div>
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
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium mb-1">Smoking</h4>
                <p className="text-sm text-muted-foreground">
                  {formatHabitDisplay(habits?.smoking_status || 'Never', habits?.smoking_quantity)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Pan (Betel Leaf)</h4>
                <p className="text-sm text-muted-foreground">
                  {formatHabitDisplay(habits?.pan_use || 'Never', habits?.pan_quantity)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Gutka (Chewable Tobacco)</h4>
                <p className="text-sm text-muted-foreground">
                  {formatHabitDisplay(habits?.gutka_use || 'Never', habits?.gutka_quantity)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Naswar (Snuff)</h4>
                <p className="text-sm text-muted-foreground">
                  {formatHabitDisplay(habits?.naswar_use || 'Never', habits?.naswar_quantity)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Alcohol</h4>
                <p className="text-sm text-muted-foreground">
                  {formatHabitDisplay(habits?.alcohol_use || 'Never', habits?.alcohol_quantity)}
                </p>
              </div>
            </div>
            {(habits?.other_habits || habits?.quit_period) && (
              <div className="grid gap-4 md:grid-cols-2 pt-2 border-t">
                {habits?.other_habits && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Other Habits</h4>
                    <p className="text-sm text-muted-foreground">{habits.other_habits}</p>
                  </div>
                )}
                {habits?.quit_period && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Quit Period</h4>
                    <p className="text-sm text-muted-foreground">{habits.quit_period}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
