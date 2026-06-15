'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Edit, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { CancerDiagnosis } from '@/lib/db.types';

interface DiagnosisDetailProps {
  diagnosis: CancerDiagnosis;
  onEdit?: () => void;
  onClose?: () => void;
}

export function DiagnosisDetail({ diagnosis, onEdit, onClose }: DiagnosisDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{diagnosis.cancer_type}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {diagnosis.stAge && <Badge variant="secondary">StAge {diagnosis.stAge}</Badge>}
            {diagnosis.grade && <Badge variant="outline">Grade {diagnosis.grade}</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Basic Information */}
      {diagnosis.who_classification || diagnosis.diagnosis_date ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {diagnosis.who_classification && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">WHO Classification</span>
                <span className="text-sm font-medium">
                  {diagnosis.who_classification === '0' && '0 - Normal'}
                  {diagnosis.who_classification === '1' && '1 - Ambulatory'}
                  {diagnosis.who_classification === '2' && '2 - < 50% in bed'}
                  {diagnosis.who_classification === '3' && '3 - > 50% in bed'}
                  {diagnosis.who_classification === '4' && '4 - 100% bedridden'}
                  {diagnosis.who_classification}
                </span>
              </div>
            )}
            {diagnosis.diagnosis_date && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Diagnosis Date</span>
                <span className="text-sm font-medium">{formatDate(diagnosis.diagnosis_date)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Pathology Details - Essential Staging Data Only */}
      {diagnosis.margins || diagnosis.lvi || diagnosis.pni ||
       (diagnosis.nodes_recovered !== undefined) || (diagnosis.nodes_involved !== undefined) ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pathology Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {diagnosis.margins && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Margins</span>
                <span className="text-sm font-medium capitalize">{diagnosis.margins}</span>
              </div>
            )}
            {diagnosis.lvi && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Lymphovascular Invasion</span>
                <span className="text-sm font-medium capitalize">{diagnosis.lvi}</span>
              </div>
            )}
            {diagnosis.pni && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Perineural Invasion</span>
                <span className="text-sm font-medium capitalize">{diagnosis.pni}</span>
              </div>
            )}
            {(diagnosis.nodes_recovered !== undefined || diagnosis.nodes_involved !== undefined) && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Lymph Nodes</span>
                <span className="text-sm font-medium">
                  {diagnosis.nodes_involved || 0}/{diagnosis.nodes_recovered || 0} involved
                </span>
              </div>
            )}
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground border-t pt-4">
            <p>For detailed biomarker testing (ER, PR, HER2, Ki-67), molecular markers, and tumor measurements, see uploaded pathology reports in the Reports tab.</p>
          </CardFooter>
        </Card>
      ) : null}

      {/* Imaging Findings */}
      {diagnosis.study_type || diagnosis.findings ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Imaging Findings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {diagnosis.study_type && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Study Type</span>
                <span className="text-sm font-medium">{diagnosis.study_type}</span>
              </div>
            )}
            {diagnosis.study_date && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Study Date</span>
                <span className="text-sm font-medium">{formatDate(diagnosis.study_date)}</span>
              </div>
            )}
            {diagnosis.indication && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Indication</span>
                <span className="text-sm font-medium max-w-xs truncate">{diagnosis.indication}</span>
              </div>
            )}
            {diagnosis.findings && (
              <div className="pt-2">
                <span className="text-sm text-muted-foreground block mb-1">Findings</span>
                <p className="text-sm bg-muted/50 p-3 rounded-md">{diagnosis.findings}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Treatment Plan */}
      {diagnosis.plan_type || diagnosis.surgery_planned ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Treatment Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {diagnosis.plan_type && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Plan Type</span>
                <Badge variant={diagnosis.plan_type === 'curative' ? 'default' : 'secondary'}>
                  {diagnosis.plan_type}
                </Badge>
              </div>
            )}
            {diagnosis.surgery_planned && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Surgery Planned</span>
                <span className="text-sm font-medium capitalize">{diagnosis.surgery_planned}</span>
              </div>
            )}
            {diagnosis.neoadjuvant_chemo && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Neoadjuvant Chemotherapy</span>
                <span className="text-sm font-medium capitalize">{diagnosis.neoadjuvant_chemo}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
