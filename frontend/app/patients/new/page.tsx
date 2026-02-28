// New patient page - User Story 2
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreatePatient } from '@/hooks/use-patients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { PatientForm } from '@/components/patients/patient-form';
import type { CreatePatientFormData } from '@/lib/validations';

export default function NewPatientPage() {
  const router = useRouter();
  const createPatient = useCreatePatient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await createPatient.mutateAsync(formData);
      // Redirect to patient detail page
      router.push(`/patients/${result.id}`);
    } catch (error) {
      console.error('Failed to create patient:', error);
    }
  };

  if (createPatient.isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Register New Patient</CardTitle>
              <CardDescription>
                Before registering a new patient, let's check if they already exist in the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="search">Search by name or phone</Label>
                <Input
                  id="search"
                  placeholder="Enter patient name or phone number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    // TODO: Implement search functionality
                    if (searchQuery) {
                      alert('Search functionality would check existing patients');
                    }
                  }}
                >
                  Search Existing Patients
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={() => setShowForm(true)}
                >
                  Patient is New - Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patients
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>
              Enter the patient's basic information. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PatientForm
              mode="create"
              formData={formData}
              onChange={setFormData}
              onSubmit={handleSubmit}
              onCancel={() => router.back()}
              isPending={createPatient.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
