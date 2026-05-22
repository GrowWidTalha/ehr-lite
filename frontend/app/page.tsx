// Patient list page - Dashboard (Centered Layout)
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePatientList } from '@/hooks/use-patients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PatientCard } from '@/components/patients/patient-card';
import { PatientTable } from '@/components/patients/patient-table';
import { ViewToggle } from '@/components/patients/view-toggle';
import { FunctionalPagination } from '@/components/patients/pagination';
import { FilePlus, Search as SearchIcon, UserPlus, X, Upload } from 'lucide-react';
import { ExportButton } from '@/components/export-button';
import { ImportUpload } from '@/components/import-upload';
import { DashboardStatsSkeleton, PatientTableSkeleton, PatientCardSkeleton } from '@/components/shared/skeleton-loader';
import { DashboardStats } from '@/components/dashboard/stats-cards';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { PatientListView } from '@/lib/db.types';

const PAGE_SIZE = 20;

const MAX_WIDTH = 1200;

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<PatientListView>('card');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const { data: patients, isLoading, error } = usePatientList(
    currentPage === 1 && !debouncedSearch
      ? undefined
      : { search: debouncedSearch, page: currentPage, limit: PAGE_SIZE }
  );
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const response = patients;
  const patientList = response?.patients || [];
  const totalPages = response?.totalPages || 1;
  const total = response?.total || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Patient Data</DialogTitle>
            <DialogDescription>
              Upload an Excel file with patient data to import into the system.
            </DialogDescription>
          </DialogHeader>
          <ImportUpload />
        </DialogContent>
      </Dialog>

      {/* Main Content - Centered */}
      <main className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <Image
                  src="/icon.ico"
                  alt="JPMC Logo"
                  fill
                  className="rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">JPMC Oncology</h1>
                <p className="text-muted-foreground">Electronic Health Records</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/settings">
                <Button variant="outline">Settings</Button>
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSearch('');
              }}
            />
          </div>
        </header>

        {/* Dashboard Stats */}
        <div className="mb-8">
          {statsLoading ? (
            <DashboardStatsSkeleton />
          ) : (
            <DashboardStats
              totalPatients={stats?.totalPatients || 0}
              activeDiagnoses={stats?.activeDiagnoses || 0}
              totalReports={stats?.totalReports || 0}
              newThisMonth={stats?.todayRegistrations || 0}
            />
          )}
        </div>

        {/* Page Header & Actions */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Patients</h2>
            <p className="text-sm text-muted-foreground">
              {debouncedSearch ? (
                <>Found <span className="font-medium">{total}</span> patients</>
              ) : (
                <><span className="font-medium">{total}</span> total</>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/onboarding/new">
              <Button size="lg">
                <UserPlus className="mr-2 h-4 w-4" />
                New Patient
              </Button>
            </Link>
            <Link href="/patients/new">
              <Button size="lg" variant="outline">
                <FilePlus className="mr-2 h-4 w-4" />
                Add Basic Info
              </Button>
            </Link>
            <ExportButton
              size="lg"
              variant="outline"
              label="Export"
              onExportComplete={(filename) => console.log('Export:', filename)}
            />
            <Button size="lg" variant="outline" onClick={() => setShowImportDialog(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <>
            {view === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => <PatientCardSkeleton key={i} />)}
              </div>
            ) : <PatientTableSkeleton />}
          </>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">Error loading patients. Please try again.</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && total === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {debouncedSearch ? 'No patients found' : 'No patients yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {debouncedSearch
                ? `No matches for "${debouncedSearch}"`
                : 'Register your first patient to get started'}
            </p>
            {debouncedSearch ? (
              <Button variant="outline" onClick={() => setSearch('')}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            ) : (
              <Link href="/patients/new">
                <Button>
                  <FilePlus className="mr-2 h-4 w-4" />
                  Register First Patient
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Patient List */}
        {!isLoading && total > 0 && (
          <>
            {view === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {patientList.map((patient) => (
                  <PatientCard key={patient.PatientID} patient={patient} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border bg-card">
                <PatientTable patients={patientList} />
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <FunctionalPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={total}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
                className="mt-8"
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
