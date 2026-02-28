'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import type { PatientVitals } from '@/lib/db.types';

interface VitalsHistoryProps {
  vitals: PatientVitals[];
}

export function VitalsHistory({ vitals }: VitalsHistoryProps) {
  if (vitals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No vitals recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {vitals.map((vitals) => (
        <Card key={vitals.id} className="border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {vitals.height_cm && (
                    <div>
                      <span className="text-muted-foreground">Height:</span>{' '}
                      <span className="font-medium">{vitals.height_cm} cm</span>
                    </div>
                  )}
                  {vitals.weight_kg && (
                    <div>
                      <span className="text-muted-foreground">Weight:</span>{' '}
                      <span className="font-medium">{vitals.weight_kg} kg</span>
                    </div>
                  )}
                  {vitals.blood_group && (
                    <div>
                      <span className="text-muted-foreground">Blood Group:</span>{' '}
                      <span className="font-medium">{vitals.blood_group}</span>
                    </div>
                  )}
                </div>
              </div>
              {vitals.recorded_at && (
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(vitals.recorded_at), { addSuffix: true })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
