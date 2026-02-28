'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicInfoStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

export function BasicInfoStep({ formData, onChange, error }: BasicInfoStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Enter the patient&apos;s basic information. Fields marked with <span className="text-destructive">*</span> are required.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Full Name - Required */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="full_name">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => onChange({ ...formData, full_name: e.target.value })}
            placeholder="Enter patient's full name"
          />
        </div>

        {/* Age */}
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => onChange({ ...formData, age: e.target.value })}
            placeholder="Years"
          />
        </div>

        {/* Sex */}
        <div className="space-y-2">
          <Label htmlFor="sex">Sex</Label>
          <Select
            value={formData.sex}
            onValueChange={(value) => onChange({ ...formData, sex: value })}
          >
            <SelectTrigger id="sex">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange({ ...formData, phone: e.target.value })}
            placeholder="e.g., 0300-1234567"
          />
        </div>

        {/* CNIC */}
        <div className="space-y-2">
          <Label htmlFor="cnic">CNIC</Label>
          <Input
            id="cnic"
            value={formData.cnic}
            onChange={(e) => onChange({ ...formData, cnic: e.target.value })}
            placeholder="xxxxx-xxxxxxx-x"
          />
        </div>

        {/* Registration Number */}
        <div className="space-y-2">
          <Label htmlFor="registration_number">Registration Number</Label>
          <Input
            id="registration_number"
            value={formData.registration_number}
            onChange={(e) => onChange({ ...formData, registration_number: e.target.value })}
            placeholder="Auto-generated or manual"
          />
        </div>

        {/* Registration Date */}
        <div className="space-y-2">
          <Label htmlFor="registration_date">Registration Date</Label>
          <Input
            id="registration_date"
            type="date"
            value={formData.registration_date}
            onChange={(e) => onChange({ ...formData, registration_date: e.target.value })}
          />
        </div>

        {/* Marital Status */}
        <div className="space-y-2">
          <Label htmlFor="marital_status">Marital Status</Label>
          <Select
            value={formData.marital_status}
            onValueChange={(value) => onChange({ ...formData, marital_status: value })}
          >
            <SelectTrigger id="marital_status">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Single">Single</SelectItem>
              <SelectItem value="Married">Married</SelectItem>
              <SelectItem value="Widowed">Widowed</SelectItem>
              <SelectItem value="Divorced">Divorced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Education */}
        <div className="space-y-2">
          <Label htmlFor="education">Education</Label>
          <Input
            id="education"
            value={formData.education}
            onChange={(e) => onChange({ ...formData, education: e.target.value })}
            placeholder="Highest education level"
          />
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Input
            id="language"
            value={formData.language}
            onChange={(e) => onChange({ ...formData, language: e.target.value })}
            placeholder="Primary language"
          />
        </div>

        {/* Territory */}
        <div className="space-y-2">
          <Label htmlFor="territory">Territory/Region</Label>
          <Input
            id="territory"
            value={formData.territory}
            onChange={(e) => onChange({ ...formData, territory: e.target.value })}
            placeholder="City or region"
          />
        </div>

        {/* Children Count */}
        <div className="space-y-2">
          <Label htmlFor="children_count">Number of Children</Label>
          <Input
            id="children_count"
            type="number"
            value={formData.children_count}
            onChange={(e) => onChange({ ...formData, children_count: e.target.value })}
            placeholder="0"
            min="0"
          />
        </div>

        {/* Sibling Count */}
        <div className="space-y-2">
          <Label htmlFor="sibling_count">Number of Siblings</Label>
          <Input
            id="sibling_count"
            type="number"
            value={formData.sibling_count}
            onChange={(e) => onChange({ ...formData, sibling_count: e.target.value })}
            placeholder="0"
            min="0"
          />
        </div>
      </div>
    </div>
  );
}
