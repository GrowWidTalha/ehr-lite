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
    <Card className="border hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-medium text-base mb-1">{diagnosis.cancer_type}</h4>
            <div className="flex flex-wrap gap-2">
              {diagnosis.stAge && (
                <Badge variant="purple">StAge {diagnosis.stAge}</Badge>
              )}
              {diagnosis.grade && (
                <Badge variant="blue">Grade {diagnosis.grade}</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(diagnosis.id)}
                className="h-8 w-8 p-0 hover:bg-[var(--color-blue-light)] hover:text-[var(--color-blue)] transition-colors"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(diagnosis.id)}
                className="h-8 w-8 p-0 hover:bg-[var(--color-green-light)] hover:text-[var(--color-green)] transition-colors"
              >
                <FileText className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(diagnosis.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          {diagnosis.who_classification && (
            <p>WHO: {
              diagnosis.who_classification === '0' ? '0 - Normal' :
              diagnosis.who_classification === '1' ? '1 - Ambulatory' :
              diagnosis.who_classification === '2' ? '2 - < 50% in bed' :
              diagnosis.who_classification === '3' ? '3 - > 50% in bed' :
              diagnosis.who_classification === '4' ? '4 - 100% bedridden' :
              diagnosis.who_classification
            }</p>
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
          {diagnosis.plan_type && (
            <span className="text-xs text-muted-foreground">
              Plan: {diagnosis.plan_type}
            </span>
          )}
          {diagnosis.surgery_planned && (
            <span className="text-xs text-muted-foreground">
              Surgery: {diagnosis.surgery_planned}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
