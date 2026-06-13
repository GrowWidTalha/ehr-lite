// Unified Reports Upload Step - replaces biomarker + imaging steps
'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Camera,
  Upload,
  X,
  Loader2,
  Video,
  Check,
  CheckCircle2,
  ChevronDown,
  Microscope,
  FlaskConical,
  ScanLine,
  Pill,
  ClipboardList,
  FileText,
  Info,
} from 'lucide-react';
import { useReportTypes } from '@/hooks/use-report-types';
import { useUploadReport } from '@/hooks/use-reports';
import { STUDY_TYPES } from '@/lib/utils';
import { toast } from 'sonner';

// Category config: icon + display name
const CATEGORY_CONFIG: Record<string, { icon: any; label: string; order: number }> = {
  'Pathology': { icon: Microscope, label: 'Pathology', order: 1 },
  'Lab': { icon: FlaskConical, label: 'Lab', order: 2 },
  'Imaging': { icon: ScanLine, label: 'Imaging', order: 3 },
  'Treatment': { icon: Pill, label: 'Treatment', order: 4 },
  'Clinical': { icon: ClipboardList, label: 'Clinical', order: 5 },
  'Other': { icon: FileText, label: 'Other', order: 6 },
};

interface CameraDevice {
  deviceId: string;
  label: string;
}

interface ReportsUploadStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
  patientId?: string;
}

export function ReportsUploadStep({ formData, onChange, error, patientId }: ReportsUploadStepProps) {
  const uploadReport = useUploadReport();
  const { data: reportTypes, isLoading: typesLoading } = useReportTypes();

  // Upload state
  const [selectedReportType, setSelectedReportType] = useState('');
  const [activeCategory, setActiveCategory] = useState('Pathology');
  const [notes, setNotes] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Camera state
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Collapsible imaging details
  const [imagingOpen, setImagingOpen] = useState(false);

  // Uploaded reports from formData
  const uploadedReports = useMemo(() => formData.uploadedReports || [], [formData.uploadedReports]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sorted categories from report types data
  const sortedCategories = useMemo(() => {
    if (!reportTypes) return [];
    return Object.keys(reportTypes).sort((a, b) => {
      const aOrder = CATEGORY_CONFIG[a]?.order ?? 99;
      const bOrder = CATEGORY_CONFIG[b]?.order ?? 99;
      return aOrder - bOrder;
    });
  }, [reportTypes]);

  // Set default report type when types load or category changes
  useEffect(() => {
    if (reportTypes && activeCategory && reportTypes[activeCategory]?.length > 0 && !selectedReportType) {
      setSelectedReportType(reportTypes[activeCategory][0].code);
    }
  }, [reportTypes, activeCategory]);

  // Camera enumeration
  useEffect(() => {
    const getCameras = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices
          .filter((d: MediaDeviceInfo) => d.kind === 'videoinput')
          .map((d: MediaDeviceInfo) => ({
            deviceId: d.deviceId,
            label: d.label || `Camera ${devices.filter((e: MediaDeviceInfo) => e.kind === 'videoinput').indexOf(d) + 1}`,
          }));
        setCameras(videoDevices);
        if (videoDevices.length > 0) setSelectedCamera(videoDevices[0].deviceId);
      } catch (err) {
        console.error('Error enumerating cameras:', err);
      }
    };
    getCameras();
  }, []);

  // Attach stream to video
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    try {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      const constraints: MediaStreamConstraints = {
        video: selectedCamera
          ? { deviceId: { exact: selectedCamera }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setShowCamera(true);
      setUploadError(null);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setUploadError('Camera not available. Please use file upload instead.');
      setShowCamera(false);
    }
  }, [selectedCamera, stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setShowCamera(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) { setUploadError('Camera not ready.'); return; }
    if (video.readyState !== 4 || !video.videoWidth) { setUploadError('Video not ready. Wait a moment.'); return; }
    setIsCapturing(true);
    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { setUploadError('Capture failed.'); setIsCapturing(false); return; }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);
      setPreviewUrl(dataUrl);
      stopCamera();
    } catch (err) {
      setUploadError('Failed to capture image.');
    }
    setIsCapturing(false);
  }, [stopCamera]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setUploadError('File too large (max 5MB).'); return; }
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) { setUploadError('Only JPG/PNG allowed.'); return; }
    setUploadError(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setCapturedImage(url);
  }, []);

  const clearImage = useCallback(() => {
    setCapturedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadError(null);
  }, []);

  // Handle report type card selection
  const handleTypeSelect = (code: string) => {
    setSelectedReportType(code);
  };

  // Submit one report upload
  const handleAttach = async () => {
    if (!previewUrl) { setUploadError('Please capture or select an image first.'); return; }
    if (!selectedReportType) { setUploadError('Please select a report type.'); return; }

    try {
      const formDataObj = new FormData();
      formDataObj.append('report_type', selectedReportType);
      if (notes) formDataObj.append('notes', notes);
      if (reportDate) formDataObj.append('report_date', reportDate);

      const response = await fetch(previewUrl);
      const blob = await response.blob();
      formDataObj.append('images', blob, 'report.jpg');

      await uploadReport.mutateAsync({ patientId: parseInt(patientId || '0'), formData: formDataObj });

      // Find category for this type
      let reportCategory = 'Other';
      if (reportTypes) {
        for (const [cat, types] of Object.entries(reportTypes)) {
          if ((types as any[]).some((t: any) => t.code === selectedReportType)) {
            reportCategory = cat;
            break;
          }
        }
      }

      const reportData = {
        id: Date.now(),
        reportType: selectedReportType,
        reportTypeName: (reportTypes?.[reportCategory] as any[])?.find((t: any) => t.code === selectedReportType)?.name || selectedReportType,
        category: reportCategory,
        notes,
        reportDate,
        imageUrl: previewUrl,
      };

      // Update parent form data
      const updated = [...uploadedReports, reportData];
      onChange({ ...formData, uploadedReports: updated });

      toast.success(`${reportData.reportTypeName} attached`);

      // Reset upload form state
      setNotes('');
      setReportDate('');
      setCapturedImage(null);
      setPreviewUrl(null);
      setUploadError(null);
      // Keep selectedReportType so user can upload another of same type
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('Failed to upload report. Please try again.');
    }
  };

  // Remove an uploaded report from the list
  const handleRemoveReport = (index: number) => {
    const updated = uploadedReports.filter((_: any, i: number) => i !== index);
    onChange({ ...formData, uploadedReports: updated });
  };

  // Summary counts by category
  const summaryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    uploadedReports.forEach((r: any) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return counts;
  }, [uploadedReports]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Reports Upload</h3>
        <p className="text-sm text-muted-foreground">
          Upload pathology, lab, imaging, and other reports to support this diagnosis
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Summary */}
      {uploadedReports.length > 0 && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h4 className="font-medium text-green-900 dark:text-green-100">
                {uploadedReports.length} Report{uploadedReports.length > 1 ? 's' : ''} Attached
              </h4>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(summaryCounts).map(([cat, count]) => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {cat}: {count}
                </Badge>
              ))}
            </div>
            <div className="space-y-1.5">
              {uploadedReports.map((report: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-sm bg-white dark:bg-gray-800 rounded-md px-3 py-1.5 border">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    <span className="font-medium">{report.reportTypeName}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{report.category}</Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveReport(idx)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Tabs + Report Type Grid + Upload */}
      {typesLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading report types...</div>
      ) : reportTypes && sortedCategories.length > 0 ? (
        <Tabs value={activeCategory} onValueChange={(cat) => { setActiveCategory(cat); setSelectedReportType(''); }}>
          <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {sortedCategories.map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              const Icon = config?.icon || FileText;
              const count = reportTypes[cat]?.length || 0;
              return (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="gap-1.5 data-[state=active]:bg-background text-xs px-3 py-2"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {config?.label || cat}
                  <span className="text-[10px] text-muted-foreground">({count})</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {sortedCategories.map((cat) => {
            const types = reportTypes[cat] || [];
            return (
              <TabsContent key={cat} value={cat} className="space-y-4 mt-4">
                {/* Report Type Card Grid */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Select Report Type</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {types.map((type: any) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleTypeSelect(type.code)}
                        className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                          selectedReportType === type.code
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20 font-medium'
                            : 'border-border hover:border-primary/40 hover:bg-muted/50'
                        }`}
                      >
                        <div className="font-medium text-xs leading-tight">{type.name}</div>
                        {type.description && (
                          <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight line-clamp-2">
                            {type.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Camera / Upload Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Capture or Upload Image</Label>

                  {/* Camera selector (multi-camera) */}
                  {cameras.length > 1 && !showCamera && !previewUrl && (
                    <div className="flex gap-2">
                      <select
                        value={selectedCamera}
                        onChange={(e) => setSelectedCamera(e.target.value)}
                        className="flex-1 px-2 py-1.5 text-xs rounded-md border border-input bg-background"
                      >
                        {cameras.map((cam) => (
                          <option key={cam.deviceId} value={cam.deviceId}>{cam.label}</option>
                        ))}
                      </select>
                      <Button type="button" onClick={startCamera} variant="outline" size="sm">
                        <Video className="mr-1 h-3.5 w-3.5" /> Start
                      </Button>
                    </div>
                  )}

                  {/* Camera live view */}
                  {showCamera && stream && (
                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" onClick={capturePhoto} disabled={isCapturing} size="sm" className="flex-1">
                          {isCapturing ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Capturing...</> : <><Camera className="mr-1 h-4 w-4" /> Capture</>}
                        </Button>
                        <Button type="button" variant="outline" onClick={stopCamera} disabled={isCapturing} size="sm">Cancel</Button>
                      </div>
                    </div>
                  )}

                  {/* Image preview */}
                  {previewUrl && (
                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden border">
                        <img src={previewUrl} alt="Preview" className="w-full max-h-[200px] object-contain bg-muted" />
                        <Button type="button" variant="ghost" size="sm" onClick={clearImage} className="absolute top-1 right-1 h-6 w-6 p-0">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Upload / Camera buttons (when no preview) */}
                  {!previewUrl && !showCamera && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button type="button" onClick={startCamera} variant="outline" size="sm" className="h-14 flex flex-col items-center justify-center gap-1">
                        <Camera className="h-5 w-5" />
                        <span className="text-xs">Camera</span>
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="h-14 flex flex-col items-center justify-center gap-1">
                        <Upload className="h-5 w-5" />
                        <span className="text-xs">Upload</span>
                      </Button>
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFileSelect} className="hidden" />
                    </div>
                  )}
                </div>

                {/* Date + Notes */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Report Date</Label>
                    <Input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Notes</Label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional notes..."
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Attach button */}
                {previewUrl && selectedReportType && (
                  <Button
                    type="button"
                    onClick={handleAttach}
                    disabled={uploadReport.isPending}
                    className="w-full"
                    size="sm"
                  >
                    {uploadReport.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                    ) : (
                      <><Check className="mr-2 h-4 w-4" /> Attach {reportTypes[cat]?.find((t: any) => t.code === selectedReportType)?.name || 'Report'}</>
                    )}
                  </Button>
                )}

                <canvas ref={canvasRef} className="hidden" />
              </TabsContent>
            );
          })}
        </Tabs>
      ) : (
        <div className="text-center py-8 text-destructive text-sm">Failed to load report types</div>
      )}

      {/* Upload error */}
      {uploadError && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{uploadError}</div>
      )}

      {/* Collapsible: Manual Imaging Details */}
      <Collapsible open={imagingOpen} onOpenChange={setImagingOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-between">
            <span>Manual Imaging Details (optional)</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${imagingOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="study_type" className="text-xs">Study Type</Label>
              <Select
                value={formData.study_type}
                onValueChange={(value) => onChange({ ...formData, study_type: value })}
              >
                <SelectTrigger id="study_type" className="h-8 text-sm">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {STUDY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="study_date" className="text-xs">Study Date</Label>
              <Input
                id="study_date"
                type="date"
                value={formData.study_date}
                onChange={(e) => onChange({ ...formData, study_date: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="findings" className="text-xs">Findings</Label>
            <Textarea
              id="findings"
              value={formData.findings}
              onChange={(e) => onChange({ ...formData, findings: e.target.value })}
              placeholder="Enter imaging findings..."
              className="min-h-[60px] text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="indication" className="text-xs">Indication</Label>
            <Textarea
              id="indication"
              value={formData.indication}
              onChange={(e) => onChange({ ...formData, indication: e.target.value })}
              placeholder="Reason for imaging..."
              className="min-h-[48px] text-sm"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
