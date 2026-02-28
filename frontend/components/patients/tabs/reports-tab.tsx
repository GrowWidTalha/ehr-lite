// Reports tab component - User Story 3, 4 & 12
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileImage, Camera, Eye, Trash2 } from 'lucide-react';
import { useReports, useDeleteReport } from '@/hooks/use-reports';
import { ImageLightbox } from '@/components/reports/image-lightbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { formatDate, REPORT_TYPE_LABELS } from '@/lib/utils';
import { toast } from 'sonner';

interface ReportsTabProps {
  patientId: string;
}

export function ReportsTab({ patientId }: ReportsTabProps) {
  const { data: reports, isLoading } = useReports(patientId);
  const deleteReport = useDeleteReport();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<{ url: string; title?: string }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleViewImages = (report: any) => {
    // Debug logging
    console.log('Report object:', report);
    console.log('Report images:', report.images);

    // Extract images from report - adjust based on actual API response structure
    const images = report.images?.map((img: any, index: number) => {
      console.log(`Mapping image ${index}:`, img, 'img.url:', img.url);
      return {
        url: img.url,
        title: report.title,
      };
    }) || [];

    console.log('Mapped images:', images);

    if (images.length > 0) {
      setLightboxImages(images);
      setLightboxIndex(0);
      setLightboxOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteReport.mutateAsync(deleteId);
      toast.success('Report deleted successfully');
      setDeleteId(null);
    } catch (error) {
      console.error('Failed to delete report:', error);
      toast.error('Failed to delete report. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Group reports by type
  const groupedReports = {
    pathology: reports?.filter((r) => r.report_type === 'pathology') || [],
    imaging: reports?.filter((r) => r.report_type === 'imaging') || [],
    lab: reports?.filter((r) => r.report_type === 'lab') || [],
    consultation: reports?.filter((r) => r.report_type === 'consultation') || [],
    other: reports?.filter((r) => r.report_type === 'other') || [],
  };

  const totalReports = reports?.length || 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Patient Reports</CardTitle>
              <CardDescription>
                {totalReports} report{totalReports !== 1 ? 's' : ''} uploaded
              </CardDescription>
            </div>
            <Link href={`/patients/${patientId}/reports/new`}>
              <Button>
                <Camera className="mr-2 h-4 w-4" />
                Upload Report
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {totalReports > 0 ? (
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="flex-wrap">
                <TabsTrigger value="all">
                  All ({totalReports})
                </TabsTrigger>
                <TabsTrigger value="pathology">
                  Pathology ({groupedReports.pathology.length})
                </TabsTrigger>
                <TabsTrigger value="imaging">
                  Imaging ({groupedReports.imaging.length})
                </TabsTrigger>
                <TabsTrigger value="lab">
                  Lab ({groupedReports.lab.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3">
                {reports?.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onView={() => handleViewImages(report)}
                    onDelete={() => setDeleteId(report.id)}
                  />
                ))}
              </TabsContent>

              <TabsContent value="pathology" className="space-y-3">
                {groupedReports.pathology.length > 0 ? (
                  groupedReports.pathology.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      onView={() => handleViewImages(report)}
                      onDelete={() => setDeleteId(report.id)}
                    />
                  ))
                ) : (
                  <EmptyReportType type="Pathology" />
                )}
              </TabsContent>

              <TabsContent value="imaging" className="space-y-3">
                {groupedReports.imaging.length > 0 ? (
                  groupedReports.imaging.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      onView={() => handleViewImages(report)}
                      onDelete={() => setDeleteId(report.id)}
                    />
                  ))
                ) : (
                  <EmptyReportType type="Imaging" />
                )}
              </TabsContent>

              <TabsContent value="lab" className="space-y-3">
                {groupedReports.lab.length > 0 ? (
                  groupedReports.lab.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      onView={() => handleViewImages(report)}
                      onDelete={() => setDeleteId(report.id)}
                    />
                  ))
                ) : (
                  <EmptyReportType type="Lab" />
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileImage className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-4">No reports uploaded yet.</p>
              <Link href={`/patients/${patientId}/reports/new`}>
                <Button>
                  <Camera className="mr-2 h-4 w-4" />
                  Upload First Report
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ReportCard({
  report,
  onView,
  onDelete,
}: {
  report: any;
  onView: () => void;
  onDelete: () => void;
}) {
  const hasImages = report.images?.length > 0 || report.file_url;

  return (
    <Card className="border hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          {hasImages ? (
            <div
              className="w-20 h-20 rounded-md bg-muted overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={onView}
            >
              <img
                src={
                  report.images?.[0]?.url ||
                  report.images?.[0] ||
                  report.file_url ||
                  report.thumbnail_url
                }
                alt={report.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
              <FileImage className="h-8 w-8 text-muted-foreground/50" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-medium truncate">{report.title}</h4>
              <div className="flex gap-1 flex-shrink-0">
                {onView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onView}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {report.report_date ? formatDate(report.report_date) : 'No date'}
            </p>
            {report.notes && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {report.notes}
              </p>
            )}
          </div>

          {/* Type Badge */}
          <Badge variant="outline" className="flex-shrink-0">
            {REPORT_TYPE_LABELS[report.report_type] || report.report_type}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyReportType({ type }: { type: string }) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <p>No {type.toLowerCase()} reports yet.</p>
    </div>
  );
}
