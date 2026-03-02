'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, TestTube2 } from 'lucide-react';

interface BiomarkerStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

export function BiomarkerStep({ formData, onChange, error }: BiomarkerStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Biomarker Tests</h3>
        <p className="text-sm text-muted-foreground">
          Immunohistochemistry (IHC) markers for treatment planning
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Biomarkers Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <TestTube2 className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">Primary Receptors</h4>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* ER Status */}
          <div className="space-y-2">
            <Label htmlFor="er_status" className="text-sm font-medium">Estrogen Receptor (ER)</Label>
            <Select
              value={formData.er_status}
              onValueChange={(value) => onChange({ ...formData, er_status: value })}
            >
              <SelectTrigger id="er_status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Indicates if cancer cells have estrogen receptors
            </p>
          </div>

          {/* ER Percentage */}
          <div className="space-y-2">
            <Label htmlFor="er_percentage" className="text-sm font-medium">ER Intensity (%)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="er_percentage"
                type="number"
                value={formData.er_percentage}
                onChange={(e) => onChange({ ...formData, er_percentage: e.target.value })}
                placeholder="0-100"
                min="0"
                max="100"
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-10">%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {formData.er_percentage && parseInt(formData.er_percentage) >= 1
                ? 'Positive (≥1% staining)'
                : 'Positive if ≥1%'}
            </p>
          </div>

          {/* PR Status */}
          <div className="space-y-2">
            <Label htmlFor="pr_status" className="text-sm font-medium">Progesterone Receptor (PR)</Label>
            <Select
              value={formData.pr_status}
              onValueChange={(value) => onChange({ ...formData, pr_status: value })}
            >
              <SelectTrigger id="pr_status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Indicates if cancer cells have progesterone receptors
            </p>
          </div>

          {/* PR Percentage */}
          <div className="space-y-2">
            <Label htmlFor="pr_percentage" className="text-sm font-medium">PR Intensity (%)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="pr_percentage"
                type="number"
                value={formData.pr_percentage}
                onChange={(e) => onChange({ ...formData, pr_percentage: e.target.value })}
                placeholder="0-100"
                min="0"
                max="100"
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-10">%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Percentage of cells stained for PR
            </p>
          </div>
        </div>

        {/* Hormone Status Summary Card */}
        {(formData.er_status === 'positive' || formData.pr_status === 'positive') && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
              Hormone Receptor Status
            </p>
            <p className="text-xs text-muted-foreground">
              {formData.er_status === 'positive' && formData.pr_status === 'positive'
                ? 'ER+/PR+ - Likely to respond to hormone therapy'
                : formData.er_status === 'positive'
                  ? 'ER+/PR- - May respond to hormone therapy'
                  : formData.pr_status === 'positive'
                    ? 'ER-/PR+ - May respond to hormone therapy'
                    : ''}
            </p>
          </div>
        )}
      </div>

      {/* HER2 Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <TestTube2 className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">HER2 Status</h4>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* HER2 Status */}
          <div className="space-y-2">
            <Label htmlFor="her2_status" className="text-sm font-medium">HER2 Score (IHC)</Label>
            <Select
              value={formData.her2_status}
              onValueChange={(value) => onChange({ ...formData, her2_status: value })}
            >
              <SelectTrigger id="her2_status">
                <SelectValue placeholder="Select score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 (Negative)</SelectItem>
                <SelectItem value="1+">1+ (Negative)</SelectItem>
                <SelectItem value="2+">2+ (Equivocal)</SelectItem>
                <SelectItem value="3+">3+ (Positive)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Human Epidermal Growth Factor Receptor 2
            </p>
          </div>
        </div>

        {/* HER2 Interpretation Card */}
        {formData.her2_status && (
          <div className={`p-4 rounded-lg border ${
            formData.her2_status === '3+'
              ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800'
              : formData.her2_status === '2+'
                ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-yellow-200 dark:border-yellow-800'
                : 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800'
          }`}>
            <p className="text-sm font-medium mb-1">
              HER2 {formData.her2_status} - {
                formData.her2_status === '0' || formData.her2_status === '1+'
                  ? 'Negative'
                  : formData.her2_status === '2+'
                    ? 'Equivocal (FISH test recommended)'
                    : 'Positive'
              }
            </p>
            <p className="text-xs text-muted-foreground">
              {formData.her2_status === '0' && 'No staining observed - HER2 negative'}
              {formData.her2_status === '1+' && 'Weak/barely perceptible staining - HER2 negative'}
              {formData.her2_status === '2+' && 'Moderate staining - FISH testing recommended'}
              {formData.her2_status === '3+' && 'Strong complete staining - HER2 positive, eligible for targeted therapy'}
            </p>
          </div>
        )}
      </div>

      {/* Proliferation Markers Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <TestTube2 className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">Proliferation Markers</h4>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Ki-67 Percentage */}
          <div className="space-y-2">
            <Label htmlFor="ki67_percentage" className="text-sm font-medium">Ki-67 Index (%)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="ki67_percentage"
                type="number"
                value={formData.ki67_percentage}
                onChange={(e) => onChange({ ...formData, ki67_percentage: e.target.value })}
                placeholder="0-100"
                min="0"
                max="100"
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-10">%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Proliferation marker indicating tumor growth rate
            </p>
          </div>
        </div>

        {/* Ki-67 Interpretation */}
        {formData.ki67_percentage && (
          <div className={`p-3 rounded-md border ${
            parseFloat(formData.ki67_percentage) < 14
              ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
              : parseFloat(formData.ki67_percentage) < 30
                ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
                : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
          }`}>
            <p className="text-xs text-muted-foreground">
              Ki-67 Index: <span className="font-semibold">{formData.ki67_percentage}%</span>
              {' - '}
              {parseFloat(formData.ki67_percentage) < 14
                ? 'Low proliferation'
                : parseFloat(formData.ki67_percentage) < 30
                  ? 'Intermediate proliferation'
                  : 'High proliferation'}
            </p>
          </div>
        )}
      </div>

      {/* Clinical Summary */}
      {(formData.er_status || formData.pr_status || formData.her2_status) && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Biomarker Summary</p>
          <div className="flex flex-wrap gap-2">
            {formData.er_status && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                formData.er_status === 'positive' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
              }`}>
                ER {formData.er_status === 'positive' ? '+' : '-'}
              </span>
            )}
            {formData.pr_status && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                formData.pr_status === 'positive' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
              }`}>
                PR {formData.pr_status === 'positive' ? '+' : '-'}
              </span>
            )}
            {formData.her2_status && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                formData.her2_status === '3+' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
              }`}>
                HER2 {formData.her2_status}
              </span>
            )}
            {formData.ki67_percentage && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                Ki-67 {formData.ki67_percentage}%
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
