'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
            {diagnosis.stage && <Badge variant="secondary">Stage {diagnosis.stage}</Badge>}
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
                <span className="text-sm font-medium">{diagnosis.who_classification}</span>
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

      {/* Pathology Details */}
      {diagnosis.tumor_size || diagnosis.margins || diagnosis.lvi || diagnosis.pni ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pathology Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {diagnosis.tumor_size && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tumor Size</span>
                <span className="text-sm font-medium">{diagnosis.tumor_size}</span>
              </div>
            )}
            {diagnosis.depth && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Depth</span>
                <span className="text-sm font-medium">{diagnosis.depth}</span>
              </div>
            )}
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
        </Card>
      ) : null}

      {/* Biomarker Results */}
      {diagnosis.er_status || diagnosis.pr_status || diagnosis.her2_status || diagnosis.ki67_percentage ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Biomarker Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {diagnosis.er_status && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ER Status</span>
                <Badge variant={diagnosis.er_status === 'positive' ? 'default' : 'secondary'}>
                  {diagnosis.er_status}
                  {diagnosis.er_percentage && ` (${diagnosis.er_percentage}%)`}
                </Badge>
              </div>
            )}
            {diagnosis.pr_status && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">PR Status</span>
                <Badge variant={diagnosis.pr_status === 'positive' ? 'default' : 'secondary'}>
                  {diagnosis.pr_status}
                  {diagnosis.pr_percentage && ` (${diagnosis.pr_percentage}%)`}
                </Badge>
              </div>
            )}
            {diagnosis.her2_status && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">HER2 Status</span>
                <Badge variant={diagnosis.her2_status === '3+' ? 'default' : 'secondary'}>
                  {diagnosis.her2_status}
                </Badge>
              </div>
            )}
            {diagnosis.ki67_percentage && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ki-67 Index</span>
                <span className="text-sm font-medium">{diagnosis.ki67_percentage}%</span>
              </div>
            )}
          </CardContent>
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
