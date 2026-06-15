// Patient Onboarding Wizard - Complete new patient flow
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Stethoscope,
} from "lucide-react";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { FormProgress } from "@/components/shared/form-progress";
import { toast } from "sonner";
import { useCreatePatient } from "@/hooks/use-patients";
import { useUpdateHistory } from "@/hooks/use-history";
import { useUpdateHabits } from "@/hooks/use-habits";
import { useUpdatePastRecords } from "@/hooks/use-past-records";
import {
  useCreatePastSurgery,
  useUploadSurgeryImages,
} from "@/hooks/use-past-surgeries";

import { BasicInfoStep } from "@/components/onboarding/steps/basic-info-step";
import { HabitsStep } from "@/components/onboarding/steps/habits-step";
import { PastRecordsStep } from "@/components/onboarding/steps/past-records-step";
import { PastSurgeriesStep } from "@/components/onboarding/steps/past-surgeries-step";

type OnboardingStep =
  | "basic"
  | "habits"
  | "pastRecords"
  | "pastSurgeries"
  | "complete";

const STEPS: { id: OnboardingStep; title: string; description: string }[] = [
  {
    id: "basic",
    title: "Basic Info",
    description: "Patient demographics and medical history",
  },
  {
    id: "habits",
    title: "Habits",
    description: "Smoking, tobacco, alcohol use",
  },
  {
    id: "pastRecords",
    title: "Past Records",
    description: "Previous treatments and therapies",
  },
  {
    id: "pastSurgeries",
    title: "Past Surgeries",
    description: "Previous surgical procedures",
  },
  {
    id: "complete",
    title: "Complete",
    description: "Patient onboarding finished",
  },
];

export default function NewPatientOnboardingPage() {
  const router = useRouter();
  const createPatient = useCreatePatient();
  const createHistory = useUpdateHistory();
  const updateHabits = useUpdateHabits();
  const updatePastRecords = useUpdatePastRecords();
  const createSurgery = useCreatePastSurgery();
  const uploadSurgeryImages = useUploadSurgeryImages();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>("basic");
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([]);
  const [stepErrors, setStepErrors] = useState<
    Record<OnboardingStep, string | null>
  >({
    basic: null,
    habits: null,
    pastRecords: null,
    pastSurgeries: null,
    complete: null,
  } as Record<OnboardingStep, string | null>);

  const [patientId, setPatientId] = useState<number | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Basic Info - Name components
    FirstName: "",
    Relation: "",
    RelativeName: "",
    Surname: "",
    PatientName: "",

    // Registration
    Age: "",
    Gender: "",
    ContactNo: "",
    CNICNo: "",
    RegistrationNo: "",
    RegistrationDate: new Date().toISOString().split("T")[0],
    MaritalStatus: "",
    Qualifications: undefined,
    Occupation: undefined,
    MotherTongue: undefined,
    PlaceOfBirth: undefined,
    PlaceOfBirthDistrict: undefined,
    NoOfChidren: "",
    NoOfSibling: "",
    Address: "",

    // Medical History (now in basic step)
    PresentingComplaint: "",
    ComorbiditiesList: [] as string[],
    Comorbidities: "",
    FamilyCancerHistory: "",

    // Vitals (now in basic step)
    height_cm: "",
    weight_kg: "",
    blood_group: "",

    // Past Records
    PreviousChemo: "",
    PreviousRT: "",
    PreviousTargeted: "",
    PreviousHT: "",
    PreviousIT: "",

    // Past Surgeries
    Surgeries: [] as Array<{
      id: string;
      description: string;
      isCancerSurgery: boolean;
      imageUrls: string[]; // blob: URLs for preview only — never sent to backend
      imageFiles: File[]; // actual File objects — sent to backend
      surgeryDate: string;
      notes: string;
      hospitalName: string;
      surgeonName: string;
    }>,

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
  });

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  // Validation for each step
  const validateStep = (
    step: OnboardingStep,
  ): { valid: boolean; error: string | null } => {
    switch (step) {
      case "basic":
        if (!formData.FirstName?.trim()) {
          return { valid: false, error: "Patient name is required" };
        }
        break;
      case "habits":
      case "pastRecords":
      case "pastSurgeries":
        // These are optional in onboarding
        break;
      default:
        break;
    }
    return { valid: true, error: null };
  };

  const handleNext = async () => {
    const validation = validateStep(currentStep);
    if (!validation.valid) {
      setStepErrors({ ...stepErrors, [currentStep]: validation.error });
      toast.error(
        validation.error || "Please fix the errors before continuing",
      );
      return;
    }

    setStepErrors({ ...stepErrors, [currentStep]: null });

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    // Save patient data on first step completion
    if (currentStep === "basic" && !patientId) {
      await savePatient();
    }

    // FIX: pastSurgeries step now uses handleFinish (Complete Onboarding button),
    // NOT handleNext — so we no longer call savePastRecordsAndSurgeries() here.
    // This prevents the double-save that was happening before.

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
      console.log("=== Creating patient ===");

      const comorbiditiesString = (formData.ComorbiditiesList || []).join(", ");

      const patientData = {
        PatientName:
          formData.PatientName ||
          `${formData.FirstName} ${formData.Relation} ${formData.RelativeName} ${formData.Surname}`.trim(),
        Age: formData.Age ? parseInt(formData.Age) : undefined,
        Gender: formData.Gender as "Male" | "Female" | "Other",
        ContactNo: formData.ContactNo,
        CNICNo: formData.CNICNo,
        RegistrationNo: formData.RegistrationNo || undefined,
        RegistrationDate: formData.RegistrationDate,
        MaritalStatus: formData.MaritalStatus,
        Qualifications: formData.Qualifications
          ? parseInt(formData.Qualifications)
          : undefined,
        Occupation: formData.Occupation
          ? parseInt(formData.Occupation)
          : undefined,
        MotherTongue: formData.MotherTongue
          ? parseInt(formData.MotherTongue)
          : undefined,
        PlaceOfBirth: formData.PlaceOfBirth
          ? parseInt(formData.PlaceOfBirth)
          : undefined,
        NoOfChidren: formData.NoOfChidren ? parseInt(formData.NoOfChidren) : 0,
        NoOfSibling: formData.NoOfSibling ? parseInt(formData.NoOfSibling) : 0,
        PresentAddress: formData.Address,
        Height: formData.height_cm ? parseFloat(formData.height_cm) : undefined,
        Weight: formData.weight_kg ? parseFloat(formData.weight_kg) : undefined,
        BloodGroup: formData.blood_group
          ? ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].indexOf(
              formData.blood_group,
            ) + 1 || undefined
          : undefined,
      };

      console.log("Patient data:", patientData);
      const result = await createPatient.mutateAsync(patientData);
      console.log("Patient created successfully:", result);
      setPatientId(result.PatientID);

      await saveHistory(result.PatientID, comorbiditiesString);

      toast.success("Patient created successfully");
    } catch (error: any) {
      console.error("Failed to create patient:", error);
      toast.error(
        `Failed to create patient: ${error?.message || "Unknown error"}`,
      );
      throw error;
    }
  };

  const saveHistory = async (pid: number, comorbiditiesString: string) => {
    if (
      formData.PresentingComplaint ||
      comorbiditiesString ||
      formData.FamilyCancerHistory
    ) {
      try {
        console.log("Saving history for patient:", pid);
        await createHistory.mutateAsync({
          patientId: pid,
          data: {
            PresentingComplaint: formData.PresentingComplaint,
            Comorbidities: comorbiditiesString,
            FamilyCancerHistory: formData.FamilyCancerHistory,
          },
        });
        console.log("History saved successfully");
      } catch (error: any) {
        console.error("Failed to save history:", error);
        toast.warning(
          `Failed to save medical history: ${error?.message || "Unknown error"}`,
        );
        // Don't throw — patient creation is more important
      }
    }
  };

  const savePastRecordsAndSurgeries = async () => {
    if (!patientId) throw new Error("Patient ID is required");

    console.log("=== Starting savePastRecordsAndSurgeries ===");
    console.log("Patient ID:", patientId);

    // ── Past records ──────────────────────────────────────────────────────────
    const hasPastRecords =
      formData.PreviousChemo ||
      formData.PreviousRT ||
      formData.PreviousTargeted ||
      formData.PreviousHT ||
      formData.PreviousIT;

    if (hasPastRecords) {
      console.log("Saving past records...");
      const result = await updatePastRecords.mutateAsync({
        patientId,
        data: {
          PreviousChemo: formData.PreviousChemo || undefined,
          PreviousRT: formData.PreviousRT || undefined,
          PreviousTargeted: formData.PreviousTargeted || undefined,
          PreviousHT: formData.PreviousHT || undefined,
          PreviousIT: formData.PreviousIT || undefined,
        },
      });
      console.log("Past records saved successfully:", result);
    } else {
      console.log("No past records to save");
    }

    // ── Surgeries ─────────────────────────────────────────────────────────────
    const surgeries = formData.Surgeries || [];
    console.log("Processing surgeries:", surgeries.length);

    for (const surgery of surgeries) {
      // Skip completely empty surgery entries
      if (!surgery.description?.trim() && surgery.imageFiles.length === 0) {
        console.log("Skipping empty surgery entry");
        continue;
      }

      const surgeryData = {
        SurgeryDate: surgery.surgeryDate || undefined,
        Description: surgery.description || "",
        IsCancerSurgery: surgery.isCancerSurgery ? 1 : 0,
        Notes: surgery.notes || undefined,
        HospitalName: surgery.hospitalName || undefined,
        SurgeonName: surgery.surgeonName || undefined,
      };

      console.log("Saving surgery:", surgeryData);
      const result = await createSurgery.mutateAsync({
        patientId,
        data: surgeryData,
      });
      console.log("Surgery saved successfully:", result);

      // ── Extract RowID ─────────────────────────────────────────────────────
      // The api() wrapper returns { success: boolean, data: PastSurgery }.
      // RowID lives at result.data.RowID — NOT result.RowID directly.
      const surgeryRowId: number | undefined =
        (result as any)?.data?.RowID ?? (result as any)?.RowID ?? undefined;

      console.log("Extracted surgeryRowId:", surgeryRowId);

      // ── Image upload ──────────────────────────────────────────────────────
      const filesToUpload: File[] = surgery.imageFiles || [];

      console.log(
        `imageFiles count: ${filesToUpload.length}, imageUrls count: ${surgery.imageUrls?.length ?? 0}`,
      );

      if (filesToUpload.length > 0 && surgeryRowId) {
        try {
          console.log(
            `Uploading ${filesToUpload.length} image(s) for surgery RowID:`,
            surgeryRowId,
          );
          await uploadSurgeryImages.mutateAsync({
            surgeryId: surgeryRowId,
            files: filesToUpload,
            patientId,
          });
          console.log("Images uploaded successfully");
        } catch (imgError: any) {
          console.error("Failed to upload surgery images:", imgError);
          toast.warning(
            `Surgery saved but image upload failed: ${imgError?.message || "Unknown error"}`,
          );
        }
      } else if (filesToUpload.length > 0 && !surgeryRowId) {
        console.error(
          "Cannot upload images — surgeryRowId is undefined. Full result:",
          result,
        );
      } else if (
        filesToUpload.length === 0 &&
        (surgery.imageUrls?.length ?? 0) > 0
      ) {
        console.warn(
          "imageUrls has entries but imageFiles is empty — File objects were lost before reaching page.tsx.",
          "Check PastSurgeriesStep: capturePhoto and handleFileSelect must both populate imageFiles.",
        );
      }
    }

    console.log("=== savePastRecordsAndSurgeries completed successfully ===");
  };

  const handleFinish = async () => {
    if (!patientId) {
      toast.error("Patient not created. Please try again.");
      return;
    }

    setIsCompleting(true);

    try {
      console.log("Saving past records and surgeries...");
      await savePastRecordsAndSurgeries();

      console.log("Saving habits...");
      await saveHabits();

      setCurrentStep("complete");
      toast.success("Patient onboarding completed successfully!");
    } catch (error: any) {
      console.error("Failed to complete onboarding:", error);
      toast.error(
        error?.message || "Failed to save some data. Please try again.",
      );
    } finally {
      setIsCompleting(false);
    }
  };

  const saveHabits = async () => {
    if (!patientId) throw new Error("Patient ID is required");

    if (formData.habits && formData.habits.length > 0) {
      await updateHabits.mutateAsync({
        patientId,
        data: { habits: formData.habits },
      });
    }
  };

  const goToPatient = () => {
    if (patientId) {
      router.push(`/patients/${patientId}`);
    } else {
      router.push("/");
    }
  };

  // Mock data helpers
  const fillMockBasicInfo = () => {
    setFormData({
      ...formData,
      FirstName: "John",
      Relation: "S/O",
      RelativeName: "Akbar Ali",
      Surname: "Khan",
      PatientName: "John S/O Akbar Ali Khan",
      Age: "45",
      Gender: "Male",
      ContactNo: "0300-00000000",
      CNICNo: "00000-0000000-0",
      RegistrationNo: "REG-2024-001",
      RegistrationDate: new Date().toISOString().split("T")[0],
      MaritalStatus: "Married",
      NoOfChidren: "2",
      NoOfSibling: "3",
      Address: "House 123, Street 4, Gulberg, Lahore",
      PresentingComplaint:
        "Patient presents with persistent cough and weight loss.",
      ComorbiditiesList: ["Diabetes Mellitus (DM)", "Hypertension (HTN)"],
      FamilyCancerHistory: "Father had lung cancer at age 65.",
      height_cm: "175",
      weight_kg: "72",
      blood_group: "A+",
    });
    toast.success("Basic info mock data filled!");
  };

  const fillMockHabits = () => {
    setFormData({
      ...formData,
      habits: [
        {
          addiction_id: 1,
          name: "Smoking",
          has_habit: true,
          quantity: "10 cigarettes",
          frequency: "per day",
          quit: false,
          quit_period: "",
        },
        {
          addiction_id: 4,
          name: "Alcohol",
          has_habit: true,
          quantity: "2-3 drinks",
          frequency: "per week",
          quit: false,
          quit_period: "",
        },
        {
          addiction_id: 2,
          name: "Gutka",
          has_habit: false,
          quantity: "",
          frequency: "per day",
          quit: false,
          quit_period: "",
        },
      ],
    });
    toast.success("Habits mock data filled!");
  };

  const fillMockPastRecords = () => {
    setFormData({
      ...formData,
      PreviousChemo: "Cisplatin + Etoposide - 4 cycles completed in 2023",
      PreviousRT: "Radiation to chest - 50 Gy completed in 2022",
      PreviousTargeted: "Gefitinib - 6 months, stopped due to side effects",
      PreviousHT: "Tamoxifen - 2 years for breast cancer",
      PreviousIT: "Pembrolizumab - 3 cycles, ongoing",
    });
    toast.success("Past records mock data filled!");
  };

  const fillMockPastSurgeries = () => {
    setFormData({
      ...formData,
      Surgeries: [
        {
          id: crypto.randomUUID(),
          description:
            "Lumpectomy with axillary node dissection - March 2022 at JPMC",
          isCancerSurgery: true,
          imageUrls: [],
          imageFiles: [],
          surgeryDate: "2022-03-15",
          notes: "Successful procedure with clear margins",
          hospitalName: "JPMC",
          surgeonName: "Dr. Ahmed",
        },
        {
          id: crypto.randomUUID(),
          description: "Appendectomy - 2015",
          isCancerSurgery: false,
          imageUrls: [],
          imageFiles: [],
          surgeryDate: "2015-08-20",
          notes: "Routine appendectomy",
          hospitalName: "City Hospital",
          surgeonName: "Dr. Khan",
        },
      ],
    });
    toast.success("Past surgeries mock data filled!");
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={
              currentStep === "complete" ? goToPatient : () => router.push("/")
            }
            className="inline-flex items-center text-sm text-muted-foreground hover:text-[var(--color-blue)] transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentStep === "complete" ? "Go to Patient" : "Back to Home"}
          </button>
        </div>

        <Card className="transition-all duration-200 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-[var(--color-blue)]">{STEPS[currentStepIndex].title}</CardTitle>
            <CardDescription>
              {STEPS[currentStepIndex].description}
            </CardDescription>
            {currentStep !== "complete" && (
              <FormProgress
                currentStep={currentStepIndex + 1}
                totalSteps={4}
                stepNames={[
                  "Basic Info",
                  "Habits",
                  "Past Records",
                  "Past Surgeries",
                ]}
                className="mt-4"
              />
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {stepErrors[currentStep] && currentStep !== "complete" && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">
                {stepErrors[currentStep]}
              </div>
            )}

            {currentStep === "basic" && (
              <BasicInfoStep
                formData={formData}
                onChange={setFormData}
                error={stepErrors.basic}
              />
            )}
            {currentStep === "habits" && (
              <HabitsStep
                formData={formData}
                onChange={setFormData}
                error={stepErrors.habits}
              />
            )}
            {currentStep === "pastRecords" && (
              <PastRecordsStep
                formData={formData}
                onChange={setFormData}
                error={stepErrors.pastRecords}
              />
            )}
            {currentStep === "pastSurgeries" && (
              <PastSurgeriesStep
                formData={formData}
                onChange={setFormData}
                error={stepErrors.pastSurgeries}
              />
            )}

            {currentStep === "complete" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[var(--color-green)]/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[var(--color-green)]/20">
                  <Check className="h-8 w-8 text-[var(--color-green)]" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[var(--color-green)]">
                  Patient Onboarding Complete!
                </h3>
                <p className="text-muted-foreground mb-6">
                  {formData.PatientName} has been successfully added to the
                  system.
                </p>
                <div className="flex justify-center gap-3 mb-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/onboarding/new")}
                    className="hover:bg-[var(--color-blue-light)] hover:text-[var(--color-blue)] hover:border-[var(--color-blue)] transition-colors"
                  >
                    Add Another Patient
                  </Button>
                  <Button onClick={goToPatient} className="bg-[var(--color-green)] hover:bg-[var(--color-green)]/90">View Patient Profile</Button>
                </div>
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    You can also add additional information:
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        router.push(`/patients/${patientId}/diagnoses/new`)
                      }
                      className="hover:bg-[var(--color-orange)] hover:text-white transition-colors"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Upload Reports
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        router.push(`/patients/${patientId}/diagnoses/new`)
                      }
                      className="hover:bg-[var(--color-purple)] hover:text-white transition-colors"
                    >
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Add Diagnosis
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {currentStep !== "complete" && (
              <div className="flex justify-between items-center pt-6 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStepIndex === 0}
                    className="hover:bg-[var(--color-blue-light)] hover:text-[var(--color-blue)] hover:border-[var(--color-blue)] transition-colors"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  {currentStep === "basic" && (
                    <Button
                      variant="secondary"
                      onClick={fillMockBasicInfo}
                      type="button"
                      className="hover:bg-[var(--color-purple)] hover:text-white transition-colors"
                    >
                      🎲 Fill Mock Data
                    </Button>
                  )}
                  {currentStep === "habits" && (
                    <Button
                      variant="secondary"
                      onClick={fillMockHabits}
                      type="button"
                      className="hover:bg-[var(--color-purple)] hover:text-white transition-colors"
                    >
                      🎲 Fill Mock Data
                    </Button>
                  )}
                  {currentStep === "pastRecords" && (
                    <Button
                      variant="secondary"
                      onClick={fillMockPastRecords}
                      type="button"
                      className="hover:bg-[var(--color-purple)] hover:text-white transition-colors"
                    >
                      🎲 Fill Mock Data
                    </Button>
                  )}
                  {currentStep === "pastSurgeries" && (
                    <Button
                      variant="secondary"
                      onClick={fillMockPastSurgeries}
                      type="button"
                      className="hover:bg-[var(--color-purple)] hover:text-white transition-colors"
                    >
                      🎲 Fill Mock Data
                    </Button>
                  )}
                </div>

                {currentStep === "pastSurgeries" ? (
                  <Button
                    onClick={handleFinish}
                    disabled={createPatient.isPending || isCompleting}
                    className="bg-[var(--color-green)] hover:bg-[var(--color-green)]/90"
                  >
                    {isCompleting ? (
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
                    className="bg-[var(--color-blue)] hover:bg-[var(--color-blue)]/90"
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
