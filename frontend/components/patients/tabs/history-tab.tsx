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
  const { data: history, isLoading } = usePatientHistory(patientId);
  const updateHistory = useUpdateHistory();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    presenting_complaint: '',
    comorbidities: '',
    family_cancer_history: '',
  });

  // Update form data when history loads
  useEffect(() => {
    if (history) {
      setFormData({
        presenting_complaint: history.presenting_complaint || '',
        comorbidities: history.comorbidities || '',
        family_cancer_history: history.family_cancer_history || '',
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
        patientId,
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
        presenting_complaint: history.presenting_complaint || '',
        comorbidities: history.comorbidities || '',
        family_cancer_history: history.family_cancer_history || '',
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
              <Label htmlFor="presenting_complaint">Presenting Complaint</Label>
              <Textarea
                id="presenting_complaint"
                value={formData.presenting_complaint}
                onChange={(e) => setFormData({ ...formData, presenting_complaint: e.target.value })}
                placeholder="Enter the patient's presenting complaint..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comorbidities">Comorbidities</Label>
              <Textarea
                id="comorbidities"
                value={formData.comorbidities}
                onChange={(e) => setFormData({ ...formData, comorbidities: e.target.value })}
                placeholder="Enter any comorbidities..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="family_history">Family Cancer History</Label>
              <Textarea
                id="family_history"
                value={formData.family_cancer_history}
                onChange={(e) => setFormData({ ...formData, family_cancer_history: e.target.value })}
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
                {history?.presenting_complaint || 'No presenting complaint recorded'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Comorbidities</h4>
              <p className="text-sm text-muted-foreground">
                {history?.comorbidities || 'No comorbidities recorded'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Family Cancer History</h4>
              <p className="text-sm text-muted-foreground">
                {history?.family_cancer_history || 'No family history recorded'}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
