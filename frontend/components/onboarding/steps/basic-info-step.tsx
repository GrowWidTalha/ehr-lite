'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone, IdCard, Calendar } from 'lucide-react';

interface BasicInfoStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

export function BasicInfoStep({ formData, onChange, error }: BasicInfoStepProps) {
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
            <Label htmlFor="full_name" className="text-sm font-medium">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => onChange({ ...formData, full_name: e.target.value })}
              placeholder="Enter patient's full name"
              className={error && !formData.full_name ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {error && !formData.full_name && (
              <p className="text-xs text-destructive">Full name is required</p>
            )}
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age" className="text-sm font-medium">Age</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => onChange({ ...formData, age: e.target.value })}
              placeholder="Years"
              min="0"
              max="150"
            />
            <p className="text-xs text-muted-foreground">Patient&apos;s age in years</p>
          </div>

          {/* Sex */}
          <div className="space-y-2">
            <Label htmlFor="sex" className="text-sm font-medium">Sex</Label>
            <Select
              value={formData.sex}
              onValueChange={(value) => onChange({ ...formData, sex: value })}
            >
              <SelectTrigger id="sex">
                <SelectValue placeholder="Select sex" />
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
            <Label htmlFor="marital_status" className="text-sm font-medium">Marital Status</Label>
            <Select
              value={formData.marital_status}
              onValueChange={(value) => onChange({ ...formData, marital_status: value })}
            >
              <SelectTrigger id="marital_status">
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

          {/* Education */}
          <div className="space-y-2">
            <Label htmlFor="education" className="text-sm font-medium">Education</Label>
            <Input
              id="education"
              value={formData.education}
              onChange={(e) => onChange({ ...formData, education: e.target.value })}
              placeholder="e.g., Bachelor's, High School"
            />
            <p className="text-xs text-muted-foreground">Highest education level completed</p>
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
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => onChange({ ...formData, phone: e.target.value })}
              placeholder="e.g., 0300-1234567"
            />
            <p className="text-xs text-muted-foreground">Primary contact number for appointments</p>
          </div>

          {/* CNIC */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="cnic" className="text-sm font-medium">CNIC Number</Label>
            <Input
              id="cnic"
              value={formData.cnic}
              onChange={(e) => onChange({ ...formData, cnic: e.target.value })}
              placeholder="xxxxx-xxxxxxx-x"
              maxLength={15}
            />
            <p className="text-xs text-muted-foreground">13-digit CNIC (optional but recommended)</p>
          </div>

          {/* Territory/Region */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="territory" className="text-sm font-medium">Territory/Region</Label>
            <Input
              id="territory"
              value={formData.territory}
              onChange={(e) => onChange({ ...formData, territory: e.target.value })}
              placeholder="e.g., Lahore, Karachi"
            />
            <p className="text-xs text-muted-foreground">City or region of residence</p>
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
            <Label htmlFor="registration_number" className="text-sm font-medium">Registration Number</Label>
            <Input
              id="registration_number"
              value={formData.registration_number}
              onChange={(e) => onChange({ ...formData, registration_number: e.target.value })}
              placeholder="Leave blank for auto"
            />
            <p className="text-xs text-muted-foreground">Leave blank for automatic generation</p>
          </div>

          {/* Registration Date */}
          <div className="space-y-2">
            <Label htmlFor="registration_date" className="text-sm font-medium">Registration Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="registration_date"
                type="date"
                value={formData.registration_date}
                onChange={(e) => onChange({ ...formData, registration_date: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Mail className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Additional Information</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language" className="text-sm font-medium">Primary Language</Label>
            <Input
              id="language"
              value={formData.language}
              onChange={(e) => onChange({ ...formData, language: e.target.value })}
              placeholder="e.g., Urdu, English"
            />
          </div>

          {/* Children Count */}
          <div className="space-y-2">
            <Label htmlFor="children_count" className="text-sm font-medium">Number of Children</Label>
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
            <Label htmlFor="sibling_count" className="text-sm font-medium">Number of Siblings</Label>
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
    </div>
  );
}
