// Streamlined Pathology Step - Only essential staging data
'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, FileText, Upload } from 'lucide-react';

interface PathologyStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

export function PathologyStep({ formData, onChange, error }: PathologyStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Pathology & Staging</h3>
        <p className="text-sm text-muted-foreground">
          Essential staging information. For detailed pathology reports, use the Reports section.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Info Card */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            Upload Pathology Reports Instead
          </p>
          <p className="text-xs text-muted-foreground">
            For detailed biomarker testing (ER, PR, HER2, Ki-67), tumor measurements, and molecular analysis, upload the official pathology reports in the Reports section above. This entry is for essential staging data only.
          </p>
        </div>
      </div>

      {/* Essential Staging Fields */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Info className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">Essential Staging Data</h4>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Nodes Involved - Critical for TNM staging */}
          <div className="space-y-2">
            <Label htmlFor="nodes_involved" className="text-sm font-medium">
              Nodes Involved <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nodes_involved"
              type="number"
              value={formData.nodes_involved}
              onChange={(e) => onChange({ ...formData, nodes_involved: e.target.value })}
              placeholder="Number of positive nodes"
              min="0"
            />
            <p className="text-xs text-muted-foreground">
              Required for N stage determination
            </p>
          </div>

          {/* Nodes Recovered - Critical for TNM staging */}
          <div className="space-y-2">
            <Label htmlFor="nodes_recovered" className="text-sm font-medium">
              Nodes Recovered/Examined <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nodes_recovered"
              type="number"
              value={formData.nodes_recovered}
              onChange={(e) => onChange({ ...formData, nodes_recovered: e.target.value })}
              placeholder="Total nodes examined"
              min="0"
            />
            <p className="text-xs text-muted-foreground">
              Total nodes removed for examination
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Margins - Important for surgical outcome */}
          <div className="space-y-2">
            <Label htmlFor="margins">Surgical Margins</Label>
            <Select
              value={formData.margins}
              onValueChange={(value) => onChange({ ...formData, margins: value })}
            >
              <SelectTrigger id="margins">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">Clear</SelectItem>
                <SelectItem value="close">Close (&lt;1mm)</SelectItem>
                <SelectItem value="involved">Involved</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Surgical margin status
            </p>
          </div>

          {/* LVI - Important for prognosis */}
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
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Lymphatic/vascular invasion
            </p>
          </div>

          {/* PNI - Important for prognosis */}
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
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Nerve invasion
            </p>
          </div>
        </div>

        {/* Node Ratio Display */}
        {formData.nodes_involved && formData.nodes_recovered && parseInt(formData.nodes_recovered) > 0 && (
          <div className={`p-3 rounded-md border ${
            (parseInt(formData.nodes_involved) / parseInt(formData.nodes_recovered)) < 0.3
              ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
              : (parseInt(formData.nodes_involved) / parseInt(formData.nodes_recovered)) < 0.7
                ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
                : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
          }`}>
            <p className="text-xs font-medium mb-1">
              Lymph Node Ratio: {parseInt(formData.nodes_involved)}/{parseInt(formData.nodes_recovered)} =
              {((parseInt(formData.nodes_involved) / parseInt(formData.nodes_recovered)) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {(parseInt(formData.nodes_involved) / parseInt(formData.nodes_recovered)) < 0.3
                ? 'Favorable prognosis'
                : (parseInt(formData.nodes_involved) / parseInt(formData.nodes_recovered)) < 0.7
                  ? 'Intermediate risk'
                  : 'High ratio - consider closer examination'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
