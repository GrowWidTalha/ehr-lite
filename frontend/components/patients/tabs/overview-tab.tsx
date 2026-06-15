// Overview tab component - Complete patient details and medical history
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { User, Calendar, Phone, FileText, PenTool, Briefcase, Save, Loader2, Edit2, Users } from 'lucide-react';
import Link from 'next/link';
import type { Patient } from '@/lib/db.types';
import { formatDate } from '@/lib/utils';
import { useVitalsList } from '@/hooks/use-vitals';
import { usePatientHistory, useUpdateHistory } from '@/hooks/use-history';
import { VitalsForm } from '@/components/patients/vitals-form';
import { toast } from 'sonner';

interface OverviewTabProps {
  patient: Patient;
}

export function OverviewTab({ patient }: OverviewTabProps) {
  const { data: vitals } = useVitalsList(patient.PatientID);
  const { data: history, isLoading: historyLoading } = usePatientHistory(patient.PatientID);
  const updateHistory = useUpdateHistory();
  const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false);
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [historyFormData, setHistoryFormData] = useState({
    PresentingComplaint: '',
    Comorbidities: '',
    FamilyCancerHistory: '',
  });

  useEffect(() => {
    if (history) {
      setHistoryFormData({
        PresentingComplaint: history.PresentingComplaint || '',
        Comorbidities: history.Comorbidities || '',
        FamilyCancerHistory: history.FamilyCancerHistory || '',
      });
    }
  }, [history]);

  const handleSaveHistory = async () => {
    try {
      await updateHistory.mutateAsync({
        patientId: patient.PatientID,
        data: historyFormData,
      });
      toast.success('Medical history updated successfully');
      setIsEditingHistory(false);
    } catch (error) {
      console.error('Failed to update history:', error);
      toast.error('Failed to update history. Please try again.');
    }
  };

  const handleCancelHistory = () => {
    if (history) {
      setHistoryFormData({
        PresentingComplaint: history.PresentingComplaint || '',
        Comorbidities: history.Comorbidities || '',
        FamilyCancerHistory: history.FamilyCancerHistory || '',
      });
    }
    setIsEditingHistory(false);
  };

  // Group patient data into sections
  const personalInfo = {
    name: patient.PatientName,
    age: patient.Age,
    gender: patient.Gender,
    maritalStatus: patient.MaritalStatus,
    children: patient.NoOfChidren,
    siblings: patient.NoOfSibling,
  };

  const contactInfo = {
    phone: patient.ContactNo,
    cnic: patient.CNICNo,
    presentAddress: patient.PresentAddress,
    permanentAddress: patient.PermanentAddress,
  };

  const registrationInfo = {
    regNo: patient.RegistrationNo,
    regDate: patient.RegistrationDate,
    wosodo: patient.WOSODO,
    relativeName: patient.RelativeName,
  };

  const physicalInfo = {
    height: patient.Height,
    heightScale: patient.HScale,
    weight: patient.Weight,
    weightScale: patient.WScale,
    bloodGroup: patient.BloodGroupName,
  };

  const professionalInfo = {
    educated: patient.Educated,
    qualifications: patient.QualificationName,
    occupation: patient.OccupationName,
    years: patient.Years,
    income: patient.MonthlyIncome,
  };

  const lifestyleInfo = {
    waterUsage: patient.WaterUsage,
    motherTongue: patient.MotherTongueName,
    placeOfBirth: patient.PlaceOfBirthName,
    doesSports: patient.DoSports,
    sports: patient.SportsName,
    doesExercise: patient.DoExercise,
    exercise: patient.Exercise,
    exerciseDuration: patient.Durantion,
    howOften: patient.HowOften,
  };

  const medicalHistory = {
    treatedBefore: patient.TreatedBefore,
    altDuration: patient.AlternativeNameDuration,
    medicalTreatment: patient.MedicalTreatmentSpecify,
    previousTreatment: patient.PreviousTreatment,
    modeOfPresentation: patient.ModeOfPresentation,
    presentedWith: patient.PresentedWith,
    treatmentOffered: patient.TreatmentOfferedAtJPMC,
    outcome: patient.OutComeOfTreatment,
    proposedTreatment: patient.ProposedTreatment,
    planOfTreatment: patient.PlanOfTreatment,
  };

  return (
    <div className="space-y-6">
      {/* Patient Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Patient Overview</CardTitle>
            <Link href={`/patients/${patient.PatientID}/edit`}>
              <Button variant="outline" size="sm">
                <PenTool className="mr-2 h-4 w-4" />
                Edit Patient
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{personalInfo.name}</h3>
              <p className="text-sm text-muted-foreground">
                {personalInfo.age ? `${personalInfo.age} years` : 'Age unknown'} • {personalInfo.gender || 'Unknown'}
                {personalInfo.maritalStatus && ` • ${personalInfo.maritalStatus}`}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact Information
              </h4>
              <div className="space-y-2 text-sm pl-6">
                {contactInfo.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{contactInfo.phone}</span>
                  </div>
                )}
                {contactInfo.cnic && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">CNIC:</span>
                    <span>{contactInfo.cnic}</span>
                  </div>
                )}
                {contactInfo.presentAddress && (
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground">Present Address:</span>
                    <span>{contactInfo.presentAddress}</span>
                  </div>
                )}
                {contactInfo.permanentAddress && (
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground">Permanent Address:</span>
                    <span>{contactInfo.permanentAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Registration Details */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Registration Details
              </h4>
              <div className="space-y-2 text-sm pl-6">
                {registrationInfo.regNo && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Reg No:</span>
                    <span>{registrationInfo.regNo}</span>
                  </div>
                )}
                {registrationInfo.regDate && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Reg Date:</span>
                    <span>{formatDate(registrationInfo.regDate)}</span>
                  </div>
                )}
                {registrationInfo.relativeName && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Relative:</span>
                    <span>{registrationInfo.relativeName}</span>
                  </div>
                )}
                {registrationInfo.wosodo && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">WOSODO:</span>
                    <span>{registrationInfo.wosodo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Physical Information */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Physical Information
              </h4>
              <div className="space-y-2 text-sm pl-6">
                {physicalInfo.height && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Height:</span>
                    <span>{physicalInfo.height} cm {physicalInfo.heightScale || ''}</span>
                  </div>
                )}
                {physicalInfo.weight && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Weight:</span>
                    <span>{physicalInfo.weight} kg {physicalInfo.weightScale || ''}</span>
                  </div>
                )}
                {physicalInfo.bloodGroup && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Blood Group:</span>
                    <span>{physicalInfo.bloodGroup}</span>
                  </div>
                )}
                {personalInfo.children !== undefined && personalInfo.children !== null && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Children:</span>
                    <span>{personalInfo.children}</span>
                  </div>
                )}
                {personalInfo.siblings !== undefined && personalInfo.siblings !== null && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Siblings:</span>
                    <span>{personalInfo.siblings}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Professional Information
              </h4>
              <div className="space-y-2 text-sm pl-6">
                {professionalInfo.occupation && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Occupation:</span>
                    <span>{professionalInfo.occupation}</span>
                  </div>
                )}
                {professionalInfo.qualifications && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Qualification:</span>
                    <span>{professionalInfo.qualifications}</span>
                  </div>
                )}
                {professionalInfo.income && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Monthly Income:</span>
                    <span>{professionalInfo.income}</span>
                  </div>
                )}
                {professionalInfo.years && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Years:</span>
                    <span>{professionalInfo.years}</span>
                  </div>
                )}
                {professionalInfo.educated !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Educated:</span>
                    <span>{professionalInfo.educated ? 'Yes' : 'No'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Lifestyle Information */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Lifestyle
              </h4>
              <div className="space-y-2 text-sm pl-6">
                {lifestyleInfo.motherTongue && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Mother Tongue:</span>
                    <span>{lifestyleInfo.motherTongue}</span>
                  </div>
                )}
                {lifestyleInfo.placeOfBirth && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Place of Birth:</span>
                    <span>{lifestyleInfo.placeOfBirth}</span>
                  </div>
                )}
                {lifestyleInfo.waterUsage && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Water Usage:</span>
                    <span>{lifestyleInfo.waterUsage}</span>
                  </div>
                )}
                {(lifestyleInfo.doesSports || lifestyleInfo.sports) && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Sports:</span>
                    <span>{lifestyleInfo.sports || 'No'}</span>
                  </div>
                )}
                {(lifestyleInfo.doesExercise || lifestyleInfo.exercise) && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Exercise:</span>
                    <span>{lifestyleInfo.exercise || 'No'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Medical History Summary */}
            <div className="space-y-3 md:col-span-2">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Medical History
              </h4>
              <div className="space-y-2 text-sm pl-6">
                {medicalHistory.treatedBefore && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Treated Before:</span>
                    <span>Yes</span>
                  </div>
                )}
                {medicalHistory.modeOfPresentation && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Mode of Presentation:</span>
                    <span>{medicalHistory.modeOfPresentation}</span>
                  </div>
                )}
                {medicalHistory.presentedWith && (
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground">Presented With:</span>
                    <span>{medicalHistory.presentedWith}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical History Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Medical History</CardTitle>
              <CardDescription>Patient's presenting complaint, comorbidities, and family history</CardDescription>
            </div>
            {!isEditingHistory && (
              <Button variant="outline" size="sm" onClick={() => setIsEditingHistory(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit History
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditingHistory ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="PresentingComplaint">Presenting Complaint</Label>
                <Textarea
                  id="PresentingComplaint"
                  value={historyFormData.PresentingComplaint}
                  onChange={(e) => setHistoryFormData({ ...historyFormData, PresentingComplaint: e.target.value })}
                  placeholder="Enter the patient's presenting complaint..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="Comorbidities">Comorbidities</Label>
                <Textarea
                  id="Comorbidities"
                  value={historyFormData.Comorbidities}
                  onChange={(e) => setHistoryFormData({ ...historyFormData, Comorbidities: e.target.value })}
                  placeholder="Enter any comorbidities..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="FamilyCancerHistory">Family Cancer History</Label>
                <Textarea
                  id="FamilyCancerHistory"
                  value={historyFormData.FamilyCancerHistory}
                  onChange={(e) => setHistoryFormData({ ...historyFormData, FamilyCancerHistory: e.target.value })}
                  placeholder="Enter any family history of cancer..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSaveHistory} disabled={updateHistory.isPending}>
                  {updateHistory.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save History
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleCancelHistory} disabled={updateHistory.isPending}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="text-sm font-medium mb-2">Presenting Complaint</h4>
                <p className="text-sm text-muted-foreground">
                  {history?.PresentingComplaint || 'No presenting complaint recorded'}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Comorbidities</h4>
                <p className="text-sm text-muted-foreground">
                  {history?.Comorbidities || 'No comorbidities recorded'}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Family Cancer History</h4>
                <p className="text-sm text-muted-foreground">
                  {history?.FamilyCancerHistory || 'No family history recorded'}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Vitals Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vitals</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setVitalsDialogOpen(true)}>
              Add Vitals
            </Button>
          </div>
          <CardDescription>Latest vital signs measurements</CardDescription>
        </CardHeader>
        <CardContent>
          {vitals && (vitals.height || vitals.weight || vitals.bloodGroup) ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {vitals.height && (
                <div>
                  <span className="text-sm text-muted-foreground">Height:</span>{' '}
                  <span className="font-medium">{vitals.height} cm</span>
                </div>
              )}
              {vitals.weight && (
                <div>
                  <span className="text-sm text-muted-foreground">Weight:</span>{' '}
                  <span className="font-medium">{vitals.weight} kg</span>
                </div>
              )}
              {vitals.bloodGroup && (
                <div>
                  <span className="text-sm text-muted-foreground">Blood Group:</span>{' '}
                  <span className="font-medium">{vitals.bloodGroup}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No vitals recorded yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vitals Form Dialog */}
      <VitalsForm
        patientId={patient.PatientID}
        open={vitalsDialogOpen}
        onOpenChange={setVitalsDialogOpen}
      />
    </div>
  );
}
