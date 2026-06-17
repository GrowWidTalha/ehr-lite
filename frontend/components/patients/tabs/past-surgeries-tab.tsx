// Past Surgeries tab component - Uses onboarding form for consistency
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2, Scissors } from "lucide-react";
import {
  usePastSurgeries,
  useDeletePastSurgery,
  useCreatePastSurgery,
  useUploadSurgeryImages,
} from "@/hooks/use-past-surgeries";
import { ImageLightbox } from "@/components/reports/image-lightbox";
import { toast } from "sonner";
import { PastSurgeriesStep } from "@/components/onboarding/steps/past-surgeries-step";
import { STATIC_BASE_URL } from "@/lib/api";

interface SurgeryRecord {
  id: string;
  description: string;
  isCancerSurgery: boolean;
  imageUrls: string[];
  imageFiles: File[];
  surgeryDate: string;
  notes: string;
  hospitalName: string;
  surgeonName: string;
}

interface PastSurgeriesTabProps {
  patientId: string;
}

export function PastSurgeriesTab({ patientId }: PastSurgeriesTabProps) {
  const {
    data: surgeries,
    isLoading,
    refetch,
  } = usePastSurgeries(parseInt(patientId));
  const deleteSurgery = useDeletePastSurgery();
  const createSurgery = useCreatePastSurgery();
  const uploadSurgeryImages = useUploadSurgeryImages();

  const [formData, setFormData] = useState({
    Surgeries: [] as SurgeryRecord[],
  });

  // Sync surgeries from API with form data for the component
  const syncSurgeries = () => {
    if (surgeries && Array.isArray(surgeries)) {
      const formattedSurgeries = surgeries.map((s: any) => ({
        id: crypto.randomUUID(),
        description: s.Description || "",
        isCancerSurgery: s.IsCancerSurgery === 1,
        imageUrls: s.images?.map((img: any) => `${STATIC_BASE_URL}${img.url}`) || [],
        imageFiles: [],
        surgeryDate: s.SurgeryDate
          ? new Date(s.SurgeryDate).toISOString().split("T")[0]
          : "",
        notes: s.Notes || "",
        hospitalName: s.HospitalName || "",
        surgeonName: s.SurgeonName || "",
      }));
      setFormData({ Surgeries: formattedSurgeries });
    } else {
      // Set empty array if no surgeries
      setFormData({ Surgeries: [] });
    }
  };

  // Load surgeries on mount and when surgeries data changes
  useEffect(() => {
    syncSurgeries();
  }, [surgeries]); // Only re-run when surgeries data changes

  const handleSaveSurgery = async (surgery: SurgeryRecord) => {
    if (!surgery.description?.trim()) {
      toast.error("Please enter a surgery description");
      return;
    }

    try {
      const result = await createSurgery.mutateAsync({
        patientId: parseInt(patientId),
        data: {
          SurgeryDate: surgery.surgeryDate || undefined,
          Description: surgery.description,
          IsCancerSurgery: surgery.isCancerSurgery ? 1 : 0,
          Notes: surgery.notes || undefined,
          HospitalName: surgery.hospitalName || undefined,
          SurgeonName: surgery.surgeonName || undefined,
        },
      });

      console.log("Surgery created:", result);

      // Upload images if provided (handle both file objects and data URLs from camera)
      const hasImages =
        (surgery.imageFiles && surgery.imageFiles.length > 0) ||
        (surgery.imageUrls && surgery.imageUrls.length > 0);

      console.log(
        "Has images:",
        hasImages,
        "imageFiles:",
        surgery.imageFiles?.length,
        "imageUrls:",
        surgery.imageUrls?.length,
      );

      if (
        hasImages &&
        result &&
        typeof result === "object" &&
        "RowID" in result
      ) {
        // Convert data URLs to Files if needed
        let filesToUpload: File[] = surgery.imageFiles || [];

        if (surgery.imageUrls && surgery.imageUrls.length > 0) {
          console.log("Converting data URLs to files...");
          const dataUrlFiles = await Promise.all(
            surgery.imageUrls
              .filter((url) => url.startsWith("data:"))
              .map(async (dataUrl) => {
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                const extension = dataUrl.split(";")[0].split("/")[1] || "jpg";
                return new File(
                  [blob],
                  `camera-capture-${Date.now()}.${extension}`,
                  { type: blob.type },
                );
              }),
          );
          filesToUpload = [...filesToUpload, ...dataUrlFiles];
          console.log("Files to upload:", filesToUpload.length);
        }

        if (filesToUpload.length > 0) {
          console.log("Uploading files for surgery:", (result as any).RowID);
          await uploadSurgeryImages.mutateAsync({
            surgeryId: (result as any).RowID,
            files: filesToUpload,
            patientId: parseInt(patientId),
          });
          console.log("Upload complete");
        }
      }

      toast.success("Surgery added successfully");
      syncSurgeries(); // Reload to show updated list
    } catch (error) {
      console.error("Failed to add surgery:", error);
      toast.error("Failed to add surgery. Please try again.");
    }
  };

  const handleDeleteSurgery = async (surgeryId: number) => {
    if (!confirm("Are you sure you want to delete this surgery record?")) {
      return;
    }

    try {
      await deleteSurgery.mutateAsync({
        patientId: parseInt(patientId),
        surgeryId,
      });
      toast.success("Surgery deleted successfully");
      syncSurgeries();
    } catch (error) {
      console.error("Failed to delete surgery:", error);
      toast.error("Failed to delete surgery. Please try again.");
    }
  };

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<
    { url: string; title?: string }[]
  >([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleViewImages = (surgery: any) => {
    const images = surgery.imageUrls || [];
    if (images.length > 0) {
      setLightboxImages(
        images.map((url: string) => ({
          url: url,
          title: surgery.description || `Surgery`,
        })),
      );
      setLightboxIndex(0);
      setLightboxOpen(true);
    } else {
      toast.error("No images available for this surgery");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Past Surgeries</CardTitle>
          <CardDescription>
            Previous surgical procedures with supporting documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">Loading surgeries...</p>
            </div>
          )}

          {/* Add Surgery Form - Always visible */}
          <PastSurgeriesStep
            formData={formData}
            onChange={setFormData}
            onSave={handleSaveSurgery}
            error={null}
          />

          {/* Surgeries List */}
          {!isLoading && formData.Surgeries.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">
                Recorded Surgeries ({formData.Surgeries.length})
              </h3>
              {formData.Surgeries.map((surgery, index) => {
                const hasImages = surgery.imageUrls?.length > 0;
                return (
                  <Card key={surgery.id} className="relative">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">
                            Surgery #{index + 1}
                          </h4>
                          {surgery.isCancerSurgery && (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-destructive text-destructive-foreground text-xs">
                              Cancer Surgery
                            </span>
                          )}
                          {surgery.surgeryDate && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                surgery.surgeryDate,
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const surgeryData = surgeries?.find(
                              (s: any) => s.RowID === index + 1,
                            );
                            if (surgeryData && surgeryData.RowID !== undefined)
                              handleDeleteSurgery(surgeryData.RowID);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium">
                            Procedure Details
                          </h5>
                          <p className="text-sm text-muted-foreground">
                            {surgery.description}
                          </p>
                        </div>

                        {surgery.surgeonName && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Surgeon:</span>{" "}
                            {surgery.surgeonName}
                          </p>
                        )}
                        {surgery.hospitalName && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Hospital:</span>{" "}
                            {surgery.hospitalName}
                          </p>
                        )}
                        {surgery.notes && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Notes:</span>{" "}
                            {surgery.notes}
                          </p>
                        )}

                        {hasImages && (
                          <div>
                            <h5 className="text-sm font-medium mb-2">
                              Attached Documents ({surgery.imageUrls.length})
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {surgery.imageUrls.map((url, idx) => (
                                <div key={idx} className="relative w-24 h-24">
                                  <img
                                    src={url}
                                    alt={`Surgery #${index + 1} - Image ${idx + 1}`}
                                    className="w-full h-full object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => handleViewImages(surgery)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : !isLoading && formData.Surgeries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Scissors className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm mb-1">No surgeries recorded</p>
              <p className="text-xs">Use the form above to add a surgery</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Lightbox */}
      <ImageLightbox
        imAges={lightboxImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </>
  );
}
