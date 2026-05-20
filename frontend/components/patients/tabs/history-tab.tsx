// History tab component - User Story 3 & 8
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { usePatientHistory, useUpdateHistory } from '@/hooks/use-history';
import { toast } from 'sonner';

interface HistoryTabProps {
  patientId: string;
}

export function HistoryTab({ patientId }: HistoryTabProps) {
  const { data: history, isLoading } = usePatientHistory(parseInt(patientId));
  const updateHistory = useUpdateHistory();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    PresentingComplaint: '',
    Comorbidities: '',
    FamilyCancerHistory: '',
  });

  // Update form data when history loads
  useEffect(() => {
    if (history) {
      setFormData({
        PresentingComplaint: history.PresentingComplaint || '',
        Comorbidities: history.Comorbidities || '',
        FamilyCancerHistory: history.FamilyCancerHistory || '',
      });
    }
  }, [history]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateHistory.mutateAsync({
        patientId: parseInt(patientId),
        data: formData,
      });

      toast.success('Medical history updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update history:', error);
      toast.error('Failed to update history. Please try again.');
    }
  };

  const handleCancel = () => {
    // Reset form to original data
    if (history) {
      setFormData({
        PresentingComplaint: history.PresentingComplaint || '',
        Comorbidities: history.Comorbidities || '',
        FamilyCancerHistory: history.FamilyCancerHistory || '',
      });
    }
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Medical History</CardTitle>
            <CardDescription>Patient's medical background and family history</CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit History
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="PresentingComplaint">Presenting Complaint</Label>
              <Textarea
                id="PresentingComplaint"
                value={formData.PresentingComplaint}
                onChange={(e) => setFormData({ ...formData, PresentingComplaint: e.target.value })}
                placeholder="Enter the patient's presenting complaint..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="Comorbidities">Comorbidities</Label>
              <Textarea
                id="Comorbidities"
                value={formData.Comorbidities}
                onChange={(e) => setFormData({ ...formData, Comorbidities: e.target.value })}
                placeholder="Enter any Comorbidities..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="family_history">Family Cancer History</Label>
              <Textarea
                id="family_history"
                value={formData.FamilyCancerHistory}
                onChange={(e) => setFormData({ ...formData, FamilyCancerHistory: e.target.value })}
                placeholder="Enter any family history of cancer..."
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={updateHistory.isPending}>
                {updateHistory.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save History
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={updateHistory.isPending}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h4 className="text-sm font-medium mb-2">Presenting Complaint</h4>
              <p className="text-sm text-muted-foreground">
                {history?.PresentingComplaint || 'No presenting complaint recorded'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Comorbidities</h4>
              <p className="text-sm text-muted-foreground">
                {history?.Comorbidities || 'No Comorbidities recorded'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Family Cancer History</h4>
              <p className="text-sm text-muted-foreground">
                {history?.FamilyCancerHistory || 'No family history recorded'}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
