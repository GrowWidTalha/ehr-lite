'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone, IdCard, Calendar, Loader2 } from 'lucide-react';
import { useLookups } from '@/hooks/use-lookups';

interface BasicInfoStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

export function BasicInfoStep({ formData, onChange, error }: BasicInfoStepProps) {
  const { data: lookups, isLoading: lookupsLoading } = useLookups();

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Enter the patient&apos;s basic information. Fields marked with <span className="text-destructive font-semibold">*</span> are required.
      </p>

      {/* Personal Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <User className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Personal Information</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Full Name - Required */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="PatientName" className="text-sm font-medium">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="PatientName"
              value={formData.PatientName}
              onChange={(e) => onChange({ ...formData, PatientName: e.target.value })}
              placeholder="Enter patient's full name"
              className={error && !formData.PatientName ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {error && !formData.PatientName && (
              <p className="text-xs text-destructive">Full name is required</p>
            )}
          </div>

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
            <p className="text-xs text-muted-foreground">Patient&apos;s Age in years</p>
          </div>

          {/* Sex */}
          <div className="space-y-2">
            <Label htmlFor="Gender" className="text-sm font-medium">Sex</Label>
            <Select
              value={formData.Gender}
              onValueChange={(value) => onChange({ ...formData, Gender: value })}
            >
              <SelectTrigger id="Gender">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Blood Group */}
          <div className="space-y-2">
            <Label htmlFor="BloodGroup" className="text-sm font-medium">Blood Group</Label>
            <Select
              value={formData.BloodGroup?.toString() || ''}
              onValueChange={(value) => onChange({ ...formData, BloodGroup: value ? parseInt(value) : undefined })}
              disabled={lookupsLoading}
            >
              <SelectTrigger id="BloodGroup">
                <SelectValue placeholder="Select Blood Group" />
              </SelectTrigger>
              <SelectContent>
                {lookupsLoading && (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
                {!lookupsLoading && lookups?.bloodGroups?.map((bg) => (
                  <SelectItem key={bg.ID} value={bg.ID.toString()}>
                    {bg.BloodGroup}
                  </SelectItem>
                ))}
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

          {/* Qualification */}
          <div className="space-y-2">
            <Label htmlFor="Qualifications" className="text-sm font-medium">Qualification</Label>
            <Select
              value={formData.Qualifications?.toString() || ''}
              onValueChange={(value) => onChange({ ...formData, Qualifications: value ? parseInt(value) : undefined })}
              disabled={lookupsLoading}
            >
              <SelectTrigger id="Qualifications">
                <SelectValue placeholder="Select Qualification" />
              </SelectTrigger>
              <SelectContent>
                {lookupsLoading && (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
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
                <SelectValue placeholder="Select Occupation" />
              </SelectTrigger>
              <SelectContent>
                {lookupsLoading && (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
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

          {/* Mother Tongue */}
          <div className="space-y-2">
            <Label htmlFor="MotherTongue" className="text-sm font-medium">Mother Tongue</Label>
            <Select
              value={formData.MotherTongue?.toString() || ''}
              onValueChange={(value) => onChange({ ...formData, MotherTongue: value ? parseInt(value) : undefined })}
              disabled={lookupsLoading}
            >
              <SelectTrigger id="MotherTongue">
                <SelectValue placeholder="Select Mother Tongue" />
              </SelectTrigger>
              <SelectContent>
                {lookupsLoading && (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
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

          {/* Place of Birth */}
          <div className="space-y-2">
            <Label htmlFor="PlaceOfBirth" className="text-sm font-medium">Place of Birth (District)</Label>
            <Select
              value={formData.PlaceOfBirth?.toString() || ''}
              onValueChange={(value) => onChange({ ...formData, PlaceOfBirth: value ? parseInt(value) : undefined })}
              disabled={lookupsLoading}
            >
              <SelectTrigger id="PlaceOfBirth">
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                {lookupsLoading && (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
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
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Phone className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Contact Information</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Phone */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="ContactNo" className="text-sm font-medium">Phone Number</Label>
            <Input
              id="ContactNo"
              type="tel"
              value={formData.ContactNo}
              onChange={(e) => onChange({ ...formData, ContactNo: e.target.value })}
              placeholder="e.g., 0300-1234567"
            />
            <p className="text-xs text-muted-foreground">Primary contact number for appointments</p>
          </div>

          {/* CNIC */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="CNICNo" className="text-sm font-medium">CNIC Number</Label>
            <Input
              id="CNICNo"
              value={formData.CNICNo}
              onChange={(e) => onChange({ ...formData, CNICNo: e.target.value })}
              placeholder="xxxxx-xxxxxxx-x"
              maxLength={15}
            />
            <p className="text-xs text-muted-foreground">13-digit CNIC (optional but recommended)</p>
          </div>
        </div>
      </div>

      {/* Registration Details Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <IdCard className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Registration Details</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Registration Number */}
          <div className="space-y-2">
            <Label htmlFor="RegistrationNo" className="text-sm font-medium">Registration Number</Label>
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
            <Label htmlFor="RegistrationDate" className="text-sm font-medium">Registration Date</Label>
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

          {/* Hospital */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="Hospital" className="text-sm font-medium">Hospital</Label>
            <Select
              value={formData.Hospital?.toString() || ''}
              onValueChange={(value) => onChange({ ...formData, Hospital: value ? parseInt(value) : undefined })}
              disabled={lookupsLoading}
            >
              <SelectTrigger id="Hospital">
                <SelectValue placeholder="Select Hospital" />
              </SelectTrigger>
              <SelectContent>
                {lookupsLoading && (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
                {!lookupsLoading && lookups?.hospitals?.map((h) => (
                  <SelectItem key={h.ID} value={h.ID.toString()}>
                    {h.Hospitals}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Mail className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Additional Information</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Children Count */}
          <div className="space-y-2">
            <Label htmlFor="NoOfChidren" className="text-sm font-medium">Number of Children</Label>
            <Input
              id="NoOfChidren"
              type="number"
              value={formData.NoOfChidren}
              onChange={(e) => onChange({ ...formData, NoOfChidren: e.target.value })}
              placeholder="0"
              min="0"
            />
          </div>

          {/* Sibling Count */}
          <div className="space-y-2">
            <Label htmlFor="NoOfSibling" className="text-sm font-medium">Number of Siblings</Label>
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
    </div>
  );
}
