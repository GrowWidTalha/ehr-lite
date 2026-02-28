// Diagnosis edit wizard page - User Story 10
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDiagnosis, useUpdateDiagnosis } from '@/hooks/use-diagnosis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
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

export default function EditDiagnosisPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const diagnosisId = params.diagnosisId as string;

  const { data: diagnosis, isLoading } = useDiagnosis(diagnosisId, patientId);
  const updateDiagnosis = useUpdateDiagnosis();

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
    neoadjuvant_chemo: '',
  });

  // Load existing diagnosis data
  useEffect(() => {
    if (diagnosis) {
      setFormData({
        cancer_type: diagnosis.cancer_type || '',
        stage: diagnosis.stage || '',
        grade: diagnosis.grade || '',
        who_classification: diagnosis.who_classification || '',
        diagnosis_date: diagnosis.diagnosis_date?.split('T')[0] || '',
        tumor_size: diagnosis.tumor_size || '',
        depth: diagnosis.depth || '',
        margins: diagnosis.margins || '',
        lvi: diagnosis.lvi || '',
        pni: diagnosis.pni || '',
        nodes_recovered: diagnosis.nodes_recovered?.toString() || '',
        nodes_involved: diagnosis.nodes_involved?.toString() || '',
        er_status: diagnosis.er_status || '',
        er_percentage: diagnosis.er_percentage || '',
        pr_status: diagnosis.pr_status || '',
        pr_percentage: diagnosis.pr_percentage || '',
        her2_status: diagnosis.her2_status || '',
        ki67_percentage: diagnosis.ki67_percentage || '',
        study_type: diagnosis.study_type || '',
        study_date: diagnosis.study_date?.split('T')[0] || '',
        findings: diagnosis.findings || '',
        indication: diagnosis.indication || '',
        plan_type: diagnosis.plan_type || '',
        surgery_planned: diagnosis.surgery_planned || '',
        neoadjuvant_chemo: diagnosis.neoadjuvant_chemo || '',
      });
    }
  }, [diagnosis]);

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
      await updateDiagnosis.mutateAsync({
        patientId,
        id: diagnosisId,
        data: formData as any,
      });

      toast.success('Diagnosis updated successfully');
      // Redirect to patient detail
      router.push(`/patients/${patientId}`);
    } catch (error: any) {
      console.error('Failed to update diagnosis:', error);
      toast.error(error?.message || 'Failed to update diagnosis. Please try again.');
    }
  };

  const progressValue = ((currentStepIndex + 1) / STEPS.length) * 100;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Diagnosis not found</p>
              <Link href={`/patients/${patientId}`}>
                <Button>Back to Patient</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <Link href={`/patients/${patientId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patient
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Edit Cancer Diagnosis</CardTitle>
            <CardDescription>
              Step {currentStepIndex + 1} of {STEPS.length}: {STEPS[currentStepIndex].title}
            </CardDescription>
            <Progress value={progressValue} className="mt-4" />
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
                  disabled={updateDiagnosis.isPending}
                >
                  {updateDiagnosis.isPending ? (
                    <>
                      <LoadingSpinner />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Changes
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

            {/* Step indicators */}
            <div className="flex justify-center gap-2 text-sm text-muted-foreground">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-1 ${
                    index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                      completedSteps.includes(step.id)
                        ? 'bg-primary text-primary-foreground'
                        : index === currentStepIndex
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                    }`}
                  >
                    {completedSteps.includes(step.id) ? <Check className="h-3 w-3" /> : index + 1}
                  </div>
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
