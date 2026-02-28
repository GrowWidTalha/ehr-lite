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

interface PathologyStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

export function PathologyStep({ formData, onChange, error }: PathologyStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pathology Report (Optional)</h3>
      <p className="text-sm text-muted-foreground">
        Tumor characteristics and surgical margins
      </p>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Accordion type="multiple" defaultValue={[]}>
        {/* Basic Pathology */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tumor_size">Tumor Size</Label>
            <Input
              id="tumor_size"
              type="text"
              value={formData.tumor_size}
              onChange={(e) => onChange({ ...formData, tumor_size: e.target.value })}
              placeholder="e.g., 2.5 cm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="depth">Depth</Label>
            <Input
              id="depth"
              type="text"
              value={formData.depth}
              onChange={(e) => onChange({ ...formData, depth: e.target.value })}
              placeholder="e.g., 1.2 cm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="margins">Margins</Label>
            <Select
              value={formData.margins}
              onValueChange={(value) => onChange({ ...formData, margins: value })}
            >
              <SelectTrigger id="margins">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">Clear</SelectItem>
                <SelectItem value="close">Close</SelectItem>
                <SelectItem value="involved">Involved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lvi">Lymphovascular Invasion</Label>
            <Select
              value={formData.lvi}
              onValueChange={(value) => onChange({ ...formData, lvi: value })}
            >
              <SelectTrigger id="lvi">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Optional: Lymph Node Details */}
        <AccordionItem value="lymph-nodes">
          <AccordionTrigger>Lymph Node Details (Optional)</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 md:grid-cols-2 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nodes_recovered">Nodes Recovered</Label>
                <Input
                  id="nodes_recovered"
                  type="number"
                  value={formData.nodes_recovered}
                  onChange={(e) => onChange({ ...formData, nodes_recovered: e.target.value })}
                  placeholder="Number of nodes"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nodes_involved">Nodes Involved</Label>
                <Input
                  id="nodes_involved"
                  type="number"
                  value={formData.nodes_involved}
                  onChange={(e) => onChange({ ...formData, nodes_involved: e.target.value })}
                  placeholder="Number of nodes"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Optional: Additional Pathology Details */}
        <AccordionItem value="additional-pathology">
          <AccordionTrigger>Additional Pathology Details (Optional)</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="pni">Perineural Invasion</Label>
                <Select
                  value={formData.pni}
                  onValueChange={(value) => onChange({ ...formData, pni: value })}
                >
                  <SelectTrigger id="pni">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
