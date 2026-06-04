'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, X, Plus, Trash2, Video, Loader2, Scissors } from 'lucide-react';

interface SurgeryRecord {
  id: string;
  description: string;
  isCancerSurgery: boolean;
  imageUrl: string | null;
  imageFile: File | null;
}

interface PastSurgeriesStepProps {
  formData: any;
  onChange: (data: any) => void;
  error?: string | null;
}

interface CameraDevice {
  deviceId: string;
  label: string;
}

export function PastSurgeriesStep({ formData, onChange, error }: PastSurgeriesStepProps) {
  const [surgeries, setSurgeries] = useState<SurgeryRecord[]>(() => {
    return formData.Surgeries || [
      {
        id: crypto.randomUUID(),
        description: '',
        isCancerSurgery: false,
        imageUrl: null,
        imageFile: null,
      }
    ];
  });

  // Camera state for active surgery
  const [activeSurgeryId, setActiveSurgeryId] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync surgeries with parent form data
  useEffect(() => {
    onChange({ ...formData, Surgeries: surgeries });
  }, [surgeries]);

  // Get available cameras on mount
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
  const startCamera = useCallback(async (surgeryId: string) => {
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
      setActiveSurgeryId(surgeryId);
      setCaptureError(null);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCaptureError('Camera not available. Please use file upload instead.');
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
    setActiveSurgeryId(null);
  }, [stream]);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const surgeryId = activeSurgeryId;

    if (!video || !canvas || !surgeryId) {
      setCaptureError('Camera not ready. Please try again.');
      return;
    }

    if (video.readyState !== 4 || !video.videoWidth || !video.videoHeight) {
      setCaptureError('Video not ready. Please wait a moment and try again.');
      return;
    }

    setIsCapturing(true);

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (!context) {
        setCaptureError('Failed to capture image. Please try again.');
        setIsCapturing(false);
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

      setSurgeries(prev => prev.map(surgery => {
        if (surgery.id === surgeryId) {
          return { ...surgery, imageUrl: dataUrl };
        }
        return surgery;
      }));

      stopCamera();
      setIsCapturing(false);
    } catch (err) {
      console.error('Capture error:', err);
      setCaptureError('Failed to capture image. Please try again.');
      setIsCapturing(false);
    }
  }, [activeSurgeryId, stopCamera]);

  // Handle file selection
  const handleFileSelect = useCallback((surgeryId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setCaptureError('File too large. Maximum size is 5MB.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setCaptureError('Invalid file type. Please upload JPG or PNG images only.');
      return;
    }

    setCaptureError(null);
    const url = URL.createObjectURL(file);

    setSurgeries(prev => prev.map(surgery => {
      if (surgery.id === surgeryId) {
        return { ...surgery, imageUrl: url, imageFile: file };
      }
      return surgery;
    }));
  }, []);

  // Clear surgery image
  const clearSurgeryImage = useCallback((surgeryId: string) => {
    setSurgeries(prev => prev.map(surgery => {
      if (surgery.id === surgeryId) {
        return { ...surgery, imageUrl: null, imageFile: null };
      }
      return surgery;
    }));
    setCaptureError(null);
  }, []);

  // Add new surgery
  const addSurgery = () => {
    setSurgeries(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        description: '',
        isCancerSurgery: false,
        imageUrl: null,
        imageFile: null,
      }
    ]);
  };

  // Remove surgery
  const removeSurgery = (surgeryId: string) => {
    if (surgeries.length === 1) {
      // Keep at least one surgery, just clear it
      setSurgeries([{
        id: crypto.randomUUID(),
        description: '',
        isCancerSurgery: false,
        imageUrl: null,
        imageFile: null,
      }]);
    } else {
      setSurgeries(prev => prev.filter(s => s.id !== surgeryId));
    }
  };

  // Update surgery description
  const updateSurgeryDescription = (surgeryId: string, description: string) => {
    setSurgeries(prev => prev.map(surgery => {
      if (surgery.id === surgeryId) {
        return { ...surgery, description };
      }
      return surgery;
    }));
  };

  // Toggle cancer surgery
  const toggleCancerSurgery = (surgeryId: string, checked: boolean) => {
    setSurgeries(prev => prev.map(surgery => {
      if (surgery.id === surgeryId) {
        return { ...surgery, isCancerSurgery: checked };
      }
      return surgery;
    }));
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Record the patient&apos;s past surgical procedures. Add as many surgeries as needed with optional images.
      </p>

      {/* Past Surgeries Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Scissors className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Past Surgeries</h3>
        </div>

        {surgeries.map((surgery, index) => (
          <Card key={surgery.id} className="relative">
            <CardContent className="pt-4 space-y-4">
              {/* Surgery Header */}
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Surgery #{index + 1}</h4>
                {surgeries.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSurgery(surgery.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Surgery Description */}
              <div className="space-y-2">
                <Label htmlFor={`surgery-desc-${surgery.id}`} className="text-sm font-medium">
                  Procedure Details
                </Label>
                <Textarea
                  id={`surgery-desc-${surgery.id}`}
                  value={surgery.description}
                  onChange={(e) => updateSurgeryDescription(surgery.id, e.target.value)}
                  placeholder="Type of surgery, date, hospital, surgeon, outcomes..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Cancer Surgery Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`cancer-${surgery.id}`}
                  checked={surgery.isCancerSurgery}
                  onCheckedChange={(checked) => toggleCancerSurgery(surgery.id, checked as boolean)}
                />
                <Label
                  htmlFor={`cancer-${surgery.id}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  Cancer-related surgery
                </Label>
              </div>

              {/* Image Capture/Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Surgery Document/Image (Optional)</Label>

                {/* Camera Selector */}
                {cameras.length > 1 && !showCamera && !surgery.imageUrl && activeSurgeryId !== surgery.id && (
                  <div className="space-y-2">
                    <Label htmlFor={`camera-select-${surgery.id}`} className="text-xs text-muted-foreground">
                      Select Camera
                    </Label>
                    <div className="flex gap-2">
                      <select
                        id={`camera-select-${surgery.id}`}
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
                        onClick={() => startCamera(surgery.id)}
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                      >
                        <Video className="mr-2 h-4 w-4" />
                        Start Camera
                      </Button>
                    </div>
                  </div>
                )}

                {showCamera && activeSurgeryId === surgery.id && stream ? (
                  <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={capturePhoto}
                        disabled={isCapturing}
                        size="sm"
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
                        size="sm"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                ) : surgery.imageUrl ? (
                  <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden border">
                      <img
                        src={surgery.imageUrl}
                        alt={`Surgery #${index + 1}`}
                        className="w-full max-h-[300px] object-contain bg-muted"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => clearSurgeryImage(surgery.id)}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => clearSurgeryImage(surgery.id)}
                      size="sm"
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
                        onClick={() => startCamera(surgery.id)}
                        variant="outline"
                        size="sm"
                        className="h-20 flex flex-col items-center justify-center gap-2"
                      >
                        <Camera className="h-5 w-5" />
                        <span className="text-xs">Open Camera</span>
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById(`file-input-${surgery.id}`) as HTMLInputElement;
                        input?.click();
                      }}
                      className="h-20 flex flex-col items-center justify-center gap-2"
                    >
                      <Upload className="h-5 w-5" />
                      <span className="text-xs">Choose File</span>
                    </Button>
                    <input
                      id={`file-input-${surgery.id}`}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      capture="environment"
                      onChange={(e) => handleFileSelect(surgery.id, e)}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Surgery Button */}
        <Button
          type="button"
          variant="outline"
          onClick={addSurgery}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Another Surgery
        </Button>
      </div>

      {/* Error Message */}
      {captureError && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {captureError}
        </div>
      )}
    </div>
  );
}
