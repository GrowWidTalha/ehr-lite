// Report upload page - User Story 4
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUploadReport } from '@/hooks/use-reports';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Camera, Upload, X, Loader2, Video } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { REPORT_TYPES, REPORT_TYPE_LABELS } from '@/lib/utils';

interface CameraDevice {
  deviceId: string;
  label: string;
}

export default function NewReportPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const uploadReport = useUploadReport();

  const [reportType, setReportType] = useState('pathology');
  const [title, setTitle] = useState('');
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

  // Get all available cameras on mount
  useEffect(() => {
    const getCameras = async () => {
      try {
        // First request permission to access video devices
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
      // Stop any existing stream first
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

    // Make sure video is playing and has dimensions
    if (video.readyState !== 4 || !video.videoWidth || !video.videoHeight) {
      setError('Video not ready. Please wait a moment and try again.');
      return;
    }

    setIsCapturing(true);

    try {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (!context) {
        setError('Failed to capture image. Please try again.');
        setIsCapturing(false);
        return;
      }

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to data URL
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

    // Validate file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    // Validate file type
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

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('report_type', reportType);
      if (notes) formData.append('notes', notes);
      if (reportDate) formData.append('report_date', reportDate);

      // Convert data URL to blob and append as file
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      formData.append('images', blob, 'report.jpg');

      await uploadReport.mutateAsync({ patientId, formData });

      // Redirect to patient detail
      router.push(`/patients/${patientId}`);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload report. Please try again.');
    }
  };

  if (uploadReport.isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <Link href={`/patients/${patientId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patient
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Upload Report</CardTitle>
            <CardDescription>
              Capture or upload a patient report (pathology, imaging, lab results)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Report Type */}
              <div className="space-y-2">
                <Label htmlFor="report_type">Report Type *</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="report_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {REPORT_TYPE_LABELS[type] || type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Report Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Biopsy Report - Breast Cancer"
                  required
                />
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
                        onLoadedMetadata={() => {
                          // Video is ready to play
                        }}
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
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancel
                </Button>
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
                    'Upload Report'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
