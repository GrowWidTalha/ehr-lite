// Diagnosis wizard page - User Story 5
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateDiagnosis } from '@/hooks/use-diagnosis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { FormProgress } from '@/components/shared/form-progress';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { BasicStep } from '@/components/diagnosis/steps/basic-step';
import { PathologyStep } from '@/components/diagnosis/steps/pathology-step';
import { BiomarkerStep } from '@/components/diagnosis/steps/biomarker-step';
import { ImagingStep } from '@/components/diagnosis/steps/imaging-step';
import { TreatmentStep } from '@/components/diagnosis/steps/treatment-step';
import { toast } from 'sonner';

type DiagnosisStep = 'basic' | 'pathology' | 'biomarker' | 'imaging' | 'treatment';

const STEPS: { id: DiagnosisStep; title: string; description: string }[] = [
  { id: 'basic', title: 'Basic', description: 'Cancer type, stage, grade' },
  { id: 'pathology', title: 'Pathology', description: 'Tumor details' },
  { id: 'biomarker', title: 'Biomarkers', description: 'ER, PR, HER2' },
  { id: 'imaging', title: 'Imaging', description: 'CT, MRI, PET' },
  { id: 'treatment', title: 'Treatment', description: 'Plan' },
];

// Validation rules for each step
const validateStep = (step: DiagnosisStep, formData: any): { valid: boolean; error: string | null } => {
  switch (step) {
    case 'basic':
      if (!formData.cancer_type?.trim()) {
        return { valid: false, error: 'Cancer type is required' };
      }
      break;
    // Other steps are optional
    default:
      break;
  }
  return { valid: true, error: null };
};

export default function NewDiagnosisPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const createDiagnosis = useCreateDiagnosis();

  const [currentStep, setCurrentStep] = useState<DiagnosisStep>('basic');
  const [completedSteps, setCompletedSteps] = useState<DiagnosisStep[]>([]);
  const [stepErrors, setStepErrors] = useState<Record<DiagnosisStep, string | null>>({
    basic: null,
    pathology: null,
    biomarker: null,
    imaging: null,
    treatment: null,
  });

  const [formData, setFormData] = useState({
    // Basic (Required: cancer_type)
    cancer_type: '',
    stage: '',
    grade: '',
    who_classification: '',
    diagnosis_date: '',
    // Pathology (Optional)
    tumor_size: '',
    depth: '',
    margins: '',
    lvi: '',
    pni: '',
    nodes_recovered: '',
    nodes_involved: '',
    // Biomarkers (Optional)
    er_status: '',
    er_percentage: '',
    pr_status: '',
    pr_percentage: '',
    her2_status: '',
    ki67_percentage: '',
    // Imaging (Optional)
    study_type: '',
    study_date: '',
    findings: '',
    indication: '',
    // Treatment (Optional)
    plan_type: '',
    surgery_planned: '',
  });

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const handleNext = () => {
    // Validate current step
    const validation = validateStep(currentStep, formData);

    if (!validation.valid) {
      setStepErrors({ ...stepErrors, [currentStep]: validation.error });
      toast.error(validation.error || 'Please fix the errors before continuing');
      return;
    }

    // Clear error for current step
    setStepErrors({ ...stepErrors, [currentStep]: null });

    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    // Move to next step
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
      // Clear error when going back
      setStepErrors({ ...stepErrors, [STEPS[prevIndex].id]: null });
    }
  };

  const handleFinish = async () => {
    // Validate final step
    const validation = validateStep(currentStep, formData);

    if (!validation.valid) {
      setStepErrors({ ...stepErrors, [currentStep]: validation.error });
      toast.error(validation.error || 'Please fix the errors before submitting');
      return;
    }

    try {
      await createDiagnosis.mutateAsync({
        patientId,
        data: formData as any,
      });

      toast.success('Diagnosis created successfully');
      // Redirect to patient detail
      router.push(`/patients/${patientId}`);
    } catch (error: any) {
      console.error('Failed to create diagnosis:', error);
      toast.error(error?.message || 'Failed to create diagnosis. Please try again.');
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <Link href={`/patients/${patientId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patient
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>New Cancer Diagnosis</CardTitle>
            <CardDescription>{STEPS[currentStepIndex].description}</CardDescription>
            <FormProgress
              currentStep={currentStepIndex + 1}
              totalSteps={5}
              stepNames={['Basic', 'Pathology', 'Biomarkers', 'Imaging', 'Treatment']}
              className="mt-4"
            />
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Error message */}
            {stepErrors[currentStep] && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {stepErrors[currentStep]}
              </div>
            )}

            {/* Step content */}
            {currentStep === 'basic' && (
              <BasicStep
                formData={formData}
                onChange={setFormData}
                error={stepErrors.basic}
              />
            )}

            {currentStep === 'pathology' && (
              <PathologyStep
                formData={formData}
                onChange={setFormData}
                error={stepErrors.pathology}
              />
            )}

            {currentStep === 'biomarker' && (
              <BiomarkerStep
                formData={formData}
                onChange={setFormData}
                error={stepErrors.biomarker}
              />
            )}

            {currentStep === 'imaging' && (
              <ImagingStep
                formData={formData}
                onChange={setFormData}
                error={stepErrors.imaging}
              />
            )}

            {currentStep === 'treatment' && (
              <TreatmentStep
                formData={formData}
                onChange={setFormData}
                error={stepErrors.treatment}
              />
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentStepIndex === STEPS.length - 1 ? (
                <Button
                  onClick={handleFinish}
                  disabled={createDiagnosis.isPending}
                >
                  {createDiagnosis.isPending ? (
                    <>
                      <LoadingSpinner />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Finish
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
