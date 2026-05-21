/**
 * Global Navigation Bar Component
 *
 * A consistent navigation bar across all pages with easy access to:
 * Home/Dashboard, Settings, and back navigation
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, Settings, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavBarProps {
  className?: string;
}

export function NavBar({ className = '' }: NavBarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home, current: pathname === '/' },
    { href: '/settings', label: 'Settings', icon: Settings, current: pathname === '/settings' },
  ];

  return (
    <nav className={cn('border-b bg-background px-4 py-3', className)}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left side - Logo and app name */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">EHR</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-semibold text-lg leading-tight">EHR Lite</h1>
              <p className="text-xs text-muted-foreground">Oncology Department</p>
            </div>
          </Link>
        </div>

        {/* Right side - Navigation */}
        <div className="flex items-center gap-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={item.current ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link href={item.href} className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}

/**
 * Simple mobile menu button (for future expansion)
 */
export function MobileMenuButton() {
  return (
    <Button variant="ghost" size="sm">
      <Menu className="h-5 w-5" />
    </Button>
  );
}

export default NavBar;
