'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Plus, Camera, Upload, X, Loader2, Video } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReportTypes } from '@/hooks/use-reports';
import { FileImage } from 'lucide-react';

interface ReportsStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

interface CameraDevice {
  deviceId: string;
  label: string;
}

interface ReportEntry {
  title: string;
  type: string;
  notes: string;
  report_date: string;
  image: File | null;
  previewUrl: string | null;
}

export function ReportsStep({ formData, onChange, error }: ReportsStepProps) {
  const reports = formData.reports || [];
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Form state for current report being added
  const [currentReport, setCurrentReport] = useState<ReportEntry>({
    title: '',
    type: 'pathology',
    notes: '',
    report_date: '',
    image: null,
    previewUrl: null,
  });

  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: reportTypes, isLoading: typesLoading } = useReportTypes();

  // Set default report type when types are loaded
  useEffect(() => {
    if (reportTypes && reportTypes.length > 0 && currentReport.type === 'pathology') {
      setCurrentReport((prev) => ({
        ...prev,
        type: reportTypes[0].report_type.trim(),
      }));
    }
  }, [reportTypes]);

  // Get all available cameras on mount
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
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Error enumerating cameras:', err);
      }
    };
    getCameras();
  }, []);

  // Attach stream to video element when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Start camera with selected device
  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

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

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  }, [stream]);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setUploadError('Camera not ready. Please try again.');
      return;
    }

    if (video.readyState !== 4 || !video.videoWidth || !video.videoHeight) {
      setUploadError('Video not ready. Please wait a moment and try again.');
      return;
    }

    setIsCapturing(true);

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (!context) {
        setUploadError('Failed to capture image. Please try again.');
        setIsCapturing(false);
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            const previewUrl = URL.createObjectURL(file);
            setCurrentReport((prev) => ({
              ...prev,
              image: file,
              previewUrl,
            }));
            stopCamera();
          } else {
            setUploadError('Failed to capture image. Please try again.');
          }
          setIsCapturing(false);
        },
        'image/jpeg',
        0.9
      );
    } catch (err) {
      console.error('Capture error:', err);
      setUploadError('Failed to capture image. Please try again.');
      setIsCapturing(false);
    }
  }, [stopCamera]);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError('File too large. Maximum size is 5MB.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload JPG or PNG images only.');
      return;
    }

    setUploadError(null);
    const url = URL.createObjectURL(file);
    setCurrentReport((prev) => ({
      ...prev,
      image: file,
      previewUrl: url,
    }));
  }, []);

  // Clear captured image
  const clearImage = useCallback(() => {
    setCurrentReport((prev) => ({
      ...prev,
      image: null,
      previewUrl: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUploadError(null);
  }, []);

  const handleAddReport = () => {
    if (!currentReport.title) {
      setUploadError('Please enter a report title');
      return;
    }

    if (!currentReport.image) {
      setUploadError('Please capture or select an image');
      return;
    }

    onChange({
      ...formData,
      reports: [...reports, currentReport],
    });

    // Reset form for next report
    setCurrentReport({
      title: '',
      type: reportTypes?.[0]?.report_type.trim() || 'pathology',
      notes: '',
      report_date: '',
      image: null,
      previewUrl: null,
    });
    setUploadError(null);
    setShowUploadForm(false);
  };

  const handleRemoveReport = (index: number) => {
    onChange({
      ...formData,
      reports: reports.filter((_report: any, i: number) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Upload patient reports with images. You can add more reports later from the patient&apos;s profile.
      </p>

      {!showUploadForm ? (
        <>
          <Button onClick={() => setShowUploadForm(true)} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Report
          </Button>

          {reports.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Reports to Upload ({reports.length})</h4>

              {reports.map((report: any, index: number) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium">{report.title}</h5>
                        <p className="text-sm text-muted-foreground">{report.type}</p>
                        {report.report_date && (
                          <p className="text-xs text-muted-foreground">Date: {report.report_date}</p>
                        )}
                        {report.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{report.notes}</p>
                        )}
                        {report.previewUrl && (
                          <img
                            src={report.previewUrl}
                            alt={report.title}
                            className="mt-2 rounded-md max-h-[150px] object-cover"
                          />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveReport(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {reports.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-md">
              <FileImage className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reports added yet.</p>
            </div>
          )}
        </>
      ) : (
        <>
          <Button variant="outline" onClick={() => setShowUploadForm(false)} className="mb-4">
            ← Back to Reports List
          </Button>

          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="report_title">Report Title *</Label>
                  <Input
                    id="report_title"
                    value={currentReport.title}
                    onChange={(e) => setCurrentReport({ ...currentReport, title: e.target.value })}
                    placeholder="e.g., Initial Biopsy Report"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report_type">Report Type</Label>
                  {typesLoading ? (
                    <div className="text-sm text-muted-foreground">Loading report types...</div>
                  ) : reportTypes && reportTypes.length > 0 ? (
                    <Select
                      value={currentReport.type}
                      onValueChange={(value) => setCurrentReport({ ...currentReport, type: value })}
                    >
                      <SelectTrigger id="report_type">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes
                          .filter((type: any, index: number, self: any[]) =>
                            index === self.findIndex((t) => t.report_type.trim() === type.report_type.trim())
                          )
                          .map((type: any) => (
                            <SelectItem key={type.ID} value={type.report_type.trim()}>
                              {type.report_type.trim()}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-destructive">Failed to load report types</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report_date">Report Date</Label>
                  <Input
                    id="report_date"
                    type="date"
                    value={currentReport.report_date}
                    onChange={(e) => setCurrentReport({ ...currentReport, report_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="report_notes">Notes (Optional)</Label>
                <textarea
                  id="report_notes"
                  value={currentReport.notes}
                  onChange={(e) => setCurrentReport({ ...currentReport, notes: e.target.value })}
                  placeholder="Additional notes about this report..."
                  className="w-full min-h-[60px] px-3 py-2 rounded-md border border-input bg-transparent text-sm"
                />
              </div>

              {/* Image Capture/Upload */}
              <div className="space-y-3">
                <Label>Report Image *</Label>

                {cameras.length > 1 && !showCamera && !currentReport.previewUrl && (
                  <div className="space-y-2">
                    <Label htmlFor="camera_select" className="text-sm text-muted-foreground">
                      Select Camera
                    </Label>
                    <div className="flex gap-2">
                      <select
                        id="camera_select"
                        value={selectedCamera}
                        onChange={(e) => setSelectedCamera(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
                      >
                        {cameras.map((cam) => (
                          <option key={cam.deviceId} value={cam.deviceId}>
                            {cam.label}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        onClick={startCamera}
                        variant="outline"
                        className="shrink-0"
                      >
                        <Video className="mr-2 h-4 w-4" />
                        Start Camera
                      </Button>
                    </div>
                  </div>
                )}

                {showCamera && stream ? (
                  <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                        onLoadedMetadata={() => {}}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={capturePhoto}
                        disabled={isCapturing}
                        className="flex-1"
                      >
                        {isCapturing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Capturing...
                          </>
                        ) : (
                          <>
                            <Camera className="mr-2 h-4 w-4" />
                            Capture Photo
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={stopCamera}
                        disabled={isCapturing}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                ) : currentReport.previewUrl ? (
                  <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden border">
                      <img
                        src={currentReport.previewUrl}
                        alt="Captured report"
                        className="w-full max-h-[350px] object-contain bg-muted"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={clearImage}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearImage}
                      className="w-full"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Retake Photo
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {cameras.length <= 1 && (
                      <Button
                        type="button"
                        onClick={startCamera}
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center gap-2"
                      >
                        <Camera className="h-6 w-6" />
                        <span className="text-sm">Open Camera</span>
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-24 flex flex-col items-center justify-center gap-2"
                    >
                      <Upload className="h-6 w-6" />
                      <span className="text-sm">Choose File</span>
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      capture="environment"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {uploadError}
                </div>
              )}

              <Button
                onClick={handleAddReport}
                disabled={!currentReport.title || !currentReport.image}
                className="w-full"
              >
                Add Report
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
