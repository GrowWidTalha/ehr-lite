"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Camera,
  Upload,
  X,
  Plus,
  Trash2,
  Video,
  Loader2,
  Scissors,
} from "lucide-react";

interface SurgeryRecord {
  id: string;
  description: string;
  isCancerSurgery: boolean;
  imageUrls: string[]; // preview-only blob/dataURLs — never sent to backend
  imageFiles: File[]; // source of truth for backend upload
  surgeryDate: string;
  notes: string;
  hospitalName: string;
  surgeonName: string;
}

interface PastSurgeriesStepProps {
  formData: any;
  onChange: (data: any) => void;
  onSave?: (surgery: SurgeryRecord) => void | Promise<void>;
  error?: string | null;
}

interface CameraDevice {
  deviceId: string;
  label: string;
}

export function PastSurgeriesStep({
  formData,
  onChange,
  onSave,
  error,
}: PastSurgeriesStepProps) {
  const [surgeries, setSurgeries] = useState<SurgeryRecord[]>(() => {
    return (
      formData.Surgeries || [
        {
          id: crypto.randomUUID(),
          description: "",
          isCancerSurgery: false,
          imageUrls: [],
          imageFiles: [],
          surgeryDate: "",
          notes: "",
          hospitalName: "",
          surgeonName: "",
        },
      ]
    );
  });

  const [activeSurgeryId, setActiveSurgeryId] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
          .filter((d: MediaDeviceInfo) => d.kind === "videoinput")
          .map((d: MediaDeviceInfo) => ({
            deviceId: d.deviceId,
            label:
              d.label ||
              `Camera ${devices.filter((e: MediaDeviceInfo) => e.kind === "videoinput").indexOf(d) + 1}`,
          }));
        setCameras(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error("Error enumerating cameras:", err);
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

  // Start camera for a given surgery
  const startCamera = useCallback(
    async (surgeryId: string) => {
      try {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        const constraints: MediaStreamConstraints = {
          video: selectedCamera
            ? {
                deviceId: { exact: selectedCamera },
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              }
            : {
                facingMode: "environment",
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              },
        };
        const mediaStream =
          await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        setShowCamera(true);
        setActiveSurgeryId(surgeryId);
        setCaptureError(null);
      } catch (err: any) {
        console.error("Camera access error:", err);
        setCaptureError(
          "Camera not available. Please use file upload instead.",
        );
        setShowCamera(false);
      }
    },
    [selectedCamera, stream],
  );

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setActiveSurgeryId(null);
  }, [stream]);

  /**
   * FIX: Convert canvas snapshot to a File object so it travels to the
   * backend the same way a file-picker upload does.
   * Previously the camera path only stored a dataUrl in imageUrls and
   * never touched imageFiles, so the backend never received the image.
   */
  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const surgeryId = activeSurgeryId;

    if (!video || !canvas || !surgeryId) {
      setCaptureError("Camera not ready. Please try again.");
      return;
    }
    if (video.readyState !== 4 || !video.videoWidth || !video.videoHeight) {
      setCaptureError("Video not ready. Please wait a moment and try again.");
      return;
    }

    setIsCapturing(true);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setCaptureError("Failed to capture image. Please try again.");
      setIsCapturing(false);
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to Blob → File so it matches the file-upload path
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCaptureError("Failed to capture image. Please try again.");
          setIsCapturing(false);
          return;
        }

        const timestamp = Date.now();
        const file = new File([blob], `camera-capture-${timestamp}.jpg`, {
          type: "image/jpeg",
        });
        // Blob URL for local preview (consistent with file-upload preview strategy)
        const previewUrl = URL.createObjectURL(blob);

        setSurgeries((prev) =>
          prev.map((surgery) => {
            if (surgery.id !== surgeryId) return surgery;
            return {
              ...surgery,
              imageUrls: [...surgery.imageUrls, previewUrl], // preview only
              imageFiles: [...surgery.imageFiles, file], // sent to backend
            };
          }),
        );

        stopCamera();
        setIsCapturing(false);
        setCaptureError(null);
      },
      "image/jpeg",
      0.9,
    );
  }, [activeSurgeryId, stopCamera]);

  /**
   * FIX: File picker previously stored blob URLs in imageUrls (correct for
   * preview) but the File objects were associated one-to-one with those URLs.
   * That part was mostly fine, but we now make preview URL generation
   * explicit and keep it consistent with the camera path above.
   */
  const handleFileSelect = useCallback(
    (surgeryId: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const MAX_SIZE = 5 * 1024 * 1024;
      const MAX_IMAGES = 5;
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];

      const validFiles = files.filter((file) => {
        if (file.size > MAX_SIZE) {
          setCaptureError(`File ${file.name} too large. Maximum size is 5 MB.`);
          return false;
        }
        if (!validTypes.includes(file.type)) {
          setCaptureError(`File ${file.name} is not a JPG or PNG image.`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      setSurgeries((prev) =>
        prev.map((surgery) => {
          if (surgery.id !== surgeryId) return surgery;

          const remaining = MAX_IMAGES - surgery.imageUrls.length;
          const filesToAdd = validFiles.slice(0, remaining);

          if (remaining < validFiles.length) {
            setCaptureError(
              `Maximum ${MAX_IMAGES} images per surgery. Only ${remaining} more can be added.`,
            );
          } else {
            setCaptureError(null);
          }

          // Blob URL for preview; File object for backend upload
          const newUrls = filesToAdd.map((f) => URL.createObjectURL(f));
          return {
            ...surgery,
            imageUrls: [...surgery.imageUrls, ...newUrls],
            imageFiles: [...surgery.imageFiles, ...filesToAdd],
          };
        }),
      );

      // Reset input so the same file can be re-selected if needed
      e.target.value = "";
    },
    [],
  );

  // Remove a specific image (revoke blob URL to avoid memory leak)
  const removeSurgeryImage = useCallback(
    (surgeryId: string, imageIndex: number) => {
      setSurgeries((prev) =>
        prev.map((surgery) => {
          if (surgery.id !== surgeryId) return surgery;
          const urlToRevoke = surgery.imageUrls[imageIndex];
          if (urlToRevoke?.startsWith("blob:"))
            URL.revokeObjectURL(urlToRevoke);
          return {
            ...surgery,
            imageUrls: surgery.imageUrls.filter((_, i) => i !== imageIndex),
            imageFiles: surgery.imageFiles.filter((_, i) => i !== imageIndex),
          };
        }),
      );
      setCaptureError(null);
    },
    [],
  );

  // Clear all images for a surgery
  const clearSurgeryImages = useCallback((surgeryId: string) => {
    setSurgeries((prev) =>
      prev.map((surgery) => {
        if (surgery.id !== surgeryId) return surgery;
        surgery.imageUrls.forEach((url) => {
          if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
        });
        return { ...surgery, imageUrls: [], imageFiles: [] };
      }),
    );
    setCaptureError(null);
  }, []);

  const addSurgery = () => {
    setSurgeries((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        description: "",
        isCancerSurgery: false,
        imageUrls: [],
        imageFiles: [],
        surgeryDate: "",
        notes: "",
        hospitalName: "",
        surgeonName: "",
      },
    ]);
  };

  const removeSurgery = (surgeryId: string) => {
    if (surgeries.length === 1) {
      setSurgeries([
        {
          id: crypto.randomUUID(),
          description: "",
          isCancerSurgery: false,
          imageUrls: [],
          imageFiles: [],
          surgeryDate: "",
          notes: "",
          hospitalName: "",
          surgeonName: "",
        },
      ]);
    } else {
      setSurgeries((prev) => prev.filter((s) => s.id !== surgeryId));
    }
  };

  const updateSurgeryDescription = (surgeryId: string, description: string) => {
    setSurgeries((prev) =>
      prev.map((surgery) =>
        surgery.id === surgeryId ? { ...surgery, description } : surgery,
      ),
    );
  };

  const toggleCancerSurgery = (surgeryId: string, checked: boolean) => {
    setSurgeries((prev) =>
      prev.map((surgery) =>
        surgery.id === surgeryId
          ? { ...surgery, isCancerSurgery: checked }
          : surgery,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Record the patient&apos;s past surgical procedures. Add as many
        surgeries as needed with optional images.
      </p>

      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Scissors className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Past Surgeries</h3>
        </div>

        {surgeries.map((surgery, index) => (
          <Card key={surgery.id} className="relative">
            <CardContent className="pt-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Surgery #{index + 1}</h4>
                <div className="flex gap-2">
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
                  {onSave && (
                    <Button
                      type="button"
                      onClick={() => onSave(surgery)}
                      size="sm"
                      disabled={!surgery.description?.trim()}
                    >
                      Save Surgery
                    </Button>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label
                  htmlFor={`surgery-desc-${surgery.id}`}
                  className="text-sm font-medium"
                >
                  Procedure Details
                </Label>
                <Textarea
                  id={`surgery-desc-${surgery.id}`}
                  value={surgery.description}
                  onChange={(e) =>
                    updateSurgeryDescription(surgery.id, e.target.value)
                  }
                  placeholder="Type of surgery, date, hospital, surgeon, outcomes..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Cancer checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`cancer-${surgery.id}`}
                  checked={surgery.isCancerSurgery}
                  onCheckedChange={(checked) =>
                    toggleCancerSurgery(surgery.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`cancer-${surgery.id}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  Cancer-related surgery
                </Label>
              </div>

              {/* Image section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Surgery Documents/Images (Optional – up to 5)
                  {surgery.imageUrls.length > 0 &&
                    ` (${surgery.imageUrls.length}/5)`}
                </Label>

                {/* Camera selector (only when multiple cameras and no active stream) */}
                {cameras.length > 1 &&
                  !showCamera &&
                  surgery.imageUrls.length === 0 &&
                  activeSurgeryId !== surgery.id && (
                    <div className="space-y-2">
                      <Label
                        htmlFor={`camera-select-${surgery.id}`}
                        className="text-xs text-muted-foreground"
                      >
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
                          disabled={surgery.imageUrls.length >= 5}
                        >
                          <Video className="mr-2 h-4 w-4" />
                          Start Camera
                        </Button>
                      </div>
                    </div>
                  )}

                {/* Live camera view */}
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
                        disabled={isCapturing || surgery.imageUrls.length >= 5}
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
                            {surgery.imageUrls.length >= 5
                              ? "Max 5 photos"
                              : "Capture Photo"}
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
                ) : surgery.imageUrls.length > 0 ? (
                  /* Thumbnail grid with add-more buttons */
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {surgery.imageUrls.map((imageUrl, imgIndex) => (
                        <div key={imgIndex} className="relative w-24 h-24">
                          <img
                            src={imageUrl}
                            alt={`Surgery #${index + 1} – Image ${imgIndex + 1}`}
                            className="w-full h-full object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              removeSurgeryImage(surgery.id, imgIndex)
                            }
                            className="absolute top-1 right-1 h-5 w-5 p-0 text-xs"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {surgery.imageUrls.length < 5 && (
                        <>
                          {cameras.length > 0 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => startCamera(surgery.id)}
                              className="w-24 h-24 flex flex-col items-center justify-center gap-1 border-dashed"
                            >
                              <Camera className="h-5 w-5" />
                              <span className="text-xs">Camera</span>
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const input = document.getElementById(
                                `file-input-${surgery.id}`,
                              ) as HTMLInputElement;
                              input?.click();
                            }}
                            className="w-24 h-24 flex flex-col items-center justify-center gap-1 border-dashed"
                          >
                            <Plus className="h-5 w-5" />
                            <span className="text-xs">Files</span>
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => clearSurgeryImages(surgery.id)}
                        size="sm"
                        className="flex-1"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Clear All
                      </Button>
                      {surgery.imageUrls.length >= 5 && (
                        <span className="text-xs text-muted-foreground self-center">
                          Maximum 5 images reached
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Empty state – camera + file buttons */
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
                        const input = document.getElementById(
                          `file-input-${surgery.id}`,
                        ) as HTMLInputElement;
                        input?.click();
                      }}
                      className="h-20 flex flex-col items-center justify-center gap-2"
                    >
                      <Upload className="h-5 w-5" />
                      <span className="text-xs">Choose Files</span>
                    </Button>
                  </div>
                )}

                {/* Hidden file input – always rendered so getElementById always finds it */}
                <input
                  id={`file-input-${surgery.id}`}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  multiple
                  onChange={(e) => handleFileSelect(surgery.id, e)}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        ))}

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

      {captureError && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {captureError}
        </div>
      )}
    </div>
  );
}
