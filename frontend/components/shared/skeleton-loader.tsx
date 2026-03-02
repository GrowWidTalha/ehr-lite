import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PatientCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-5 w-32 bg-muted rounded mb-2" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
          <div className="h-8 w-8 bg-muted rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-3/4 bg-muted rounded" />
          <div className="h-3 w-1/2 bg-muted rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export function PatientTableSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="w-full">
          <div className="flex border-b">
            {['Name', 'Age/Sex', 'Contact', 'Actions'].map((header) => (
              <div key={header} className="px-4 py-3">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex border-b last:border-0 animate-pulse">
              <div className="px-4 py-3 flex-1">
                <div className="h-4 w-32 bg-muted rounded" />
              </div>
              <div className="px-4 py-3 w-24">
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
              <div className="px-4 py-3 w-32">
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
              <div className="px-4 py-3 w-24">
                <div className="h-8 w-20 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
