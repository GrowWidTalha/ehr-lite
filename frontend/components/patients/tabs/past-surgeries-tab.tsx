// Past Surgeries tab component - Display and edit past surgeries with images
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Scissors, Loader2, Calendar, Hospital, User } from 'lucide-react';
import { usePastSurgeries, useCreatePastSurgery, useDeletePastSurgery, useUploadSurgeryImage } from '@/hooks/use-past-surgeries';
import { ImageLightbox } from '@/components/reports/image-lightbox';
import { toast } from 'sonner';

interface PastSurgeriesTabProps {
  patientId: string;
}

export function PastSurgeriesTab({ patientId }: PastSurgeriesTabProps) {
  const { data: surgeries, isLoading } = usePastSurgeries(parseInt(patientId));
  const createSurgery = useCreatePastSurgery();
  const deleteSurgery = useDeletePastSurgery();
  const uploadSurgeryImage = useUploadSurgeryImage();

  const [isAdding, setIsAdding] = useState(false);
  const [newSurgery, setNewSurgery] = useState({
    SurgeryDate: '',
    Description: '',
    IsCancerSurgery: 0,
    Notes: '',
    HospitalName: '',
    SurgeonName: '',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleAddSurgery = async () => {
    if (!newSurgery.Description.trim()) {
      toast.error('Please enter a surgery description');
      return;
    }

    try {
      const result = await createSurgery.mutateAsync({
        patientId: parseInt(patientId),
        data: {
          SurgeryDate: newSurgery.SurgeryDate || undefined,
          Description: newSurgery.Description,
          IsCancerSurgery: newSurgery.IsCancerSurgery,
          Notes: newSurgery.Notes || undefined,
          HospitalName: newSurgery.HospitalName || undefined,
          SurgeonName: newSurgery.SurgeonName || undefined,
        },
      });

      // Upload image if selected
      if (imageFile && result && typeof result === 'object' && 'RowID' in result) {
        await uploadSurgeryImage.mutateAsync({
          surgeryId: (result as any).RowID,
          file: imageFile,
        });
      }

      toast.success('Surgery added successfully');
      resetForm();
    } catch (error) {
      console.error('Failed to add surgery:', error);
      toast.error('Failed to add surgery. Please try again.');
    }
  };

  const handleDeleteSurgery = async (surgeryId: number) => {
    if (!confirm('Are you sure you want to delete this surgery record?')) {
      return;
    }

    try {
      await deleteSurgery.mutateAsync({
        patientId: parseInt(patientId),
        surgeryId,
      });
      toast.success('Surgery deleted successfully');
    } catch (error) {
      console.error('Failed to delete surgery:', error);
      toast.error('Failed to delete surgery. Please try again.');
    }
  };

  const resetForm = () => {
    setNewSurgery({
      SurgeryDate: '',
      Description: '',
      IsCancerSurgery: 0,
      Notes: '',
      HospitalName: '',
      SurgeonName: '',
    });
    setImageFile(null);
    setIsAdding(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPG or PNG images only.');
      return;
    }

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setSelectedImage(url);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Past Surgeries</CardTitle>
              <CardDescription>Previous surgical procedures with supporting documents</CardDescription>
            </div>
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Surgery
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Surgery Form */}
          {isAdding && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-lg">Add New Surgery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="SurgeryDate">Surgery Date</Label>
                    <Input
                      id="SurgeryDate"
                      type="date"
                      value={newSurgery.SurgeryDate}
                      onChange={(e) => setNewSurgery({ ...newSurgery, SurgeryDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="HospitalName">Hospital Name</Label>
                    <Input
                      id="HospitalName"
                      value={newSurgery.HospitalName}
                      onChange={(e) => setNewSurgery({ ...newSurgery, HospitalName: e.target.value })}
                      placeholder="Hospital where surgery was performed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="SurgeonName">Surgeon Name</Label>
                    <Input
                      id="SurgeonName"
                      value={newSurgery.SurgeonName}
                      onChange={(e) => setNewSurgery({ ...newSurgery, SurgeonName: e.target.value })}
                      placeholder="Name of surgeon"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="IsCancerSurgery"
                      checked={newSurgery.IsCancerSurgery === 1}
                      onCheckedChange={(checked) =>
                        setNewSurgery({ ...newSurgery, IsCancerSurgery: checked ? 1 : 0 })
                      }
                    />
                    <Label htmlFor="IsCancerSurgery" className="cursor-pointer">
                      Cancer-related surgery
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Description">Procedure Details *</Label>
                  <Textarea
                    id="Description"
                    value={newSurgery.Description}
                    onChange={(e) => setNewSurgery({ ...newSurgery, Description: e.target.value })}
                    placeholder="Type of surgery, procedure details, outcomes..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Notes">Additional Notes</Label>
                  <Textarea
                    id="Notes"
                    value={newSurgery.Notes}
                    onChange={(e) => setNewSurgery({ ...newSurgery, Notes: e.target.value })}
                    placeholder="Any additional notes or observations..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Surgery Document/Image (Optional)</Label>
                  <div className="flex gap-3">
                    <Input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleImageSelect}
                      className="flex-1"
                    />
                    {selectedImage && (
                      <div className="relative w-24 h-24">
                        <img
                          src={selectedImage}
                          alt="Preview"
                          className="w-full h-full object-cover rounded border cursor-pointer"
                          onClick={() => setSelectedImage(selectedImage)}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => {
                            setSelectedImage(null);
                            setImageFile(null);
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleAddSurgery}
                    disabled={createSurgery.isPending || !newSurgery.Description}
                  >
                    {createSurgery.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Surgery'
                    )}
                  </Button>
                  <Button variant="outline" onClick={resetForm} disabled={createSurgery.isPending}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Surgeries List */}
          <div className="space-y-4">
            {surgeries && Array.isArray(surgeries) && surgeries.length > 0 ? (
              surgeries.map((surgery: any) => (
                <Card key={surgery.RowID} className="relative">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Scissors className="h-4 w-4 text-primary" />
                          <h4 className="font-medium">Surgery #{surgery.RowID}</h4>
                          {surgery.IsCancerSurgery === 1 && (
                            <Badge variant="destructive">Cancer Surgery</Badge>
                          )}
                          {surgery.IsCancerSurgery !== 1 && (
                            <Badge variant="secondary">Non-Cancer</Badge>
                          )}
                        </div>

                        {surgery.SurgeryDate && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Calendar className="h-3 w-3" />
                            {new Date(surgery.SurgeryDate).toLocaleDateString()}
                          </div>
                        )}

                        {surgery.HospitalName && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Hospital className="h-3 w-3" />
                            {surgery.HospitalName}
                          </div>
                        )}

                        {surgery.SurgeonName && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <User className="h-3 w-3" />
                            Dr. {surgery.SurgeonName}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSurgery(surgery.RowID!)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium mb-1">Procedure Details</h5>
                        <p className="text-sm text-muted-foreground">{surgery.Description}</p>
                      </div>

                      {surgery.Notes && (
                        <div>
                          <h5 className="text-sm font-medium mb-1">Notes</h5>
                          <p className="text-sm text-muted-foreground">{surgery.Notes}</p>
                        </div>
                      )}

                      {surgery.ImagePath && (
                        <div>
                          <h5 className="text-sm font-medium mb-2">Attached Document</h5>
                          <div className="relative w-32 h-32">
                            <img
                              src={`/uploads/surgeries/${surgery.ImagePath}`}
                              alt={`Surgery #${surgery.RowID}`}
                              className="w-full h-full object-cover rounded border cursor-pointer"
                              onClick={() => {
                                setSelectedImage(`/uploads/surgeries/${surgery.ImagePath}`);
                                setLightboxOpen(true);
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Scissors className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No past surgeries recorded</p>
                <p className="text-sm">Click "Add Surgery" to record a surgical procedure</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Lightbox */}
      <ImageLightbox
        imAges={selectedImage ? [{ url: selectedImage, title: 'Surgery document' }] : []}
        initialIndex={0}
        open={lightboxOpen}
        onOpenChange={(open) => {
          setLightboxOpen(open);
          if (!open) setSelectedImage(null);
        }}
      />
    </>
  );
}
