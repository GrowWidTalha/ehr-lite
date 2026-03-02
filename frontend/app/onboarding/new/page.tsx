// Patient Onboarding Wizard - Complete new patient flow
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { FormProgress } from '@/components/shared/form-progress';
import { toast } from 'sonner';
import { useCreatePatient } from '@/hooks/use-patients';
import { useCreateVitals } from '@/hooks/use-vitals';
import { useUpdateHistory } from '@/hooks/use-history';
import { useUpdateHabits } from '@/hooks/use-habits';
import { useCreateDiagnosis } from '@/hooks/use-diagnosis';
import { useUploadReport } from '@/hooks/use-reports';

import { BasicInfoStep } from '@/components/onboarding/steps/basic-info-step';
import { HistoryStep } from '@/components/onboarding/steps/history-step';
import { HabitsStep } from '@/components/onboarding/steps/habits-step';
import { VitalsStep } from '@/components/onboarding/steps/vitals-step';
import { ReportsStep } from '@/components/onboarding/steps/reports-step';
import { DiagnosisWizardStep } from '@/components/onboarding/steps/diagnosis-wizard-step';

type OnboardingStep = 'basic' | 'history' | 'habits' | 'vitals' | 'reports' | 'diagnosis' | 'complete';

const STEPS: { id: OnboardingStep; title: string; description: string }[] = [
  { id: 'basic', title: 'Basic Info', description: 'Patient demographics and contact' },
  { id: 'history', title: 'Medical History', description: 'Comorbidities and family history' },
  { id: 'habits', title: 'Habits', description: 'Smoking, tobacco, alcohol use' },
  { id: 'vitals', title: 'Vitals', description: 'Physical measurements' },
  { id: 'reports', title: 'Reports', description: 'Upload reports and images' },
  { id: 'diagnosis', title: 'Diagnosis', description: 'Complete cancer diagnosis details' },
  { id: 'complete', title: 'Complete', description: 'Patient onboarding finished' },
];

export default function NewPatientOnboardingPage() {
  const router = useRouter();
  const createPatient = useCreatePatient();
  const createVitals = useCreateVitals();
  const createHistory = useUpdateHistory();
  const updateHabits = useUpdateHabits();
  const createDiagnosis = useCreateDiagnosis();
  const uploadReport = useUploadReport();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('basic');
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([]);
  const [stepErrors, setStepErrors] = useState<Record<OnboardingStep, string | null>>({
    basic: null,
    history: null,
    habits: null,
    vitals: null,
    diagnosis: null,
    reports: null,
    complete: null,
  });

  const [patientId, setPatientId] = useState<string | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    // Basic Info
    full_name: '',
    age: '',
    sex: '',
    phone: '',
    cnic: '',
    registration_number: '',
    registration_date: new Date().toISOString().split('T')[0],
    marital_status: '',
    education: '',
    language: '',
    territory: '',
    children_count: '',
    sibling_count: '',

    // Medical History
    presenting_complaint: '',
    comorbidities: '',
    family_cancer_history: '',

    // Habits
    smoking_status: '',
    smoking_quantity: '',
    pan_use: '',
    pan_quantity: '',
    gutka_use: '',
    gutka_quantity: '',
    naswar_use: '',
    naswar_quantity: '',
    alcohol_use: '',
    alcohol_quantity: '',
    other_habits: '',
    quit_period: '',

    // Vitals
    height_cm: '',
    weight_kg: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    blood_group: '',

    // Reports - using the full report structure
    reports: [] as Array<{ title: string; type: string; notes: string; report_date: string; image: File | null }>,

    // Diagnosis - full structure from wizard
    diagnosis: {
      cancer_type: '',
      stage: '',
      grade: '',
      who_classification: '',
      diagnosis_date: '',
      tumor_size: '',
      depth: '',
      margins: '',
      lvi: '',
      pni: '',
      nodes_recovered: '',
      nodes_involved: '',
      er_status: '',
      er_percentage: '',
      pr_status: '',
      pr_percentage: '',
      her2_status: '',
      ki67_percentage: '',
      study_type: '',
      study_date: '',
      findings: '',
      indication: '',
      plan_type: '',
      surgery_planned: '',
      neoadjuvant_chemo: '',
    },
  });

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  // Validation for each step
  const validateStep = (step: OnboardingStep): { valid: boolean; error: string | null } => {
    switch (step) {
      case 'basic':
        if (!formData.full_name?.trim()) {
          return { valid: false, error: 'Patient name is required' };
        }
        break;
      case 'history':
      case 'habits':
      case 'vitals':
      case 'diagnosis':
        // These are optional in onboarding
        break;
      case 'reports':
        // Reports are optional
        break;
      default:
        break;
    }
    return { valid: true, error: null };
  };

  const handleNext = async () => {
    // Validate current step
    const validation = validateStep(currentStep);
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

    // Save patient data on first step completion
    if (currentStep === 'basic' && !patientId) {
      await savePatient();
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
      setStepErrors({ ...stepErrors, [STEPS[prevIndex].id]: null });
    }
  };

  const savePatient = async () => {
    try {
      const patientData = {
        full_name: formData.full_name,
        age: formData.age ? parseInt(formData.age) : undefined,
        sex: formData.sex as 'Male' | 'Female' | 'Other',
        phone: formData.phone,
        cnic: formData.cnic,
        registration_number: formData.registration_number || undefined,
        registration_date: formData.registration_date,
        marital_status: formData.marital_status,
        education: formData.education,
        language: formData.language,
        territory: formData.territory,
        children_count: formData.children_count ? parseInt(formData.children_count) : 0,
        sibling_count: formData.sibling_count ? parseInt(formData.sibling_count) : 0,
      };

      const result = await createPatient.mutateAsync(patientData);
      setPatientId(result.id);
      toast.success('Patient created successfully');
    } catch (error: any) {
      console.error('Failed to create patient:', error);
      throw error;
    }
  };

  const handleFinish = async () => {
    if (!patientId) {
      toast.error('Patient not created. Please try again.');
      return;
    }

    try {
      // Save all remaining data
      await saveAllData();

      setCurrentStep('complete');
      toast.success('Patient onboarding completed successfully!');
    } catch (error: any) {
      console.error('Failed to complete onboarding:', error);
      toast.error(error?.message || 'Failed to save some data. Please try again.');
    }
  };

  const saveAllData = async () => {
    if (!patientId) return;

    const promises: Promise<any>[] = [];

    // Save history if has data
    if (formData.presenting_complaint || formData.comorbidities || formData.family_cancer_history) {
      promises.push(
        createHistory.mutateAsync({
          patientId,
          data: {
            presenting_complaint: formData.presenting_complaint,
            comorbidities: formData.comorbidities,
            family_cancer_history: formData.family_cancer_history,
          },
        })
      );
    }

    // Save habits if has data
    if (formData.smoking_status || formData.pan_use || formData.gutka_use || formData.naswar_use || formData.alcohol_use) {
      promises.push(
        updateHabits.mutateAsync({
          patientId,
          data: {
            smoking_status: (formData.smoking_status as any) || undefined,
            smoking_quantity: formData.smoking_quantity,
            pan_use: (formData.pan_use as any) || undefined,
            pan_quantity: formData.pan_quantity,
            gutka_use: (formData.gutka_use as any) || undefined,
            gutka_quantity: formData.gutka_quantity,
            naswar_use: (formData.naswar_use as any) || undefined,
            naswar_quantity: formData.naswar_quantity,
            alcohol_use: (formData.alcohol_use as any) || undefined,
            alcohol_quantity: formData.alcohol_quantity,
            other_habits: formData.other_habits,
            quit_period: formData.quit_period,
          },
        })
      );
    }

    // Save vitals if has data
    if (formData.height_cm || formData.weight_kg || formData.blood_group) {
      promises.push(
        createVitals.mutateAsync({
          patientId,
          data: {
            height_cm: formData.height_cm ? parseFloat(formData.height_cm) : undefined,
            weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : undefined,
            blood_group: formData.blood_group as any,
          },
        })
      );
    }

    // Save diagnosis if has data
    if (formData.diagnosis.cancer_type) {
      promises.push(
        createDiagnosis.mutateAsync({
          patientId,
          data: {
            cancer_type: formData.diagnosis.cancer_type,
            stage: formData.diagnosis.stage as any,
            grade: formData.diagnosis.grade as any,
            who_classification: formData.diagnosis.who_classification,
            diagnosis_date: formData.diagnosis.diagnosis_date,
            tumor_size: formData.diagnosis.tumor_size,
            depth: formData.diagnosis.depth,
            margins: formData.diagnosis.margins,
            lvi: formData.diagnosis.lvi,
            pni: formData.diagnosis.pni,
            nodes_recovered: formData.diagnosis.nodes_recovered,
            nodes_involved: formData.diagnosis.nodes_involved,
            er_status: formData.diagnosis.er_status,
            er_percentage: formData.diagnosis.er_percentage,
            pr_status: formData.diagnosis.pr_status,
            pr_percentage: formData.diagnosis.pr_percentage,
            her2_status: formData.diagnosis.her2_status,
            ki67_percentage: formData.diagnosis.ki67_percentage,
            study_type: formData.diagnosis.study_type,
            study_date: formData.diagnosis.study_date,
            findings: formData.diagnosis.findings,
            indication: formData.diagnosis.indication,
            plan_type: formData.diagnosis.plan_type,
            surgery_planned: formData.diagnosis.surgery_planned,
            neoadjuvant_chemo: formData.diagnosis.neoadjuvant_chemo,
          },
        })
      );
    }

    // Save reports (one image per report entry)
    for (const report of formData.reports) {
      if (report.title && report.image) {
        const reportFormData = new FormData();
        reportFormData.append('title', report.title);
        reportFormData.append('report_type', report.type);
        if (report.notes) reportFormData.append('notes', report.notes);
        if (report.report_date) reportFormData.append('report_date', report.report_date);
        reportFormData.append('images', report.image, report.image.name || 'report.jpg');
        promises.push(uploadReport.mutateAsync({ patientId, formData: reportFormData }));
      }
    }

    await Promise.allSettled(promises);
  };

  const goToPatient = () => {
    if (patientId) {
      router.push(`/patients/${patientId}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={currentStep === 'complete' ? goToPatient : () => router.push('/')}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentStep === 'complete' ? 'Go to Patient' : 'Back to Home'}
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStepIndex].title}</CardTitle>
            <CardDescription>{STEPS[currentStepIndex].description}</CardDescription>
            {currentStep !== 'complete' && (
              <FormProgress
                currentStep={currentStepIndex + 1}
                totalSteps={6}
                stepNames={['Basic Info', 'Medical History', 'Habits', 'Vitals', 'Reports', 'Diagnosis']}
                className="mt-4"
              />
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error message */}
            {stepErrors[currentStep] && currentStep !== 'complete' && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {stepErrors[currentStep]}
              </div>
            )}

            {/* Step content */}
            {currentStep === 'basic' && (
              <BasicInfoStep
                formData={formData}
                onChange={setFormData}
                error={stepErrors.basic}
              />
            )}

            {currentStep === 'history' && (
              <HistoryStep
                formData={formData}
                onChange={setFormData}
                error={stepErrors.history}
              />
            )}

            {currentStep === 'habits' && (
              <HabitsStep
                formData={formData}
                onChange={setFormData}
                error={stepErrors.habits}
              />
            )}

            {currentStep === 'vitals' && (
              <VitalsStep
                formData={formData}
                onChange={setFormData}
                error={stepErrors.vitals}
              />
            )}

            {currentStep === 'reports' && (
              <ReportsStep
                formData={formData}
                onChange={setFormData}
                error={stepErrors.reports}
              />
            )}

            {currentStep === 'diagnosis' && (
              <DiagnosisWizardStep
                formData={formData}
                onChange={setFormData}
                error={stepErrors.diagnosis}
              />
            )}

            {currentStep === 'complete' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Patient Onboarding Complete!</h3>
                <p className="text-muted-foreground mb-6">
                  {formData.full_name} has been successfully added to the system.
                </p>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={() => router.push('/onboarding/new')}>
                    Add Another Patient
                  </Button>
                  <Button onClick={goToPatient}>
                    View Patient Profile
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            {currentStep !== 'complete' && (
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStepIndex === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                {currentStep === 'diagnosis' ? (
                  <Button
                    onClick={handleFinish}
                    disabled={createPatient.isPending}
                  >
                    {createPatient.isPending ? (
                      <>
                        <LoadingSpinner />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Complete Onboarding
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={createPatient.isPending}
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
