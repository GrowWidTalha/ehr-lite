// Patient list page - Dashboard
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePatientList } from '@/hooks/use-patients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PatientCard } from '@/components/patients/patient-card';
import { PatientTable } from '@/components/patients/patient-table';
import { ViewToggle } from '@/components/patients/view-toggle';
import { FunctionalPagination } from '@/components/patients/pagination';
import { FilePlus, Search as SearchIcon, UserPlus, Activity, Building2, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { DashboardStats } from '@/components/dashboard/stats-cards';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import type { PatientListView, PatientListItem } from '@/lib/db.types';

const PAGE_SIZE = 50;

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<PatientListView>('card');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: patients, isLoading, error } = usePatientList(
    debouncedSearch ? { search: debouncedSearch } : undefined
  );
  const { data: stats } = useDashboardStats();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Use patients directly - backend handles search
  const filteredPatients = patients || [];

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / PAGE_SIZE);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-72 border-r bg-background hidden md:flex flex-col">
        {/* Clinic Branding */}
        <div className="p-6 border-b bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">JPMC</h1>
              <p className="text-sm text-blue-100">Oncology Department</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1">
          <div className="mb-4">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Main Menu
            </p>
          </div>
          <Link href="/">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium">
              <Activity className="h-4 w-4" />
              Dashboard
            </div>
          </Link>
          <Link href="/onboarding/new" className="block">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <UserPlus className="h-4 w-4" />
              New Patient
            </div>
          </Link>
          <Link href="/patients/new" className="block">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <FilePlus className="h-4 w-4" />
              Add Basic Info
            </div>
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span>System Online</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">v1.0.0 • Local Mode</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        {/* Top Header Bar */}
        <header className="border-b bg-background px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Welcome back! Here's your overview.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  className="w-64 pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearch('');
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="p-6">
          {/* Dashboard Stats */}
          <div className="mb-6">
            <DashboardStats
              totalPatients={stats?.total_patients || 0}
              activeDiagnoses={stats?.active_diagnoses || 0}
              totalReports={stats?.total_reports || 0}
              newThisMonth={stats?.new_this_month || 0}
            />
          </div>

          {/* Page Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">Patients</h2>
            <p className="text-muted-foreground">
              Manage patient records, diagnoses, and treatment plans
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mb-6">
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
          </div>

          {/* View Toggle & Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {debouncedSearch ? (
                <>
                  <span className="font-medium text-foreground">{filteredPatients.length}</span> patient{filteredPatients.length !== 1 ? 's' : ''} found for &quot;<span className="font-medium text-foreground">{debouncedSearch}</span>&quot;
                </>
              ) : (
                <>
                  <span className="font-medium text-foreground">{filteredPatients.length}</span> patient{filteredPatients.length !== 1 ? 's' : ''} total
                </>
              )}
            </p>
            <ViewToggle view={view} onViewChange={setView} />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner />
              <p className="text-sm text-muted-foreground mt-3">
                {debouncedSearch ? `Searching for "${debouncedSearch}"...` : 'Loading patients...'}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-destructive">Error loading patients. Please try again.</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {debouncedSearch ? 'No patients found' : 'No patients registered yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {debouncedSearch
                  ? `No patients match "${debouncedSearch}". Try a different search term or check the spelling.`
                  : 'Get started by registering your first patient.'}
              </p>
              {debouncedSearch ? (
                <Button variant="outline" onClick={() => setSearch('')}>
                  <X className="mr-2 h-4 w-4" />
                  Clear Search
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
          {!isLoading && filteredPatients.length > 0 && (
            <>
              {view === 'card' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in" key={debouncedSearch || 'all'}>
                  {paginatedPatients.map((patient) => (
                    <PatientCard key={patient.id} patient={patient} />
                  ))}
                </div>
              ) : (
                <div className="animate-fade-in" key={debouncedSearch || 'all'}>
                  <PatientTable patients={paginatedPatients} />
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <FunctionalPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredPatients.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                  className="mt-8"
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
