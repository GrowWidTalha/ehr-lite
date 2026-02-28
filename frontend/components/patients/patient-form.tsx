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
import type { CreatePatientInput, Patient } from '@/lib/db.types';

type CreatePatientFormData = CreatePatientInput;

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
  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-6">
        {/* Basic Information - Always Expanded */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">
            {mode === 'create' ? 'Basic Information' : 'Patient Information'} *
          </h3>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => onChange({ ...formData, full_name: e.target.value })}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                min="0"
                max="150"
                value={formData.age ?? ''}
                onChange={(e) =>
                  onChange({ ...formData, age: e.target.value ? parseInt(e.target.value) : undefined })
                }
                placeholder="Age"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sex">Sex *</Label>
              <Select
                value={formData.sex}
                onValueChange={(value) =>
                  onChange({ ...formData, sex: value as CreatePatientFormData['sex'] })
                }
                required
              >
                <SelectTrigger id="sex">
                  <SelectValue placeholder="Select sex" />
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

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => onChange({ ...formData, phone: e.target.value })}
              placeholder="e.g., 0300-1234567"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnic">CNIC</Label>
            <Input
              id="cnic"
              value={formData.cnic}
              onChange={(e) => onChange({ ...formData, cnic: e.target.value })}
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
                  <Label htmlFor="marital_status">Marital Status</Label>
                  <Input
                    id="marital_status"
                    value={formData.marital_status ?? ''}
                    onChange={(e) => onChange({ ...formData, marital_status: e.target.value })}
                    placeholder="e.g., Single, Married"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input
                    id="education"
                    value={formData.education ?? ''}
                    onChange={(e) => onChange({ ...formData, education: e.target.value })}
                    placeholder="e.g., High School, Graduate"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={formData.language}
                    onChange={(e) => onChange({ ...formData, language: e.target.value })}
                    placeholder="e.g., Urdu, English"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="territory">Territory</Label>
                  <Input
                    id="territory"
                    value={formData.territory}
                    onChange={(e) => onChange({ ...formData, territory: e.target.value })}
                    placeholder="City or region"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="children_count">Children Count</Label>
                  <Input
                    id="children_count"
                    type="number"
                    min="0"
                    value={formData.children_count ?? 0}
                    onChange={(e) =>
                      onChange({ ...formData, children_count: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sibling_count">Sibling Count</Label>
                  <Input
                    id="sibling_count"
                    type="number"
                    min="0"
                    value={formData.sibling_count ?? 0}
                    onChange={(e) =>
                      onChange({ ...formData, sibling_count: parseInt(e.target.value) || 0 })
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
