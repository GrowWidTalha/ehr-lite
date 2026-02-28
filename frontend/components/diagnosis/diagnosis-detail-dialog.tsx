'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DiagnosisDetail } from '@/components/diagnosis/diagnosis-detail';
import type { CancerDiagnosis } from '@/lib/db.types';

interface DiagnosisDetailDialogProps {
  diagnosis: CancerDiagnosis | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

export function DiagnosisDetailDialog({
  diagnosis,
  open,
  onOpenChange,
  onEdit,
}: DiagnosisDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Diagnosis Details</DialogTitle>
          <DialogDescription>
            Full diagnosis information including pathology, biomarkers, imaging, and treatment plan
          </DialogDescription>
        </DialogHeader>
        {diagnosis && (
          <DiagnosisDetail
            diagnosis={diagnosis}
            onEdit={onEdit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
