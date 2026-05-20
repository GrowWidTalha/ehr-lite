'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Loader2 } from 'lucide-react';
import { SEX_OPTIONS } from '@/lib/utils';
import { useLookups } from '@/hooks/use-lookups';
import type { CreatePatientInput, Patient } from '@/lib/db.types';

type CreatePatientFormData = CreatePatientInput;

const MARITAL_STATUS_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];

interface PatientFormProps {
  mode: 'create' | 'edit';
  patient?: Patient | null;
  formData: CreatePatientFormData;
  onChange: (data: CreatePatientFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function PatientForm({
  mode,
  patient,
  formData,
  onChange,
  onSubmit,
  onCancel,
  isPending,
}: PatientFormProps) {
  const { data: lookups, isLoading: lookupsLoading } = useLookups();

  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-6">
        {/* Basic Information - Always Expanded */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">
            {mode === 'create' ? 'Basic Information' : 'Patient Information'} *
          </h3>

          <div className="space-y-2">
            <Label htmlFor="PatientName">Full Name *</Label>
            <Input
              id="PatientName"
              value={formData.PatientName}
              onChange={(e) => onChange({ ...formData, PatientName: e.target.value })}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="Age">Age *</Label>
              <Input
                id="Age"
                type="number"
                min="0"
                max="150"
                value={formData.Age ?? ''}
                onChange={(e) =>
                  onChange({ ...formData, Age: e.target.value ? parseInt(e.target.value) : undefined })
                }
                placeholder="Age"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="Gender">Sex *</Label>
              <Select
                value={formData.Gender}
                onValueChange={(value) =>
                  onChange({ ...formData, Gender: value as CreatePatientFormData['Gender'] })
                }
                required
              >
                <SelectTrigger id="Gender">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  {SEX_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ContactNo">Phone *</Label>
              <Input
                id="ContactNo"
                type="tel"
                value={formData.ContactNo}
                onChange={(e) => onChange({ ...formData, ContactNo: e.target.value })}
                placeholder="e.g., 0300-1234567"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="BloodGroup">Blood Group</Label>
              <Select
                value={formData.BloodGroup?.toString() || ''}
                onValueChange={(value) =>
                  onChange({ ...formData, BloodGroup: value ? parseInt(value) : undefined })
                }
                disabled={lookupsLoading}
              >
                <SelectTrigger id="BloodGroup">
                  <SelectValue placeholder="Select Blood Group" />
                </SelectTrigger>
                <SelectContent>
                  {lookups?.bloodGroups?.map((bg) => (
                    <SelectItem key={bg.ID} value={bg.ID.toString()}>
                      {bg.BloodGroup}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="CNICNo">CNIC</Label>
            <Input
              id="CNICNo"
              value={formData.CNICNo}
              onChange={(e) => onChange({ ...formData, CNICNo: e.target.value })}
              placeholder="e.g., 12345-1234567-1"
            />
          </div>
        </div>

        {/* Optional Information - Collapsed by Default */}
        <Accordion type="single" collapsible defaultValue={mode === 'edit' ? 'optional' : undefined}>
          <AccordionItem value="optional">
            <AccordionTrigger>Optional Information</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="MaritalStatus">Marital Status</Label>
                  <Select
                    value={formData.MaritalStatus ?? ''}
                    onValueChange={(value) =>
                      onChange({ ...formData, MaritalStatus: value || undefined })
                    }
                  >
                    <SelectTrigger id="MaritalStatus">
                      <SelectValue placeholder="Select Marital Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {MARITAL_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Qualifications">Qualification</Label>
                  <Select
                    value={formData.Qualifications?.toString() || ''}
                    onValueChange={(value) =>
                      onChange({ ...formData, Qualifications: value ? parseInt(value) : undefined })
                    }
                    disabled={lookupsLoading}
                  >
                    <SelectTrigger id="Qualifications">
                      <SelectValue placeholder="Select Qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      {lookups?.qualifications?.map((q) => (
                        <SelectItem key={q.ID} value={q.ID.toString()}>
                          {q.QLevel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="Occupation">Occupation</Label>
                  <Select
                    value={formData.Occupation?.toString() || ''}
                    onValueChange={(value) =>
                      onChange({ ...formData, Occupation: value ? parseInt(value) : undefined })
                    }
                    disabled={lookupsLoading}
                  >
                    <SelectTrigger id="Occupation">
                      <SelectValue placeholder="Select Occupation" />
                    </SelectTrigger>
                    <SelectContent>
                      {lookups?.occupations?.map((o) => (
                        <SelectItem key={o.ID} value={o.ID.toString()}>
                          {o.Occupation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="MotherTongue">Mother Tongue</Label>
                  <Select
                    value={formData.MotherTongue?.toString() || ''}
                    onValueChange={(value) =>
                      onChange({ ...formData, MotherTongue: value ? parseInt(value) : undefined })
                    }
                    disabled={lookupsLoading}
                  >
                    <SelectTrigger id="MotherTongue">
                      <SelectValue placeholder="Select Mother Tongue" />
                    </SelectTrigger>
                    <SelectContent>
                      {lookups?.motherTongues?.map((m) => (
                        <SelectItem key={m.ID} value={m.ID.toString()}>
                          {m.MotherTongue}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="PlaceOfBirth">Place of Birth (District)</Label>
                  <Select
                    value={formData.PlaceOfBirth?.toString() || ''}
                    onValueChange={(value) =>
                      onChange({ ...formData, PlaceOfBirth: value ? parseInt(value) : undefined })
                    }
                    disabled={lookupsLoading}
                  >
                    <SelectTrigger id="PlaceOfBirth">
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                      {lookups?.districts?.map((d) => (
                        <SelectItem key={d.ID} value={d.ID.toString()}>
                          {d.District}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Hospital">Hospital</Label>
                  <Select
                    value={formData.Hospital?.toString() || ''}
                    onValueChange={(value) =>
                      onChange({ ...formData, Hospital: value ? parseInt(value) : undefined })
                    }
                    disabled={lookupsLoading}
                  >
                    <SelectTrigger id="Hospital">
                      <SelectValue placeholder="Select Hospital" />
                    </SelectTrigger>
                    <SelectContent>
                      {lookups?.hospitals?.map((h) => (
                        <SelectItem key={h.ID} value={h.ID.toString()}>
                          {h.Hospitals}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="NoOfChidren">Children Count</Label>
                  <Input
                    id="NoOfChidren"
                    type="number"
                    min="0"
                    value={formData.NoOfChidren ?? 0}
                    onChange={(e) =>
                      onChange({ ...formData, NoOfChidren: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="NoOfSibling">Sibling Count</Label>
                  <Input
                    id="NoOfSibling"
                    type="number"
                    min="0"
                    value={formData.NoOfSibling ?? 0}
                    onChange={(e) =>
                      onChange({ ...formData, NoOfSibling: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : mode === 'create' ? (
              'Save Patient'
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
