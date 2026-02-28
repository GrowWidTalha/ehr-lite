// Edit patient page - User Story 6
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePatient, useUpdatePatient } from '@/hooks/use-patients';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { PatientForm } from '@/components/patients/patient-form';
import type { CreatePatientFormData } from '@/lib/validations';

export default function EditPatientPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const { data: patient, isLoading } = usePatient(patientId);
  const updatePatient = useUpdatePatient();

  const [formData, setFormData] = useState<CreatePatientFormData>({
    full_name: '',
    age: undefined,
    sex: undefined,
    phone: '',
    cnic: '',
    marital_status: undefined,
    education: undefined,
    language: '',
    territory: '',
    children_count: 0,
    sibling_count: 0,
  });

  // Pre-populate form when patient data loads
  useEffect(() => {
    if (patient) {
      setFormData({
        full_name: patient.full_name || '',
        age: patient.age || undefined,
        sex: patient.sex || undefined,
        phone: patient.phone || '',
        cnic: patient.cnic || '',
        marital_status: patient.marital_status || undefined,
        education: patient.education || undefined,
        language: patient.language || '',
        territory: patient.territory || '',
        children_count: patient.children_count || 0,
        sibling_count: patient.sibling_count || 0,
      });
    }
  }, [patient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updatePatient.mutateAsync({
        id: patientId,
        data: formData,
      });

      toast.success('Patient updated successfully');
      // Redirect to patient detail page
      router.push(`/patients/${patientId}`);
    } catch (error) {
      console.error('Failed to update patient:', error);
      toast.error('Failed to update patient. Please try again.');
    }
  };

  const handleCancel = () => {
    // Discard changes and return to patient detail
    router.push(`/patients/${patientId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Patient not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <Link href={`/patients/${patientId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patient
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Edit Patient Information</CardTitle>
            <CardDescription>
              Update patient details. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PatientForm
              mode="edit"
              patient={patient}
              formData={formData}
              onChange={setFormData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isPending={updatePatient.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
