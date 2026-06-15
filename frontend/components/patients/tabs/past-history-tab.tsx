// Past Records tab component - Only past treatment records
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Loader2, FileText } from 'lucide-react';
import { usePastRecords, useUpdatePastRecords } from '@/hooks/use-past-records';
import { toast } from 'sonner';

interface PastHistoryTabProps {
  patientId: string;
}

export function PastHistoryTab({ patientId }: PastHistoryTabProps) {
  const { data: pastRecords, isLoading } = usePastRecords(patientId);
  const updatePastRecords = useUpdatePastRecords();
  const [isEditingRecords, setIsEditingRecords] = useState(false);

  const [recordsFormData, setRecordsFormData] = useState({
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
      setRecordsFormData({
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

  const handleSaveRecords = async () => {
    try {
      await updatePastRecords.mutateAsync({
        patientId: parseInt(patientId),
        data: recordsFormData,
      });

      toast.success('Past records updated successfully');
      setIsEditingRecords(false);
    } catch (error) {
      console.error('Failed to update past records:', error);
      toast.error('Failed to update past records. Please try again.');
    }
  };

  const handleCancelRecords = () => {
    if (pastRecords && typeof pastRecords === 'object' && 'PreviousChemo' in pastRecords) {
      const records = pastRecords as any;
      setRecordsFormData({
        PreviousChemo: records.PreviousChemo || '',
        PreviousRT: records.PreviousRT || '',
        PreviousTargeted: records.PreviousTargeted || '',
        PreviousHT: records.PreviousHT || '',
        PreviousIT: records.PreviousIT || '',
      });
    }
    setIsEditingRecords(false);
  };

  return (
    <div className="space-y-6">
      {/* Past Records Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Past Treatment Records
              </CardTitle>
              <CardDescription>Previous treatments and therapies the patient has received</CardDescription>
            </div>
            {!isEditingRecords && (
              <Button variant="outline" onClick={() => setIsEditingRecords(true)}>
                Edit Records
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditingRecords ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="PreviousChemo">Previous Chemotherapy</Label>
                <Textarea
                  id="PreviousChemo"
                  value={recordsFormData.PreviousChemo}
                  onChange={(e) => setRecordsFormData({ ...recordsFormData, PreviousChemo: e.target.value })}
                  placeholder="Drug names, cycles, dates, outcomes..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="PreviousRT">Previous Radiation Therapy (RT)</Label>
                <Textarea
                  id="PreviousRT"
                  value={recordsFormData.PreviousRT}
                  onChange={(e) => setRecordsFormData({ ...recordsFormData, PreviousRT: e.target.value })}
                  placeholder="Site, dose, fractions, dates, outcomes..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="PreviousTargeted">Previous Targeted / TKI Therapy</Label>
                <Textarea
                  id="PreviousTargeted"
                  value={recordsFormData.PreviousTargeted}
                  onChange={(e) => setRecordsFormData({ ...recordsFormData, PreviousTargeted: e.target.value })}
                  placeholder="Drug names, duration, response, side effects..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="PreviousHT">Previous Hormone Therapy (HT)</Label>
                <Textarea
                  id="PreviousHT"
                  value={recordsFormData.PreviousHT}
                  onChange={(e) => setRecordsFormData({ ...recordsFormData, PreviousHT: e.target.value })}
                  placeholder="Drug names, duration, response, side effects..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="PreviousIT">Previous Immunotherapy (IT)</Label>
                <Textarea
                  id="PreviousIT"
                  value={recordsFormData.PreviousIT}
                  onChange={(e) => setRecordsFormData({ ...recordsFormData, PreviousIT: e.target.value })}
                  placeholder="Drug names, duration, response, side effects..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSaveRecords} disabled={updatePastRecords.isPending}>
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
                <Button variant="outline" onClick={handleCancelRecords} disabled={updatePastRecords.isPending}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Previous Chemotherapy</h4>
                <p className="text-sm text-muted-foreground">
                  {(pastRecords as any)?.PreviousChemo || 'No chemotherapy records'}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Previous Radiation Therapy</h4>
                <p className="text-sm text-muted-foreground">
                  {(pastRecords as any)?.PreviousRT || 'No radiation therapy records'}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Previous Targeted/TKI Therapy</h4>
                <p className="text-sm text-muted-foreground">
                  {(pastRecords as any)?.PreviousTargeted || 'No targeted therapy records'}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Previous Hormone Therapy</h4>
                <p className="text-sm text-muted-foreground">
                  {(pastRecords as any)?.PreviousHT || 'No hormone therapy records'}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Previous Immunotherapy</h4>
                <p className="text-sm text-muted-foreground">
                  {(pastRecords as any)?.PreviousIT || 'No immunotherapy records'}
                </p>
              </div>

              {!(pastRecords as any)?.PreviousChemo && !(pastRecords as any)?.PreviousRT &&
               !(pastRecords as any)?.PreviousTargeted && !(pastRecords as any)?.PreviousHT &&
               !(pastRecords as any)?.PreviousIT && (
                <p className="text-sm text-muted-foreground italic">No past treatment records available</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
