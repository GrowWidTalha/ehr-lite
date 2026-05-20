// Patient Onboarding Wizard - Complete new patient flow
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, FileText, Stethoscope } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { FormProgress } from '@/components/shared/form-progress';
import { toast } from 'sonner';
import { useCreatePatient } from '@/hooks/use-patients';
import { useCreateVitals } from '@/hooks/use-vitals';
import { useUpdateHistory } from '@/hooks/use-history';
import { useUpdateHabits } from '@/hooks/use-habits';

import { BasicInfoStep } from '@/components/onboarding/steps/basic-info-step';
import { HistoryStep } from '@/components/onboarding/steps/history-step';
import { HabitsStep } from '@/components/onboarding/steps/habits-step';
import { VitalsStep } from '@/components/onboarding/steps/vitals-step';

type OnboardingStep = 'basic' | 'history' | 'habits' | 'vitals' | 'complete';

const STEPS: { id: OnboardingStep; title: string; description: string }[] = [
  { id: 'basic', title: 'Basic Info', description: 'Patient demographics and contact' },
  { id: 'history', title: 'Medical History', description: 'Comorbidities and family history' },
  { id: 'habits', title: 'Habits', description: 'Smoking, tobacco, alcohol use' },
  { id: 'vitals', title: 'Vitals', description: 'Physical measurements' },
  { id: 'complete', title: 'Complete', description: 'Patient onboarding finished' },
];

export default function NewPatientOnboardingPage() {
  const router = useRouter();
  const createPatient = useCreatePatient();
  const createVitals = useCreateVitals();
  const createHistory = useUpdateHistory();
  const updateHabits = useUpdateHabits();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('basic');
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([]);
  const [stepErrors, setStepErrors] = useState<Record<OnboardingStep, string | null>>({
    basic: null,
    history: null,
    habits: null,
    vitals: null,
    complete: null,
  });

  const [patientId, setPatientId] = useState<number | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    // Basic Info
    PatientName: '',
    Age: '',
    Gender: '',
    ContactNo: '',
    CNICNo: '',
    RegistrationNo: '',
    RegistrationDate: new Date().toISOString().split('T')[0],
    MaritalStatus: '',
    Qualifications: undefined,
    Occupation: undefined,
    MotherTongue: undefined,
    PlaceOfBirth: undefined,
    NoOfChidren: '',
    NoOfSibling: '',

    // Medical History
    PresentingComplaint: '',
    Comorbidities: '',
    FamilyCancerHistory: '',

    // Habits - new array structure
    habits: [] as Array<{
      addiction_id: number;
      name: string;
      has_habit: boolean;
      quantity: string;
      frequency: string;
      quit: boolean;
      quit_period: string;
    }>,

    // Vitals
    height_cm: '',
    weight_kg: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    blood_group: '',
  });

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  // Validation for each step
  const validateStep = (step: OnboardingStep): { valid: boolean; error: string | null } => {
    switch (step) {
      case 'basic':
        if (!formData.PatientName?.trim()) {
          return { valid: false, error: 'Patient name is required' };
        }
        break;
      case 'history':
      case 'habits':
      case 'vitals':
        // These are optional in onboarding
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
        PatientName: formData.PatientName,
        Age: formData.Age ? parseInt(formData.Age) : undefined,
        Gender: formData.Gender as 'Male' | 'Female' | 'Other',
        ContactNo: formData.ContactNo,
        CNICNo: formData.CNICNo,
        RegistrationNo: formData.RegistrationNo || undefined,
        RegistrationDate: formData.RegistrationDate,
        MaritalStatus: formData.MaritalStatus,
        Qualifications: formData.Qualifications ? parseInt(formData.Qualifications) : undefined,
        Occupation: formData.Occupation ? parseInt(formData.Occupation) : undefined,
        MotherTongue: formData.MotherTongue ? parseInt(formData.MotherTongue) : undefined,
        PlaceOfBirth: formData.PlaceOfBirth ? parseInt(formData.PlaceOfBirth) : undefined,
        NoOfChidren: formData.NoOfChidren ? parseInt(formData.NoOfChidren) : 0,
        NoOfSibling: formData.NoOfSibling ? parseInt(formData.NoOfSibling) : 0,
      };

      const result = await createPatient.mutateAsync(patientData);
      setPatientId(result.PatientID);
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
    if (formData.PresentingComplaint || formData.Comorbidities || formData.FamilyCancerHistory) {
      promises.push(
        createHistory.mutateAsync({
          patientId,
          data: {
            PresentingComplaint: formData.PresentingComplaint,
            Comorbidities: formData.Comorbidities,
            FamilyCancerHistory: formData.FamilyCancerHistory,
          },
        })
      );
    }

    // Save habits if has data
    if (formData.habits && formData.habits.length > 0) {
      promises.push(
        updateHabits.mutateAsync({
          patientId,
          data: {
            habits: formData.habits,
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

    await Promise.allSettled(promises);
  };

  const goToPatient = () => {
    if (patientId) {
      router.push(`/patients/${patientId}`);
    } else {
      router.push('/');
    }
  };

  // Mock data functions for each step
  const fillMockBasicInfo = () => {
    setFormData({
      ...formData,
      PatientName: 'John Doe',
      Age: '45',
      Gender: 'Male',
      ContactNo: '03001234567',
      CNICNo: '12345-6789012-3',
      RegistrationNo: 'REG-2024-001',
      RegistrationDate: new Date().toISOString().split('T')[0],
      MaritalStatus: 'Married',
      NoOfChidren: '2',
      NoOfSibling: '3',
    });
    toast.success('Basic info mock data filled!');
  };

  const fillMockHistory = () => {
    setFormData({
      ...formData,
      PresentingComplaint: 'Patient presents with persistent cough and weight loss for the past 2 months. Also reports occasional shortness of breath and fatigue.',
      Comorbidities: 'Hypertension (controlled on medication), Type 2 Diabetes Mellitus (well-managed)',
      FamilyCancerHistory: 'Father had lung cancer at age 65. Mother had breast cancer at age 58. Maternal aunt had ovarian cancer.',
    });
    toast.success('History mock data filled!');
  };

  const fillMockHabits = () => {
    setFormData({
      ...formData,
      habits: [
        { addiction_id: 1, name: 'Smoking', has_habit: true, quantity: '10 cigarettes', frequency: 'per day', quit: false, quit_period: '' },
        { addiction_id: 4, name: 'Alcohol', has_habit: true, quantity: '2-3 drinks', frequency: 'per week', quit: false, quit_period: '' },
        { addiction_id: 2, name: 'Gutka', has_habit: false, quantity: '', frequency: 'per day', quit: false, quit_period: '' },
      ],
    });
    toast.success('Habits mock data filled!');
  };

  const fillMockVitals = () => {
    setFormData({
      ...formData,
      height_cm: '175',
      weight_kg: '72',
      blood_pressure_systolic: '130',
      blood_pressure_diastolic: '85',
      blood_group: 'A+',
    });
    toast.success('Vitals mock data filled!');
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
                totalSteps={4}
                stepNames={['Basic Info', 'Medical History', 'Habits', 'Vitals']}
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

            {currentStep === 'complete' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Patient Onboarding Complete!</h3>
                <p className="text-muted-foreground mb-6">
                  {formData.PatientName} has been successfully added to the system.
                </p>
                <div className="flex justify-center gap-3 mb-4">
                  <Button variant="outline" onClick={() => router.push('/onboarding/new')}>
                    Add Another Patient
                  </Button>
                  <Button onClick={goToPatient}>
                    View Patient Profile
                  </Button>
                </div>
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground mb-3">You can also add additional information:</p>
                  <div className="flex justify-center gap-3">
                    <Button variant="secondary" onClick={() => router.push(`/patients/${patientId}/reports/new`)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Upload Reports
                    </Button>
                    <Button variant="secondary" onClick={() => router.push(`/patients/${patientId}/diagnoses/new`)}>
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Add Diagnosis
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            {currentStep !== 'complete' && (
              <div className="flex justify-between items-center pt-6 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStepIndex === 0}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  {currentStep === 'basic' && (
                    <Button
                      variant="secondary"
                      onClick={fillMockBasicInfo}
                      type="button"
                    >
                      🎲 Fill Mock Data
                    </Button>
                  )}
                  {currentStep === 'history' && (
                    <Button
                      variant="secondary"
                      onClick={fillMockHistory}
                      type="button"
                    >
                      🎲 Fill Mock Data
                    </Button>
                  )}
                  {currentStep === 'habits' && (
                    <Button
                      variant="secondary"
                      onClick={fillMockHabits}
                      type="button"
                    >
                      🎲 Fill Mock Data
                    </Button>
                  )}
                  {currentStep === 'vitals' && (
                    <Button
                      variant="secondary"
                      onClick={fillMockVitals}
                      type="button"
                    >
                      🎲 Fill Mock Data
                    </Button>
                  )}
                </div>

                {currentStep === 'vitals' ? (
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
