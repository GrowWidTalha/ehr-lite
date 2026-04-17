/**
 * Export Button Component
 *
 * Button to export all patient data to Excel format.
 * Shows loading state during export and handles errors.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { exportApi } from '@/lib/api';
import { toast } from 'sonner';

interface ExportButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
  label?: string;
  onExportComplete?: (filename: string) => void;
  onError?: (error: string) => void;
}

export function ExportButton({
  variant = 'outline',
  size = 'default',
  className = '',
  showLabel = true,
  label = 'Export to Excel',
  onExportComplete,
  onError,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const result = await exportApi.patients();

      if (result.success) {
        toast.success(`Exported ${result.filename || 'patient data'} successfully`, {
          description: 'Your Excel file has been downloaded.',
        });
        onExportComplete?.(result.filename || 'export.xlsx');
      } else {
        const errorMsg = result.error || 'Failed to export data';
        toast.error('Export failed', {
          description: errorMsg,
        });
        onError?.(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error('Export failed', {
        description: errorMsg,
      });
      onError?.(errorMsg);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {showLabel && 'Exporting...'}
        </>
      ) : (
        <>
          <FileSpreadsheet className="h-4 w-4" />
          {showLabel && label}
        </>
      )}
    </Button>
  );
}

// Icon-only version for use in toolbars
export function ExportIconButton(props: Omit<ExportButtonProps, 'showLabel' | 'size'>) {
  return <ExportButton {...props} size="icon" showLabel={false} />;
}

// Small version for inline actions
export function ExportButtonSmall(props: Omit<ExportButtonProps, 'size'>) {
  return <ExportButton {...props} size="sm" />;
}

export default ExportButton;
