'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CANCER_TYPES, CANCER_STAGES, CANCER_GRADES, STUDY_TYPES, YES_NO_OPTIONS } from '@/lib/utils';

type DiagnosisInnerStep = 'basic' | 'pathology' | 'biomarker' | 'imaging' | 'treatment';

const DIAGNOSIS_STEPS: { id: DiagnosisInnerStep; title: string; description: string }[] = [
  { id: 'basic', title: 'Basic', description: 'Cancer type, stage, grade' },
  { id: 'pathology', title: 'Pathology', description: 'Tumor details' },
  { id: 'biomarker', title: 'Biomarkers', description: 'ER, PR, HER2' },
  { id: 'imaging', title: 'Imaging', description: 'CT, MRI, PET' },
  { id: 'treatment', title: 'Treatment', description: 'Plan' },
];

interface DiagnosisWizardStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

export function DiagnosisWizardStep({ formData, onChange, error }: DiagnosisWizardStepProps) {
  const [innerStep, setInnerStep] = useState<DiagnosisInnerStep>('basic');
  const [completedInnerSteps, setCompletedInnerSteps] = useState<DiagnosisInnerStep[]>([]);

  const diagnosis = formData.diagnosis || {};

  const updateDiagnosis = (updates: any) => {
    onChange({
      ...formData,
      diagnosis: { ...diagnosis, ...updates },
    });
  };

  const currentInnerStepIndex = DIAGNOSIS_STEPS.findIndex((s) => s.id === innerStep);
  const innerProgressValue = ((currentInnerStepIndex + 1) / DIAGNOSIS_STEPS.length) * 100;

  const handleInnerNext = () => {
    // Mark current step as completed
    if (!completedInnerSteps.includes(innerStep)) {
      setCompletedInnerSteps([...completedInnerSteps, innerStep]);
    }

    // Move to next step
    const nextIndex = currentInnerStepIndex + 1;
    if (nextIndex < DIAGNOSIS_STEPS.length) {
      setInnerStep(DIAGNOSIS_STEPS[nextIndex].id);
    }
  };

  const handleInnerPrevious = () => {
    const prevIndex = currentInnerStepIndex - 1;
    if (prevIndex >= 0) {
      setInnerStep(DIAGNOSIS_STEPS[prevIndex].id);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Enter the complete cancer diagnosis information. All fields are optional during onboarding.
      </p>

      {/* Inner Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Diagnosis Progress</span>
          <span>{currentInnerStepIndex + 1} of {DIAGNOSIS_STEPS.length}</span>
        </div>
        <Progress value={innerProgressValue} className="h-1" />
      </div>

      {/* Basic Step */}
      {innerStep === 'basic' && (
        <div className="space-y-4">
          <h4 className="font-medium">Basic Diagnosis Information</h4>

          <div className="space-y-2">
            <Label htmlFor="cancer_type">Cancer Type</Label>
            <Select
              value={diagnosis.cancer_type}
              onValueChange={(value) => updateDiagnosis({ cancer_type: value })}
            >
              <SelectTrigger id="cancer_type">
                <SelectValue placeholder="Select cancer type..." />
              </SelectTrigger>
              <SelectContent>
                {CANCER_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Select
                value={diagnosis.stage}
                onValueChange={(value) => updateDiagnosis({ stage: value })}
              >
                <SelectTrigger id="stage">
                  <SelectValue placeholder="Stage..." />
                </SelectTrigger>
                <SelectContent>
                  {CANCER_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      Stage {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Select
                value={diagnosis.grade}
                onValueChange={(value) => updateDiagnosis({ grade: value })}
              >
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Grade..." />
                </SelectTrigger>
                <SelectContent>
                  {CANCER_GRADES.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis_date">Diagnosis Date</Label>
              <Input
                id="diagnosis_date"
                type="date"
                value={diagnosis.diagnosis_date}
                onChange={(e) => updateDiagnosis({ diagnosis_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="who_classification">WHO Classification</Label>
            <Input
              id="who_classification"
              value={diagnosis.who_classification}
              onChange={(e) => updateDiagnosis({ who_classification: e.target.value })}
              placeholder="e.g., Infiltrating ductal carcinoma"
            />
          </div>
        </div>
      )}

      {/* Pathology Step */}
      {innerStep === 'pathology' && (
        <div className="space-y-4">
          <h4 className="font-medium">Pathology Report</h4>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tumor_size">Tumor Size</Label>
              <Input
                id="tumor_size"
                value={diagnosis.tumor_size}
                onChange={(e) => updateDiagnosis({ tumor_size: e.target.value })}
                placeholder="e.g., 2.5 cm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="depth">Depth</Label>
              <Input
                id="depth"
                value={diagnosis.depth}
                onChange={(e) => updateDiagnosis({ depth: e.target.value })}
                placeholder="e.g., 1.2 cm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="margins">Margins</Label>
              <Select
                value={diagnosis.margins}
                onValueChange={(value) => updateDiagnosis({ margins: value })}
              >
                <SelectTrigger id="margins">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear">Clear</SelectItem>
                  <SelectItem value="close">Close</SelectItem>
                  <SelectItem value="involved">Involved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lvi">Lymphovascular Invasion</Label>
              <Select
                value={diagnosis.lvi}
                onValueChange={(value) => updateDiagnosis({ lvi: value })}
              >
                <SelectTrigger id="lvi">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nodes_recovered">Nodes Recovered</Label>
              <Input
                id="nodes_recovered"
                type="number"
                value={diagnosis.nodes_recovered}
                onChange={(e) => updateDiagnosis({ nodes_recovered: e.target.value })}
                placeholder="Number of nodes"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nodes_involved">Nodes Involved</Label>
              <Input
                id="nodes_involved"
                type="number"
                value={diagnosis.nodes_involved}
                onChange={(e) => updateDiagnosis({ nodes_involved: e.target.value })}
                placeholder="Number of nodes"
              />
            </div>
          </div>
        </div>
      )}

      {/* Biomarker Step */}
      {innerStep === 'biomarker' && (
        <div className="space-y-4">
          <h4 className="font-medium">Biomarker Tests</h4>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="er_status">ER Status</Label>
              <Select
                value={diagnosis.er_status}
                onValueChange={(value) => updateDiagnosis({ er_status: value })}
              >
                <SelectTrigger id="er_status">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="er_percentage">ER Percentage</Label>
              <Input
                id="er_percentage"
                type="number"
                value={diagnosis.er_percentage}
                onChange={(e) => updateDiagnosis({ er_percentage: e.target.value })}
                placeholder="%"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pr_status">PR Status</Label>
              <Select
                value={diagnosis.pr_status}
                onValueChange={(value) => updateDiagnosis({ pr_status: value })}
              >
                <SelectTrigger id="pr_status">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pr_percentage">PR Percentage</Label>
              <Input
                id="pr_percentage"
                type="number"
                value={diagnosis.pr_percentage}
                onChange={(e) => updateDiagnosis({ pr_percentage: e.target.value })}
                placeholder="%"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="her2_status">HER2 Status</Label>
              <Select
                value={diagnosis.her2_status}
                onValueChange={(value) => updateDiagnosis({ her2_status: value })}
              >
                <SelectTrigger id="her2_status">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1+">1+</SelectItem>
                  <SelectItem value="2+">2+</SelectItem>
                  <SelectItem value="3+">3+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ki67_percentage">Ki-67 Percentage</Label>
              <Input
                id="ki67_percentage"
                type="number"
                value={diagnosis.ki67_percentage}
                onChange={(e) => updateDiagnosis({ ki67_percentage: e.target.value })}
                placeholder="%"
              />
            </div>
          </div>
        </div>
      )}

      {/* Imaging Step */}
      {innerStep === 'imaging' && (
        <div className="space-y-4">
          <h4 className="font-medium">Imaging Studies</h4>

          <div className="space-y-2">
            <Label htmlFor="study_type">Study Type</Label>
            <Select
              value={diagnosis.study_type}
              onValueChange={(value) => updateDiagnosis({ study_type: value })}
            >
              <SelectTrigger id="study_type">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {STUDY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="study_date">Study Date</Label>
            <Input
              id="study_date"
              type="date"
              value={diagnosis.study_date}
              onChange={(e) => updateDiagnosis({ study_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="findings">Findings</Label>
            <Textarea
              id="findings"
              value={diagnosis.findings}
              onChange={(e) => updateDiagnosis({ findings: e.target.value })}
              placeholder="Enter imaging findings..."
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="indication">Indication</Label>
            <Textarea
              id="indication"
              value={diagnosis.indication}
              onChange={(e) => updateDiagnosis({ indication: e.target.value })}
              placeholder="Reason for imaging..."
              className="min-h-[60px]"
            />
          </div>
        </div>
      )}

      {/* Treatment Step */}
      {innerStep === 'treatment' && (
        <div className="space-y-4">
          <h4 className="font-medium">Treatment Plan</h4>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="plan_type">Plan Type</Label>
              <Select
                value={diagnosis.plan_type}
                onValueChange={(value) => updateDiagnosis({ plan_type: value })}
              >
                <SelectTrigger id="plan_type">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="curative">Curative</SelectItem>
                  <SelectItem value="palliative">Palliative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="surgery_planned">Surgery Planned</Label>
              <Select
                value={diagnosis.surgery_planned}
                onValueChange={(value) => updateDiagnosis({ surgery_planned: value })}
              >
                <SelectTrigger id="surgery_planned">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {YES_NO_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === 'yes' ? 'Yes' : 'No'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="neoadjuvant_chemo">Neoadjuvant Chemotherapy</Label>
              <Select
                value={diagnosis.neoadjuvant_chemo}
                onValueChange={(value) => updateDiagnosis({ neoadjuvant_chemo: value })}
              >
                <SelectTrigger id="neoadjuvant_chemo">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {YES_NO_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === 'yes' ? 'Yes' : 'No'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Inner Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={handleInnerPrevious}
          disabled={currentInnerStepIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {currentInnerStepIndex === DIAGNOSIS_STEPS.length - 1 ? (
          <div className="text-sm text-muted-foreground">
            Diagnosis complete - Continue to finish onboarding
          </div>
        ) : (
          <Button onClick={handleInnerNext}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Inner Step Indicators */}
      <div className="flex justify-center gap-2 text-sm text-muted-foreground flex-wrap">
        {DIAGNOSIS_STEPS.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center gap-1 ${
              index <= currentInnerStepIndex ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            <div
              className={`h-5 w-5 rounded-full flex items-center justify-center text-xs ${
                completedInnerSteps.includes(step.id)
                  ? 'bg-primary text-primary-foreground'
                  : index === currentInnerStepIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
              }`}
            >
              {index + 1}
            </div>
            <span className="hidden sm:inline text-xs">{step.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
