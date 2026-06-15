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
import { ReportsUploadStep } from '@/components/diagnosis/steps/reports-upload-step';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type DiagnosisStep = 'basic' | 'reports' | 'treatment';

const STEPS: { id: DiagnosisStep; title: string; description: string }[] = [
  { id: 'basic', title: 'Basic', description: 'Cancer type, stage, grade' },
  { id: 'reports', title: 'Reports Upload', description: 'Attach reports & imaging' },
  { id: 'treatment', title: 'Treatment', description: 'Treatment plan' },
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
    reports: null,
    treatment: null,
  });

  const [formData, setFormData] = useState({
    cancer_type: '',
    stAge: '',
    grade: '',
    who_classification: '',
    diagnosis_date: '',
    treatment_plan: '',
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
        patientId: parseInt(patientId),
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
              totalSteps={3}
              stepNames={['Basic', 'Reports', 'Treatment']}
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

            {currentStep === 'reports' && (
              <ReportsUploadStep
                formData={formData}
                onChange={setFormData}
                error={stepErrors.reports}
                patientId={patientId}
              />
            )}

            {currentStep === 'treatment' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Treatment Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter the complete treatment plan (optional)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="treatment_plan" className="text-sm font-medium">
                    Treatment Plan
                  </Label>
                  <Textarea
                    id="treatment_plan"
                    placeholder="Enter detailed treatment plan including surgery, chemotherapy, radiotherapy, hormonal therapy, targeted therapy, immunotherapy, etc."
                    value={formData.treatment_plan}
                    onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
                    rows={12}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Free-form field for detailed treatment documentation
                  </p>
                </div>
              </div>
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
