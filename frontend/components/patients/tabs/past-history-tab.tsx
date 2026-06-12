// Combined Past Records and Surgeries tab component
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, FileText, Scissors, Calendar, Hospital, User, Plus, Trash2 } from 'lucide-react';
import { usePastRecords, useUpdatePastRecords } from '@/hooks/use-past-records';
import { usePastSurgeries, useCreatePastSurgery, useDeletePastSurgery, useUploadSurgeryImage } from '@/hooks/use-past-surgeries';
import { ImageLightbox } from '@/components/reports/image-lightbox';
import { toast } from 'sonner';

interface PastHistoryTabProps {
  patientId: string;
}

export function PastHistoryTab({ patientId }: PastHistoryTabProps) {
  const { data: pastRecords, isLoading: recordsLoading } = usePastRecords(patientId);
  const { data: surgeries, isLoading: surgeriesLoading } = usePastSurgeries(parseInt(patientId));

  const updatePastRecords = useUpdatePastRecords();
  const createSurgery = useCreatePastSurgery();
  const deleteSurgery = useDeletePastSurgery();
  const uploadSurgeryImage = useUploadSurgeryImage();

  const [isEditingRecords, setIsEditingRecords] = useState(false);
  const [isAddingSurgery, setIsAddingSurgery] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [recordsFormData, setRecordsFormData] = useState({
    PreviousChemo: '',
    PreviousRT: '',
    PreviousTargeted: '',
    PreviousHT: '',
    PreviousIT: '',
  });

  const [newSurgery, setNewSurgery] = useState({
    SurgeryDate: '',
    Description: '',
    IsCancerSurgery: 0,
    Notes: '',
    HospitalName: '',
    SurgeonName: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Update form data when past records loads
  useEffect(() => {
    if (pastRecords && typeof pastRecords === 'object' && 'PreviousChemo' in pastRecords) {
      const records = pastRecords as any;
      setRecordsFormData({
        PreviousChemo: records.PreviousChemo || '',
        PreviousRT: records.PreviousRT || '',
        PreviousTargeted: records.PreviousTargeted || '',
        PreviousHT: records.PreviousHT || '',
        PreviousIT: records.PreviousIT || '',
      });
    }
  }, [pastRecords]);

  if (recordsLoading || surgeriesLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleSaveRecords = async () => {
    try {
      await updatePastRecords.mutateAsync({
        patientId: parseInt(patientId),
        data: recordsFormData,
      });

      toast.success('Past records updated successfully');
      setIsEditingRecords(false);
    } catch (error) {
      console.error('Failed to update past records:', error);
      toast.error('Failed to update past records. Please try again.');
    }
  };

  const handleCancelRecords = () => {
    if (pastRecords && typeof pastRecords === 'object' && 'PreviousChemo' in pastRecords) {
      const records = pastRecords as any;
      setRecordsFormData({
        PreviousChemo: records.PreviousChemo || '',
        PreviousRT: records.PreviousRT || '',
        PreviousTargeted: records.PreviousTargeted || '',
        PreviousHT: records.PreviousHT || '',
        PreviousIT: records.PreviousIT || '',
      });
    }
    setIsEditingRecords(false);
  };

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

      if (imageFile && result && typeof result === 'object' && 'RowID' in result) {
        await uploadSurgeryImage.mutateAsync({
          surgeryId: (result as any).RowID,
          file: imageFile,
        });
      }

      toast.success('Surgery added successfully');
      resetSurgeryForm();
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

  const resetSurgeryForm = () => {
    setNewSurgery({
      SurgeryDate: '',
      Description: '',
      IsCancerSurgery: 0,
      Notes: '',
      HospitalName: '',
      SurgeonName: '',
    });
    setImageFile(null);
    setIsAddingSurgery(false);
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

  return (
    <div className="space-y-6">
      {/* Past Records Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Past Treatment Records
              </CardTitle>
              <CardDescription>Previous treatments and therapies the patient has received</CardDescription>
            </div>
            {!isEditingRecords && (
              <Button variant="outline" onClick={() => setIsEditingRecords(true)}>
                Edit Records
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditingRecords ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="PreviousChemo">Previous Chemotherapy</Label>
                <Textarea
                  id="PreviousChemo"
                  value={recordsFormData.PreviousChemo}
                  onChange={(e) => setRecordsFormData({ ...recordsFormData, PreviousChemo: e.target.value })}
                  placeholder="Drug names, cycles, dates, outcomes..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="PreviousRT">Previous Radiation Therapy (RT)</Label>
                <Textarea
                  id="PreviousRT"
                  value={recordsFormData.PreviousRT}
                  onChange={(e) => setRecordsFormData({ ...recordsFormData, PreviousRT: e.target.value })}
                  placeholder="Site, dose, fractions, dates, outcomes..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="PreviousTargeted">Previous Targeted / TKI Therapy</Label>
                <Textarea
                  id="PreviousTargeted"
                  value={recordsFormData.PreviousTargeted}
                  onChange={(e) => setRecordsFormData({ ...recordsFormData, PreviousTargeted: e.target.value })}
                  placeholder="Drug names, duration, response, side effects..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="PreviousHT">Previous Hormone Therapy (HT)</Label>
                <Textarea
                  id="PreviousHT"
                  value={recordsFormData.PreviousHT}
                  onChange={(e) => setRecordsFormData({ ...recordsFormData, PreviousHT: e.target.value })}
                  placeholder="Drug names, duration, response, side effects..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="PreviousIT">Previous Immunotherapy (IT)</Label>
                <Textarea
                  id="PreviousIT"
                  value={recordsFormData.PreviousIT}
                  onChange={(e) => setRecordsFormData({ ...recordsFormData, PreviousIT: e.target.value })}
                  placeholder="Drug names, duration, response, side effects..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSaveRecords} disabled={updatePastRecords.isPending}>
                  {updatePastRecords.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Records
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleCancelRecords} disabled={updatePastRecords.isPending}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Previous Chemotherapy</h4>
                <p className="text-sm text-muted-foreground">
                  {(pastRecords as any)?.PreviousChemo || 'No chemotherapy records'}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Previous Radiation Therapy</h4>
                <p className="text-sm text-muted-foreground">
                  {(pastRecords as any)?.PreviousRT || 'No radiation therapy records'}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Previous Targeted/TKI Therapy</h4>
                <p className="text-sm text-muted-foreground">
                  {(pastRecords as any)?.PreviousTargeted || 'No targeted therapy records'}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Previous Hormone Therapy</h4>
                <p className="text-sm text-muted-foreground">
                  {(pastRecords as any)?.PreviousHT || 'No hormone therapy records'}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Previous Immunotherapy</h4>
                <p className="text-sm text-muted-foreground">
                  {(pastRecords as any)?.PreviousIT || 'No immunotherapy records'}
                </p>
              </div>

              {!(pastRecords as any)?.PreviousChemo && !(pastRecords as any)?.PreviousRT &&
               !(pastRecords as any)?.PreviousTargeted && !(pastRecords as any)?.PreviousHT &&
               !(pastRecords as any)?.PreviousIT && (
                <p className="text-sm text-muted-foreground italic">No past treatment records available</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Surgeries Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5" />
                Past Surgeries
              </CardTitle>
              <CardDescription>Previous surgical procedures with supporting documents</CardDescription>
            </div>
            {!isAddingSurgery && (
              <Button onClick={() => setIsAddingSurgery(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Surgery
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Surgery Form */}
          {isAddingSurgery && (
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
                  <Button variant="outline" onClick={resetSurgeryForm} disabled={createSurgery.isPending}>
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
                              src={surgery.ImagePath}
                              alt={`Surgery #${surgery.RowID}`}
                              className="w-full h-full object-cover rounded border cursor-pointer"
                              onClick={() => {
                                setSelectedImage(surgery.ImagePath);
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
    </div>
  );
}
