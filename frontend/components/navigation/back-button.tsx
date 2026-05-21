/**
 * Back Button Component
 *
 * A reusable back button for navigation that works across all pages.
 * Uses Next.js router for client-side navigation when available,
 * and falls back to browser history.
 */

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  label?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  className?: string;
  showIcon?: boolean;
  href?: string; // Optional specific href to go back to
}

export function BackButton({
  label = 'Back',
  variant = 'ghost',
  className = '',
  showIcon = true,
  href
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleClick}
      className={cn('gap-2', className)}
    >
      {showIcon && <ArrowLeft className="h-4 w-4" />}
      {label}
    </Button>
  );
}

/**
 * Page Header with Back Button
 * A common pattern for page headers with back navigation
 */
interface PageHeaderProps {
  title: string;
  description?: string;
  backLabel?: string;
  backHref?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  backLabel = 'Back',
  backHref,
  actions
}: PageHeaderProps) {
  return (
    <div className="border-b bg-background px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton label={backLabel} href={backHref} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}

export default BackButton;
