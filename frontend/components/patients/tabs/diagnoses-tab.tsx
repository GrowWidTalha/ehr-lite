// Diagnoses tab component - User Story 3 & 10/11
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import { useDiagnoses, useDeleteDiagnosis } from '@/hooks/use-diagnosis';
import { DiagnosisCard } from '@/components/diagnosis/diagnosis-card';
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
import Link from 'next/link';
import type { CancerDiagnosis } from '@/lib/db.types';

interface DiagnosesTabProps {
  patientId: string;
}

export function DiagnosesTab({ patientId }: DiagnosesTabProps) {
  const router = useRouter();
  const { data: diagnoses, isLoading } = useDiagnoses(patientId);
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
      await deleteDiagnosis.mutateAsync({ patientId, id: deleteId });
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cancer Diagnoses</CardTitle>
              <CardDescription>Recorded cancer diagnoses with pathology details</CardDescription>
            </div>
            <Link href={`/patients/${patientId}/diagnoses/new`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Diagnosis
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {diagnoses && diagnoses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {diagnoses.map((diagnosis) => (
                <DiagnosisCard
                  key={diagnosis.id}
                  diagnosis={diagnosis}
                  onView={handleView}
                  onEdit={(id) => handleEdit(id)}
                  onDelete={(id) => setDeleteId(id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-4">No diagnoses recorded yet.</p>
              <Link href={`/patients/${patientId}/diagnoses/new`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Diagnosis
                </Button>
              </Link>
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
              Are you sure you want to delete this diagnosis? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
