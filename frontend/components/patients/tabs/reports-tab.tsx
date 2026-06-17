// Reports tab component - User Story 3, 4 & 12
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileImage, Camera, Eye, Trash2 } from 'lucide-react';
import { useReports, useDeleteReport } from '@/hooks/use-reports';
import { useReportTypes } from '@/hooks/use-report-types';
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
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { Report } from '@/lib/db.types';

interface ReportsTabProps {
  patientId: string;
}

export function ReportsTab({ patientId }: ReportsTabProps) {
  const { data: reports, isLoading } = useReports(parseInt(patientId));
  const { data: reportTypes } = useReportTypes();
  const deleteReport = useDeleteReport();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<{ url: string; title?: string }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleViewImages = (report: any) => {
    // Extract images from report
    const images = report.images?.map((img: any) => ({
      url: img.url,
      title: report.title,
    })) || [];

    if (images.length > 0) {
      setLightboxImages(images);
      setLightboxIndex(0);
      setLightboxOpen(true);
    } else {
      toast.error('No images available for this report');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteReport.mutateAsync(parseInt(deleteId));
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

  // Group reports by category
  const groupedReports = reports?.reduce((acc, report) => {
    const category = report.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(report);
    return acc;
  }, {} as Record<string, any[]>) || {};

  const categories = Object.keys(groupedReports).sort();

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
            <Link href={`/patients/${patientId}/diagnoses/new`}>
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
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {category} ({groupedReports[category]?.length || 0})
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="space-y-3">
                {reports?.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onView={() => handleViewImages(report)}
                    onDelete={() => setDeleteId(report.id)}
                    reportTypes={reportTypes}
                  />
                ))}
              </TabsContent>

              {categories.map((category) => (
                <TabsContent key={category} value={category} className="space-y-3">
                  {groupedReports[category]?.length > 0 ? (
                    groupedReports[category].map((report: Report) => (
                      <ReportCard
                        key={report.id}
                        report={report}
                        onView={() => handleViewImages(report)}
                        onDelete={() => setDeleteId(report.id)}
                        reportTypes={reportTypes}
                      />
                    ))
                  ) : (
                    <EmptyReportType type={category} />
                  )}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileImage className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-4">No reports uploaded yet.</p>
              <Link href={`/patients/${patientId}/diagnoses/new`}>
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
        imAges={lightboxImages}
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
  reportTypes,
}: {
  report: any;
  onView: () => void;
  onDelete: () => void;
  reportTypes?: Record<string, any[]>;
}) {
  const hasImages = report.images?.length > 0;

  // Resolve report type name from code
  const getTypeName = (code: string) => {
    if (!reportTypes) return code;
    for (const types of Object.values(reportTypes)) {
      const found = (types as any[]).find((t: any) => t.code === code);
      if (found) return found.name;
    }
    return code;
  };

  const typeName = getTypeName(report.report_type);

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
                src={report.images?.[0]?.url}
                alt={typeName}
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
              <h4 className="font-medium truncate">{typeName}</h4>
              <div className="flex gap-1 flex-shrink-0">
                {hasImages && (
                  <Button variant="ghost" size="sm" onClick={onView} className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px]">
                {report.category || 'Other'}
              </Badge>
              {hasImages && report.images.length > 1 && (
                <span className="text-[10px] text-muted-foreground">
                  {report.images.length} images
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {report.report_date ? formatDate(report.report_date) : 'No date'}
              {report.notes && <span className="ml-2">• {report.notes}</span>}
            </p>
          </div>
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
