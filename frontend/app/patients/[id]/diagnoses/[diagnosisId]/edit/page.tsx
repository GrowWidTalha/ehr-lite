// Diagnosis edit wizard page - User Story 10
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDiagnosis, useUpdateDiagnosis } from '@/hooks/use-diagnosis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { FormProgress } from '@/components/shared/form-progress';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { BasicStep } from '@/components/diagnosis/steps/basic-step';
import { PathologyStep } from '@/components/diagnosis/steps/pathology-step';
import { ReportsUploadStep } from '@/components/diagnosis/steps/reports-upload-step';
import { TreatmentStep } from '@/components/diagnosis/steps/treatment-step';
import { toast } from 'sonner';

type DiagnosisStep = 'basic' | 'pathology' | 'reports' | 'treatment';

const STEPS: { id: DiagnosisStep; title: string; description: string }[] = [
  { id: 'basic', title: 'Basic', description: 'Cancer type, stAge, grade' },
  { id: 'pathology', title: 'Pathology', description: 'Tumor details' },
  { id: 'reports', title: 'Reports Upload', description: 'Attach reports & imaging' },
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

  const { data: diagnosis, isLoading } = useDiagnosis(parseInt(patientId));
  const updateDiagnosis = useUpdateDiagnosis();

  const [currentStep, setCurrentStep] = useState<DiagnosisStep>('basic');
  const [completedSteps, setCompletedSteps] = useState<DiagnosisStep[]>([]);
  const [stepErrors, setStepErrors] = useState<Record<DiagnosisStep, string | null>>({
    basic: null,
    pathology: null,
    reports: null,
    treatment: null,
  });

  const [formData, setFormData] = useState({
    cancer_type: '',
    stAge: '',
    grade: '',
    who_classification: '',
    diagnosis_date: '',
    margins: '',
    lvi: '',
    pni: '',
    nodes_recovered: '',
    nodes_involved: '',
    study_type: '',
    study_date: '',
    findings: '',
    indication: '',
    plan_type: '',
    surgery_planned: '',
    neoadjuvant_chemo: '',
  });

  // Load existing diagnosis data
  useEffect(() => {
    if (diagnosis) {
      const d = diagnosis as any;
      // Handle both single diagnosis and {treatments, pathology} format
      const diag = d.cancer_type ? d : (Array.isArray(d.treatments) ? {} : d);
      setFormData({
        cancer_type: diag.cancer_type || d.cancer_type || '',
        stAge: diag.stAge || d.stAge || '',
        grade: diag.grade || d.grade || '',
        who_classification: diag.who_classification || d.who_classification || '',
        diagnosis_date: (diag.diagnosis_date || d.diagnosis_date || '').split('T')[0],
        margins: diag.margins || d.margins || '',
        lvi: diag.lvi || d.lvi || '',
        pni: diag.pni || d.pni || '',
        nodes_recovered: (diag.nodes_recovered || d.nodes_recovered || '').toString(),
        nodes_involved: (diag.nodes_involved || d.nodes_involved || '').toString(),
        study_type: diag.study_type || d.study_type || '',
        study_date: (diag.study_date || d.study_date || '').split('T')[0],
        findings: diag.findings || d.findings || '',
        indication: diag.indication || d.indication || '',
        plan_type: diag.plan_type || d.plan_type || '',
        surgery_planned: diag.surgery_planned || d.surgery_planned || '',
        neoadjuvant_chemo: diag.neoadjuvant_chemo || d.neoadjuvant_chemo || '',
      });
    }
  }, [diagnosis]);

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const handleNext = () => {
    const validation = validateStep(currentStep, formData);
    if (!validation.valid) {
      setStepErrors({ ...stepErrors, [currentStep]: validation.error });
      toast.error(validation.error || 'Please fix the errors before continuing');
      return;
    }
    setStepErrors({ ...stepErrors, [currentStep]: null });
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
      setStepErrors({ ...stepErrors, [STEPS[prevIndex].id]: null });
    }
  };

  const handleFinish = async () => {
    const validation = validateStep(currentStep, formData);
    if (!validation.valid) {
      setStepErrors({ ...stepErrors, [currentStep]: validation.error });
      toast.error(validation.error || 'Please fix the errors before submitting');
      return;
    }
    try {
      await updateDiagnosis.mutateAsync({
        patientId: parseInt(patientId),
        data: formData as any,
      });
      toast.success('Diagnosis updated successfully');
      router.push(`/patients/${patientId}`);
    } catch (error: any) {
      console.error('Failed to update diagnosis:', error);
      toast.error(error?.message || 'Failed to update diagnosis. Please try again.');
    }
  };

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
            <CardDescription>{STEPS[currentStepIndex].description}</CardDescription>
            <FormProgress
              currentStep={currentStepIndex + 1}
              totalSteps={4}
              stepNames={['Basic', 'Pathology', 'Reports', 'Treatment']}
              className="mt-4"
            />
          </CardHeader>
          <CardContent className="space-y-6">
            {stepErrors[currentStep] && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {stepErrors[currentStep]}
              </div>
            )}

            {currentStep === 'basic' && (
              <BasicStep formData={formData} onChange={setFormData} error={stepErrors.basic} />
            )}

            {currentStep === 'pathology' && (
              <PathologyStep formData={formData} onChange={setFormData} error={stepErrors.pathology} />
            )}

            {currentStep === 'reports' && (
              <ReportsUploadStep formData={formData} onChange={setFormData} error={stepErrors.reports} patientId={patientId} />
            )}

            {currentStep === 'treatment' && (
              <TreatmentStep formData={formData} onChange={setFormData} error={stepErrors.treatment} />
            )}

            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStepIndex === 0}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentStepIndex === STEPS.length - 1 ? (
                <Button onClick={handleFinish} disabled={updateDiagnosis.isPending}>
                  {updateDiagnosis.isPending ? (
                    <><LoadingSpinner /> Saving...</>
                  ) : (
                    <><Check className="mr-2 h-4 w-4" /> Save Changes</>
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
