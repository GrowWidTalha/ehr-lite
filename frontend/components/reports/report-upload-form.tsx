'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Camera, Loader2, Video } from 'lucide-react';
import { useReportTypes } from '@/hooks/use-report-types';
import { useUploadReport } from '@/hooks/use-reports';
import { toast } from 'sonner';

interface CameraDevice {
  deviceId: string;
  label: string;
}

interface ReportUploadFormProps {
  patientId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  title?: string;
  description?: string;
}

export function ReportUploadForm({
  patientId,
  onSuccess,
  onCancel,
  submitLabel = 'Upload Report',
  title = 'Upload Report',
  description = 'Capture or upload a patient report (pathology, imaging, lab results)'
}: ReportUploadFormProps) {
  const uploadReport = useUploadReport();
  const { data: reportTypes, isLoading: typesLoading } = useReportTypes();

  const [reportType, setReportType] = useState('');
  const [notes, setNotes] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set default report type when types are loaded
  useEffect(() => {
    if (reportTypes && Object.keys(reportTypes).length > 0 && !reportType) {
      // Get first type from first category
      const firstCategory = Object.keys(reportTypes)[0];
      if (reportTypes[firstCategory] && reportTypes[firstCategory].length > 0) {
        setReportType(reportTypes[firstCategory][0].code);
      }
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
      setError(null);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError('Camera not available. Please use file upload instead.');
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
      setError('Camera not ready. Please try again.');
      return;
    }

    if (video.readyState !== 4 || !video.videoWidth || !video.videoHeight) {
      setError('Video not ready. Please wait a moment and try again.');
      return;
    }

    setIsCapturing(true);

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (!context) {
        setError('Failed to capture image. Please try again.');
        setIsCapturing(false);
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);
      setPreviewUrl(dataUrl);
      stopCamera();
      setIsCapturing(false);
    } catch (err) {
      console.error('Capture error:', err);
      setError('Failed to capture image. Please try again.');
      setIsCapturing(false);
    }
  }, [stopCamera]);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPG or PNG images only.');
      return;
    }

    setError(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setCapturedImage(url);
  }, []);

  // Clear captured image
  const clearImage = useCallback(() => {
    setCapturedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
  }, []);

  // Submit report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!previewUrl) {
      setError('Please capture or select an image first.');
      return;
    }

    if (!reportType) {
      setError('Please select a report type.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('report_type', reportType);
      if (notes) formData.append('notes', notes);
      if (reportDate) formData.append('report_date', reportDate);

      // Convert data URL to blob and append as file
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      formData.append('images', blob, 'report.jpg');

      await uploadReport.mutateAsync({ patientId, formData });
      toast.success('Report uploaded successfully');

      // Only reset if we have a success callback (standalone page mode)
      if (onSuccess) {
        // Get first type from first category
        const firstCategory = Object.keys(reportTypes || {})[0];
        const firstType = reportTypes?.[firstCategory]?.[0]?.code || '';
        setReportType(firstType);
        setNotes('');
        setReportDate('');
        setCapturedImage(null);
        setPreviewUrl(null);
        setError(null);
        onSuccess?.();
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload report. Please try again.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Report Type */}
        <div className="space-y-2">
          <Label htmlFor="report_type">Report Type *</Label>
          {typesLoading ? (
            <div className="text-sm text-muted-foreground">Loading report types...</div>
          ) : reportTypes && Object.keys(reportTypes).length > 0 ? (
            <Select value={reportType} onValueChange={setReportType} required>
              <SelectTrigger id="report_type">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(reportTypes).map(([category, types]) => (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                      {category}
                    </div>
                    {types.map((type: any) => (
                      <SelectItem key={type.id} value={type.code}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-sm text-destructive">Failed to load report types</div>
          )}
          <p className="text-xs text-muted-foreground">
            Select the type of medical report you're uploading
          </p>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="report_date">Report Date</Label>
          <Input
            id="report_date"
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes about this report..."
            className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-transparent text-sm"
          />
        </div>

        {/* Image Capture/Upload */}
        <div className="space-y-3">
          <Label>Report Image *</Label>

          {/* Camera Selector */}
          {cameras.length > 1 && !showCamera && !previewUrl && (
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
          ) : previewUrl ? (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border">
                <img
                  src={previewUrl}
                  alt="Captured report"
                  className="w-full max-h-[400px] object-contain bg-muted"
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

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            className="flex-1"
            disabled={!previewUrl || uploadReport.isPending}
          >
            {uploadReport.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
