'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Phone, IdCard, Calendar, Ruler, Weight, Droplets } from 'lucide-react';
import { useLookups } from '@/hooks/use-lookups';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const COMORBIDITIES = [
  'Diabetes Mellitus (DM)',
  'Hypertension (HTN)',
  'Ischemic Heart Disease (IHD)',
  'Hepatitis C (HCV)',
  'Hepatitis B (HBV)',
  'Chronic Kidney Disease (CKD)',
  'COPD/Asthma',
  'Thyroid Disorders',
  'Stroke',
  'Other'
];

const RELATION_OPTIONS = [
  { value: 'S/O', label: 'Son of (S/O)' },
  { value: 'D/O', label: 'Daughter of (D/O)' },
  { value: 'W/O', label: 'Wife of (W/O)' }
];

interface BasicInfoStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

export function BasicInfoStep({ formData, onChange, error }: BasicInfoStepProps) {
  const { data: lookups, isLoading: lookupsLoading } = useLookups();

  // Handle comorbidity selection
  const handleComorbidityToggle = (comorbidity: string) => {
    const currentComorbidities = formData.ComorbiditiesList || [];
    const updated = currentComorbidities.includes(comorbidity)
      ? currentComorbidities.filter((c: string) => c !== comorbidity)
      : [...currentComorbidities, comorbidity];

    onChange({ ...formData, ComorbiditiesList: updated });
  };

  // Format Contact No (0300-00000000)
  const formatContactNo = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 11)}`;
  };

  // Format CNIC (00000-0000000-0)
  const formatCNIC = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 5) return cleaned;
    if (cleaned.length <= 12) return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12, 13)}`;
  };

  // Build full name from components
  const buildFullName = () => {
    const parts = [];
    if (formData.FirstName) parts.push(formData.FirstName);
    if (formData.Relation && formData.RelativeName) {
      parts.push(`${formData.Relation} ${formData.RelativeName}`);
    }
    if (formData.Surname) parts.push(formData.Surname);
    const fullName = parts.join(' ');
    onChange({ ...formData, PatientName: fullName });
    return fullName;
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Enter the patient&apos;s basic information. Fields marked with <span className="text-destructive font-semibold">*</span> are required.
      </p>

      {/* Registration Details Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <IdCard className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Registration Details</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Registration Number */}
          <div className="space-y-2">
            <Label htmlFor="RegistrationNo" className="text-sm font-medium">Reg No</Label>
            <Input
              id="RegistrationNo"
              value={formData.RegistrationNo}
              onChange={(e) => onChange({ ...formData, RegistrationNo: e.target.value })}
              placeholder="Leave blank for auto"
            />
            <p className="text-xs text-muted-foreground">Leave blank for automatic generation</p>
          </div>

          {/* Registration Date */}
          <div className="space-y-2">
            <Label htmlFor="RegistrationDate" className="text-sm font-medium">Reg Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="RegistrationDate"
                type="date"
                value={formData.RegistrationDate}
                onChange={(e) => onChange({ ...formData, RegistrationDate: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Patient Name Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <User className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Patient Name</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="FirstName" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="FirstName"
              value={formData.FirstName || ''}
              onChange={(e) => {
                onChange({ ...formData, FirstName: e.target.value });
                buildFullName();
              }}
              placeholder="First name"
              className={error && !formData.FirstName ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {error && !formData.FirstName && (
              <p className="text-xs text-destructive">Name is required</p>
            )}
          </div>

          {/* Relation */}
          <div className="space-y-2">
            <Label htmlFor="Relation" className="text-sm font-medium">Relation</Label>
            <Select
              value={formData.Relation || ''}
              onValueChange={(value) => {
                onChange({ ...formData, Relation: value });
                buildFullName();
              }}
            >
              <SelectTrigger id="Relation">
                <SelectValue placeholder="Select relation" />
              </SelectTrigger>
              <SelectContent>
                {RELATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Relative Name */}
          <div className="space-y-2">
            <Label htmlFor="RelativeName" className="text-sm font-medium">Father/Husband Name</Label>
            <Input
              id="RelativeName"
              value={formData.RelativeName || ''}
              onChange={(e) => {
                onChange({ ...formData, RelativeName: e.target.value });
                buildFullName();
              }}
              placeholder="Enter name"
            />
          </div>

          {/* Surname */}
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="Surname" className="text-sm font-medium">Surname / Family Name</Label>
            <Input
              id="Surname"
              value={formData.Surname || ''}
              onChange={(e) => {
                onChange({ ...formData, Surname: e.target.value });
                buildFullName();
              }}
              placeholder="Enter surname"
            />
            {formData.PatientName && (
              <p className="text-xs text-muted-foreground">
                Full Name: <strong>{formData.PatientName}</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Medical History Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <IdCard className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Medical History</h3>
        </div>

        {/* Presenting Complaint */}
        <div className="space-y-2">
          <Label htmlFor="PresentingComplaint" className="text-sm font-medium">History / Presenting Complaint</Label>
          <Textarea
            id="PresentingComplaint"
            value={formData.PresentingComplaint}
            onChange={(e) => onChange({ ...formData, PresentingComplaint: e.target.value })}
            placeholder="Reason for visit / chief complaint..."
            className="min-h-[80px]"
          />
        </div>

        {/* Comorbidities - Multi Select */}
        <div className="space-y-2">
          <Label htmlFor="Comorbidities" className="text-sm font-medium">Comorbidities</Label>
          <div className="grid gap-2 md:grid-cols-2">
            {COMORBIDITIES.map((comorbidity) => (
              <div key={comorbidity} className="flex items-center space-x-2">
                <Checkbox
                  id={`comorbidity-${comorbidity}`}
                  checked={(formData.ComorbiditiesList || []).includes(comorbidity)}
                  onCheckedChange={() => handleComorbidityToggle(comorbidity)}
                />
                <Label
                  htmlFor={`comorbidity-${comorbidity}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {comorbidity}
                </Label>
              </div>
            ))}
          </div>
          {(formData.ComorbiditiesList || []).length > 0 && (
            <p className="text-xs text-muted-foreground">
              Selected: {(formData.ComorbiditiesList || []).join(', ')}
            </p>
          )}
        </div>

        {/* Family Cancer History */}
        <div className="space-y-2">
          <Label htmlFor="FamilyCancerHistory" className="text-sm font-medium">Family Cancer History</Label>
          <Textarea
            id="FamilyCancerHistory"
            value={formData.FamilyCancerHistory}
            onChange={(e) => onChange({ ...formData, FamilyCancerHistory: e.target.value })}
            placeholder="Any family history of cancer, relationship, type..."
            className="min-h-[80px]"
          />
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <User className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Personal Information</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="Age" className="text-sm font-medium">Age</Label>
            <Input
              id="Age"
              type="number"
              value={formData.Age}
              onChange={(e) => onChange({ ...formData, Age: e.target.value })}
              placeholder="Years"
              min="0"
              max="150"
            />
          </div>

          {/* Sex */}
          <div className="space-y-2">
            <Label htmlFor="Gender" className="text-sm font-medium">Sex</Label>
            <Select
              value={formData.Gender}
              onValueChange={(value) => onChange({ ...formData, Gender: value })}
            >
              <SelectTrigger id="Gender">
                <SelectValue placeholder="Select Sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Marital Status */}
          <div className="space-y-2">
            <Label htmlFor="MaritalStatus" className="text-sm font-medium">Marital Status</Label>
            <Select
              value={formData.MaritalStatus}
              onValueChange={(value) => onChange({ ...formData, MaritalStatus: value })}
            >
              <SelectTrigger id="MaritalStatus">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Married">Married</SelectItem>
                <SelectItem value="Widowed">Widowed</SelectItem>
                <SelectItem value="Divorced">Divorced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* No of Children */}
          <div className="space-y-2">
            <Label htmlFor="NoOfChidren" className="text-sm font-medium">No of Children</Label>
            <Input
              id="NoOfChidren"
              type="number"
              value={formData.NoOfChidren}
              onChange={(e) => onChange({ ...formData, NoOfChidren: e.target.value })}
              placeholder="0"
              min="0"
            />
          </div>

          {/* No of Siblings */}
          <div className="space-y-2">
            <Label htmlFor="NoOfSibling" className="text-sm font-medium">No of Siblings</Label>
            <Input
              id="NoOfSibling"
              type="number"
              value={formData.NoOfSibling}
              onChange={(e) => onChange({ ...formData, NoOfSibling: e.target.value })}
              placeholder="0"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Physical Measurements Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Ruler className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Physical Measurements</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Height */}
          <div className="space-y-2">
            <Label htmlFor="height_cm" className="text-sm font-medium">Height</Label>
            <div className="flex items-center gap-2">
              <Input
                id="height_cm"
                type="number"
                step="0.1"
                value={formData.height_cm}
                onChange={(e) => onChange({ ...formData, height_cm: e.target.value })}
                placeholder="165"
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">cm</span>
            </div>
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weight_kg" className="text-sm font-medium">Weight</Label>
            <div className="flex items-center gap-2">
              <Input
                id="weight_kg"
                type="number"
                step="0.1"
                value={formData.weight_kg}
                onChange={(e) => onChange({ ...formData, weight_kg: e.target.value })}
                placeholder="65"
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">kg</span>
            </div>
          </div>

          {/* Blood Group */}
          <div className="space-y-2">
            <Label htmlFor="blood_group" className="text-sm font-medium">Blood Group</Label>
            <Select
              value={formData.blood_group}
              onValueChange={(value) => onChange({ ...formData, blood_group: value })}
            >
              <SelectTrigger id="blood_group">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_GROUPS.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Location & Contact Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Phone className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Location & Contact</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Language / Mother Tongue */}
          <div className="space-y-2">
            <Label htmlFor="MotherTongue" className="text-sm font-medium">Language</Label>
            <Select
              value={formData.MotherTongue?.toString() || ''}
              onValueChange={(value) => onChange({ ...formData, MotherTongue: value ? parseInt(value) : undefined })}
              disabled={lookupsLoading}
            >
              <SelectTrigger id="MotherTongue">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {lookupsLoading && (
                  <div className="flex items-center justify-center p-2">
                    <div className="h-4 w-4 animate-spin border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                )}
                {!lookupsLoading && lookups?.motherTongues?.map((m) => (
                  <SelectItem key={m.ID} value={m.ID.toString()}>
                    {m.MotherTongue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Territory / City */}
          <div className="space-y-2">
            <Label htmlFor="PlaceOfBirth" className="text-sm font-medium">Territory / City</Label>
            <Select
              value={formData.PlaceOfBirth?.toString() || ''}
              onValueChange={(value) => onChange({ ...formData, PlaceOfBirth: value ? parseInt(value) : undefined })}
              disabled={lookupsLoading}
            >
              <SelectTrigger id="PlaceOfBirth">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {lookupsLoading && (
                  <div className="flex items-center justify-center p-2">
                    <div className="h-4 w-4 animate-spin border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                )}
                {!lookupsLoading && lookups?.districts?.map((d) => (
                  <SelectItem key={d.ID} value={d.ID.toString()}>
                    {d.District}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contact No */}
          <div className="space-y-2">
            <Label htmlFor="ContactNo" className="text-sm font-medium">Contact No</Label>
            <Input
              id="ContactNo"
              type="tel"
              value={formData.ContactNo}
              onChange={(e) => onChange({ ...formData, ContactNo: formatContactNo(e.target.value) })}
              placeholder="0300-00000000"
              maxLength={12}
            />
            <p className="text-xs text-muted-foreground">Format: 0300-00000000</p>
          </div>

          {/* CNIC */}
          <div className="space-y-2">
            <Label htmlFor="CNICNo" className="text-sm font-medium">CNIC No</Label>
            <Input
              id="CNICNo"
              value={formData.CNICNo}
              onChange={(e) => onChange({ ...formData, CNICNo: formatCNIC(e.target.value) })}
              placeholder="00000-0000000-0"
              maxLength={15}
            />
            <p className="text-xs text-muted-foreground">Format: 00000-0000000-0</p>
          </div>
        </div>
      </div>

      {/* Education & Occupation Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <User className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Education & Occupation</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Education / Qualification */}
          <div className="space-y-2">
            <Label htmlFor="Qualifications" className="text-sm font-medium">Education</Label>
            <Select
              value={formData.Qualifications?.toString() || ''}
              onValueChange={(value) => onChange({ ...formData, Qualifications: value ? parseInt(value) : undefined })}
              disabled={lookupsLoading}
            >
              <SelectTrigger id="Qualifications">
                <SelectValue placeholder="Select education" />
              </SelectTrigger>
              <SelectContent>
                {lookupsLoading && (
                  <div className="flex items-center justify-center p-2">
                    <div className="h-4 w-4 animate-spin border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                )}
                {!lookupsLoading && lookups?.qualifications?.map((q) => (
                  <SelectItem key={q.ID} value={q.ID.toString()}>
                    {q.QLevel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Occupation */}
          <div className="space-y-2">
            <Label htmlFor="Occupation" className="text-sm font-medium">Occupation</Label>
            <Select
              value={formData.Occupation?.toString() || ''}
              onValueChange={(value) => onChange({ ...formData, Occupation: value ? parseInt(value) : undefined })}
              disabled={lookupsLoading}
            >
              <SelectTrigger id="Occupation">
                <SelectValue placeholder="Select occupation" />
              </SelectTrigger>
              <SelectContent>
                {lookupsLoading && (
                  <div className="flex items-center justify-center p-2">
                    <div className="h-4 w-4 animate-spin border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                )}
                {!lookupsLoading && lookups?.occupations?.map((o) => (
                  <SelectItem key={o.ID} value={o.ID.toString()}>
                    {o.Occupation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
