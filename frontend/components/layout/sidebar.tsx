// Sidebar navigation component
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, FilePlus, Search, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OfflineIndicator } from './offline-indicator';

const navigation = [
  { name: 'Patients', href: '/', icon: Users },
  { name: 'New Patient', href: '/patients/new', icon: FilePlus },
  { name: 'Upload Report', href: '/reports/upload', icon: Activity },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn('flex flex-col h-full bg-card border-r', className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-foreground">EHR Lite</h1>
        <p className="text-sm text-muted-foreground">Oncology Management</p>
      </div>

      {/* Offline Indicator */}
      <div className="p-4">
        <OfflineIndicator />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          v1.0.0 - Local First
        </p>
      </div>
    </div>
  );
}
