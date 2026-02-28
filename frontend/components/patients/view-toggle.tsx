// View toggle component - User Story 1
'use client';

import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import type { PatientListView } from '@/lib/db.types';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  view: PatientListView;
  onViewChange: (view: PatientListView) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('card')}
        className={cn(
          'h-7',
          view === 'card'
            ? 'bg-accent text-accent-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('table')}
        className={cn(
          'h-7',
          view === 'table'
            ? 'bg-accent text-accent-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
