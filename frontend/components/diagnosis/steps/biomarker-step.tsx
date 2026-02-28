'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface BiomarkerStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

export function BiomarkerStep({ formData, onChange, error }: BiomarkerStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Biomarker Tests (Optional)</h3>
      <p className="text-sm text-muted-foreground">
        ER, PR, HER2, Ki-67 and IHC markers
      </p>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Accordion type="multiple" defaultValue={[]}>
        {/* Basic Biomarkers */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="er_status">ER Status</Label>
            <Select
              value={formData.er_status}
              onValueChange={(value) => onChange({ ...formData, er_status: value })}
            >
              <SelectTrigger id="er_status">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="er_percentage">ER Percentage</Label>
            <Input
              id="er_percentage"
              type="number"
              value={formData.er_percentage}
              onChange={(e) => onChange({ ...formData, er_percentage: e.target.value })}
              placeholder="%"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pr_status">PR Status</Label>
            <Select
              value={formData.pr_status}
              onValueChange={(value) => onChange({ ...formData, pr_status: value })}
            >
              <SelectTrigger id="pr_status">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="her2_status">HER2 Status</Label>
            <Select
              value={formData.her2_status}
              onValueChange={(value) => onChange({ ...formData, her2_status: value })}
            >
              <SelectTrigger id="her2_status">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="1+">1+</SelectItem>
                <SelectItem value="2+">2+</SelectItem>
                <SelectItem value="3+">3+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Optional: Proliferation Markers */}
        <AccordionItem value="proliferation">
          <AccordionTrigger>Proliferation Markers (Optional)</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="ki67_percentage">Ki-67 Percentage</Label>
                <Input
                  id="ki67_percentage"
                  type="number"
                  value={formData.ki67_percentage}
                  onChange={(e) => onChange({ ...formData, ki67_percentage: e.target.value })}
                  placeholder="%"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Optional: PR Percentage */}
        <AccordionItem value="pr-percentage">
          <AccordionTrigger>PR Percentage Details (Optional)</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="pr_percentage">PR Percentage</Label>
                <Input
                  id="pr_percentage"
                  type="number"
                  value={formData.pr_percentage}
                  onChange={(e) => onChange({ ...formData, pr_percentage: e.target.value })}
                  placeholder="%"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
