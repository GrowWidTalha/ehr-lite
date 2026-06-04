// Past Records tab component - Display and edit previous treatments
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Loader2, FileText } from 'lucide-react';
import { usePastRecords, useUpdatePastRecords } from '@/hooks/use-past-records';
import { toast } from 'sonner';

interface PastRecordsTabProps {
  patientId: string;
}

export function PastRecordsTab({ patientId }: PastRecordsTabProps) {
  const { data: pastRecords, isLoading } = usePastRecords(patientId);
  const updatePastRecords = useUpdatePastRecords();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    PreviousChemo: '',
    PreviousRT: '',
    PreviousTargeted: '',
    PreviousHT: '',
    PreviousIT: '',
  });

  // Update form data when past records loads
  useEffect(() => {
    if (pastRecords && typeof pastRecords === 'object' && 'PreviousChemo' in pastRecords) {
      const records = pastRecords as any;
      setFormData({
        PreviousChemo: records.PreviousChemo || '',
        PreviousRT: records.PreviousRT || '',
        PreviousTargeted: records.PreviousTargeted || '',
        PreviousHT: records.PreviousHT || '',
        PreviousIT: records.PreviousIT || '',
      });
    }
  }, [pastRecords]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updatePastRecords.mutateAsync({
        patientId: parseInt(patientId),
        data: formData,
      });

      toast.success('Past records updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update past records:', error);
      toast.error('Failed to update past records. Please try again.');
    }
  };

  const handleCancel = () => {
    // Reset form to original data
    if (pastRecords && typeof pastRecords === 'object' && 'PreviousChemo' in pastRecords) {
      const records = pastRecords as any;
      setFormData({
        PreviousChemo: records.PreviousChemo || '',
        PreviousRT: records.PreviousRT || '',
        PreviousTargeted: records.PreviousTargeted || '',
        PreviousHT: records.PreviousHT || '',
        PreviousIT: records.PreviousIT || '',
      });
    }
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Past Records</CardTitle>
            <CardDescription>Previous treatments and therapies the patient has received</CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Records
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="PreviousChemo">Previous Chemotherapy</Label>
              <Textarea
                id="PreviousChemo"
                value={formData.PreviousChemo}
                onChange={(e) => setFormData({ ...formData, PreviousChemo: e.target.value })}
                placeholder="Drug names, cycles, dates, outcomes..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Details of any previous chemotherapy treatments</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="PreviousRT">Previous Radiation Therapy (RT)</Label>
              <Textarea
                id="PreviousRT"
                value={formData.PreviousRT}
                onChange={(e) => setFormData({ ...formData, PreviousRT: e.target.value })}
                placeholder="Site, dose, fractions, dates, outcomes..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Details of any previous radiation treatments</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="PreviousTargeted">Previous Targeted / TKI Therapy</Label>
              <Textarea
                id="PreviousTargeted"
                value={formData.PreviousTargeted}
                onChange={(e) => setFormData({ ...formData, PreviousTargeted: e.target.value })}
                placeholder="Drug names, duration, response, side effects..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Tyrosine kinase inhibitors or other targeted therapies</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="PreviousHT">Previous Hormone Therapy (HT)</Label>
              <Textarea
                id="PreviousHT"
                value={formData.PreviousHT}
                onChange={(e) => setFormData({ ...formData, PreviousHT: e.target.value })}
                placeholder="Drug names, duration, response, side effects..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Hormonal treatments received previously</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="PreviousIT">Previous Immunotherapy (IT)</Label>
              <Textarea
                id="PreviousIT"
                value={formData.PreviousIT}
                onChange={(e) => setFormData({ ...formData, PreviousIT: e.target.value })}
                placeholder="Drug names, duration, response, side effects..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Immunotherapy treatments received previously</p>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={updatePastRecords.isPending}>
                {updatePastRecords.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Records
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={updatePastRecords.isPending}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Previous Chemotherapy
              </h4>
              <p className="text-sm text-muted-foreground">
                {(pastRecords as any)?.PreviousChemo || 'No chemotherapy records'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Previous Radiation Therapy
              </h4>
              <p className="text-sm text-muted-foreground">
                {(pastRecords as any)?.PreviousRT || 'No radiation therapy records'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Previous Targeted/TKI Therapy
              </h4>
              <p className="text-sm text-muted-foreground">
                {(pastRecords as any)?.PreviousTargeted || 'No targeted therapy records'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Previous Hormone Therapy
              </h4>
              <p className="text-sm text-muted-foreground">
                {(pastRecords as any)?.PreviousHT || 'No hormone therapy records'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Previous Immunotherapy
              </h4>
              <p className="text-sm text-muted-foreground">
                {(pastRecords as any)?.PreviousIT || 'No immunotherapy records'}
              </p>
            </div>

            {!(pastRecords as any)?.PreviousChemo && !(pastRecords as any)?.PreviousRT &&
             !(pastRecords as any)?.PreviousTargeted && !(pastRecords as any)?.PreviousHT &&
             !(pastRecords as any)?.PreviousIT && (
              <p className="text-sm text-muted-foreground italic">No past treatment records available</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
