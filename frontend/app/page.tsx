// Patient list page - User Story 1
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePatientList } from '@/hooks/use-patients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PatientCard } from '@/components/patients/patient-card';
import { PatientTable } from '@/components/patients/patient-table';
import { ViewToggle } from '@/components/patients/view-toggle';
import { FilePlus, Search as SearchIcon, UserPlus, Users, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { FunctionalPagination } from '@/components/patients/pagination';
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
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <nav className="p-4 space-y-2 flex-1">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground">
            <Users className="h-4 w-4" />
            Patients
          </div>
          <Link href="/onboarding/new" className="block">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent">
              <UserPlus className="h-4 w-4" />
              Complete Onboarding
            </div>
          </Link>
          <Link href="/patients/new" className="block">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent">
              <FilePlus className="h-4 w-4" />
              Quick Add Patient
            </div>
          </Link>
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Offline Mode
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Manage patient records and information
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Link href="/onboarding/new">
            <Button variant="default">
              <UserPlus className="mr-2 h-4 w-4" />
              Complete Onboarding
            </Button>
          </Link>
          <Link href="/patients/new">
            <Button variant="outline">
              <FilePlus className="mr-2 h-4 w-4" />
              Quick Add Patient
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative group">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <Input
              placeholder="Search by name, phone, or CNIC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                // Clear search on Escape key
                if (e.key === 'Escape') {
                  setSearch('');
                }
              }}
              className="pl-10 pr-10"
              aria-label="Search patients"
              aria-describedby="search-hint"
            />
            <span id="search-hint" className="sr-only">
              Type to search by name, phone number, or CNIC. Press Escape to clear.
            </span>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-sm hover:bg-accent"
                aria-label="Clear search"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 pl-1">
            Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-medium text-xs">Escape</kbd> to clear search
          </p>
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
      </main>
    </div>
  );
}
