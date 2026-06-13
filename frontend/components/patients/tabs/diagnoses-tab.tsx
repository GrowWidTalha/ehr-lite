// Diagnoses tab component - shows diagnosis with update/delete actions
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Edit, Trash2 } from 'lucide-react';
import { useDiagnoses, useDeleteDiagnosis } from '@/hooks/use-diagnosis';
import { DiagnosisDetailDialog } from '@/components/diagnosis/diagnosis-detail-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import type { CancerDiagnosis } from '@/lib/db.types';

interface DiagnosesTabProps {
  patientId: string;
}

export function DiagnosesTab({ patientId }: DiagnosesTabProps) {
  const router = useRouter();
  const { data: diagnoses, isLoading } = useDiagnoses(parseInt(patientId));
  const deleteDiagnosis = useDeleteDiagnosis();
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<CancerDiagnosis | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleView = (id: string) => {
    const diagnosis = diagnoses?.find((d) => d.id === id);
    if (diagnosis) {
      setSelectedDiagnosis(diagnosis);
      setDetailOpen(true);
    }
  };

  const handleEdit = (id: string) => {
    setDetailOpen(false);
    router.push(`/patients/${patientId}/diagnoses/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteDiagnosis.mutateAsync({ patientId: parseInt(patientId) });
      toast.success('Diagnosis deleted successfully');
      setDeleteId(null);
      if (selectedDiagnosis?.id === deleteId) {
        setSelectedDiagnosis(null);
        setDetailOpen(false);
      }
    } catch (error) {
      console.error('Failed to delete diagnosis:', error);
      toast.error('Failed to delete diagnosis. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const hasDiagnosis = diagnoses && diagnoses.length > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cancer Diagnosis</CardTitle>
              <CardDescription>
                {hasDiagnosis ? 'Current diagnosis on file' : 'No diagnosis recorded'}
              </CardDescription>
            </div>
            {hasDiagnosis && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleEdit(diagnoses![0].id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Diagnosis
                </Button>
                <Button variant="outline" onClick={() => setDeleteId(diagnoses![0].id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasDiagnosis ? (
            <div className="space-y-4">
              {diagnoses!.map((diagnosis) => (
                <div
                  key={diagnosis.id}
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => handleView(diagnosis.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-lg">{diagnosis.cancer_type}</h4>
                      <div className="flex flex-wrap gap-2">
                        {diagnosis.stAge && (
                          <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">Stage {diagnosis.stAge}</span>
                        )}
                        {diagnosis.grade && (
                          <span className="text-sm bg-secondary text-secondary-foreground px-2 py-0.5 rounded">Grade {diagnosis.grade}</span>
                        )}
                        {diagnosis.diagnosis_date && (
                          <span className="text-sm text-muted-foreground">
                            Diagnosed: {diagnosis.diagnosis_date}
                          </span>
                        )}
                      </div>
                    </div>
                    <Edit className="h-4 w-4 text-muted-foreground" />
                  </div>

                  {/* Quick summary of key fields */}
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
                    {diagnosis.who_classification && (
                      <div>WHO: {diagnosis.who_classification === '0' ? 'Normal' : diagnosis.who_classification === '1' ? 'Ambulatory' : diagnosis.who_classification === '2' ? '< 50% in bed' : diagnosis.who_classification === '3' ? '> 50% in bed' : diagnosis.who_classification === '4' ? '100% bedridden' : diagnosis.who_classification}</div>
                    )}
                    {diagnosis.margins && <div>Margins: {diagnosis.margins}</div>}
                    {diagnosis.nodes_recovered && <div>Nodes: {diagnosis.nodes_involved || 0}/{diagnosis.nodes_recovered}</div>}
                    {diagnosis.plan_type && <div>Plan: {diagnosis.plan_type}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-4">No diagnosis recorded yet.</p>
              <Button onClick={() => router.push(`/patients/${patientId}/diagnoses/new`)}>
                <Edit className="mr-2 h-4 w-4" />
                Add Diagnosis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <DiagnosisDetailDialog
        diagnosis={selectedDiagnosis}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={() => selectedDiagnosis && handleEdit(selectedDiagnosis.id)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Diagnosis?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all diagnosis data for this patient. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Diagnosis
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
