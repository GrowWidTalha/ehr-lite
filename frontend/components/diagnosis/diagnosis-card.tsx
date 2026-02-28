'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { CancerDiagnosis } from '@/lib/db.types';

interface DiagnosisCardProps {
  diagnosis: CancerDiagnosis;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function DiagnosisCard({ diagnosis, onView, onEdit, onDelete }: DiagnosisCardProps) {
  return (
    <Card className="border hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-medium text-base mb-1">{diagnosis.cancer_type}</h4>
            <div className="flex flex-wrap gap-2">
              {diagnosis.stage && (
                <Badge variant="secondary">Stage {diagnosis.stage}</Badge>
              )}
              {diagnosis.grade && (
                <Badge variant="outline">Grade {diagnosis.grade}</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(diagnosis.id)}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(diagnosis.id)}
                className="h-8 w-8 p-0"
              >
                <FileText className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(diagnosis.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          {diagnosis.who_classification && (
            <p>WHO: {diagnosis.who_classification}</p>
          )}
          {diagnosis.diagnosis_date && (
            <p>Diagnosed: {formatDate(diagnosis.diagnosis_date)}</p>
          )}
          {diagnosis.plan_type && (
            <p className="text-xs truncate">Plan: {diagnosis.plan_type}</p>
          )}
        </div>

        {/* Quick summary indicators */}
        <div className="flex gap-2 mt-3 pt-3 border-t">
          {diagnosis.tumor_size && (
            <span className="text-xs text-muted-foreground">
              Size: {diagnosis.tumor_size}
            </span>
          )}
          {diagnosis.er_status && (
            <span className="text-xs text-muted-foreground">
              ER: {diagnosis.er_status}
            </span>
          )}
          {diagnosis.her2_status && (
            <span className="text-xs text-muted-foreground">
              HER2: {diagnosis.her2_status}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
