// Offline indicator component
import { Badge } from '@/components/ui/badge';

export function OfflineIndicator() {
  return (
    <Badge variant="outline" className="gap-1.5 border-green-500/50 bg-green-500/10">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      Offline Mode
    </Badge>
  );
}
