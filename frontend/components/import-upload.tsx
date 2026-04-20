/**
 * Import Upload Component
 *
 * Component for uploading Excel files to import patient data.
 *
 * @module components/import-upload
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileSpreadsheet, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface ImportResult {
  success: boolean;
  data?: {
    stats: {
      total: number;
      successCount: number;
      errorCount: number;
      duration: string;
    };
    errors?: Array<{
      row: number;
      name: string;
      error: string;
    }>;
  };
  error?: string;
}

interface ImportStats {
  active: boolean;
  imports: Array<{
    id: string;
    status: string;
    file?: string;
  }>;
}

export function ImportUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (isValidExcelFile(droppedFile)) {
        setFile(droppedFile);
        setResult(null);
        setProgress(0);
      } else {
        toast.error('Please upload an Excel file (.xlsx or .xls)');
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (isValidExcelFile(selectedFile)) {
        setFile(selectedFile);
        setResult(null);
        setProgress(0);
      } else {
        toast.error('Please upload an Excel file (.xlsx or .xls)');
      }
    }
  };

  const isValidExcelFile = (file: File): boolean => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    const ext = file.name.split('.').pop()?.toLowerCase();
    return validTypes.includes(file.type) || ext === 'xlsx' || ext === 'xls';
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setProgress(0);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/import/upload`, {
        method: 'POST',
        body: formData
      });

      const data: ImportResult = await response.json();

      setProgress(100);
      setResult(data);

      if (data.success) {
        toast.success(`Import completed: ${data.data?.stats.successCount} patients imported successfully`);
      } else {
        toast.error(data.error || 'Import failed');
      }
    } catch (error) {
      toast.error('Import failed. Please try again.');
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setImporting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Patient Data
        </CardTitle>
        <CardDescription>
          Upload an Excel file (.xlsx) with patient data to import into the system.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/10'
              : file
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={importing}
          />

          {!file ? (
            <div className="space-y-2">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium">Drop your Excel file here, or click to browse</p>
              <p className="text-xs text-muted-foreground">Supports .xlsx and .xls files</p>
            </div>
          ) : (
            <div className="space-y-2">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setResult(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                disabled={importing}
              >
                Remove
              </Button>
            </div>
          )}
        </div>

        {/* Import Button */}
        {file && (
          <Button
            onClick={handleImport}
            disabled={importing}
            className="w-full"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import Patients
              </>
            )}
          </Button>
        )}

        {/* Progress Bar */}
        {importing && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              Processing file... This may take a few minutes.
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`p-4 rounded-lg border ${
            result.success
              ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
              : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
          }`}>
            {result.success ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                  <p className="font-medium text-green-900 dark:text-green-100">Import Completed Successfully</p>
                </div>
                <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <p>Total rows: <strong>{result.data?.stats.total}</strong></p>
                  <p>Successfully imported: <strong>{result.data?.stats.successCount}</strong></p>
                  {(result.data?.stats.errorCount ?? 0) > 0 && (
                    <p>Skipped/Errors: <strong>{result.data?.stats.errorCount}</strong></p>
                  )}
                  <p className="text-xs">Duration: {result.data?.stats.duration}</p>
                </div>

                {/* Errors */}
                {result.data?.errors && result.data.errors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                    <p className="text-xs font-medium text-green-900 dark:text-green-100 mb-2">
                      Some rows had errors:
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {result.data.errors.map((err, idx) => (
                        <div key={idx} className="text-xs text-green-800 dark:text-green-300">
                          Row {err.row} ({err.name}): {err.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
                <p className="font-medium text-red-900 dark:text-red-100">
                  {result.error || 'Import Failed'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Excel Format Requirements:</p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>File must be in Onco format (82 columns)</li>
                <li>First row must contain column headers</li>
                <li>Required columns: Reg No, Name & Sur Name</li>
                <li>Patient names matching existing records will be skipped</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ImportUpload;
