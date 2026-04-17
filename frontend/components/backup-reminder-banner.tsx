/**
 * Backup Reminder Banner Component
 *
 * Shows a reminder banner when backup is overdue.
 * Displays days since last backup and provides quick action button.
 *
 * @module components/backup-reminder-banner
 */

'use client';

import { AlertCircle, HardDrive, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBackup } from '@/hooks/use-backup';
import { useState } from 'react';

export function BackupReminderBanner() {
  const { reminder, createBackup, backupInProgress } = useBackup();
  const [dismissed, setDismissed] = useState(false);
  const [lastAction, setLastAction] = useState<'backup' | 'dismiss'>('backup');

  // Don't show if dismissed or reminder not needed
  if (dismissed || !reminder?.show || reminder.daysSince === undefined) {
    return null;
  }

  const handleBackup = async () => {
    setLastAction('backup');
    const result = await createBackup();
    if (result.success) {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setLastAction('dismiss');
  };

  const getUrgencyLevel = () => {
    if (reminder.daysSince >= 30) return 'critical';
    if (reminder.daysSince >= 14) return 'warning';
    return 'info';
  };

  const urgency = getUrgencyLevel();

  const urgencyStyles = {
    critical: 'bg-red-500 text-white border-red-600',
    warning: 'bg-amber-500 text-white border-amber-600',
    info: 'bg-blue-500 text-white border-blue-600'
  };

  return (
    <div className={`${urgencyStyles[urgency]} border-b px-4 py-3 flex items-center justify-between`}>
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5" />
        <div>
          <p className="font-medium">
            {reminder.daysSince >= 30
              ? 'Backup Required - Data at Risk'
              : reminder.daysSince >= 14
              ? 'Backup Reminder'
              : 'Backup Available'}
          </p>
          <p className="text-sm opacity-90">
            {reminder.daysSince === 999
              ? "You haven't backed up your data yet. Please connect your external hard drive and create a backup."
              : `Last backup was ${reminder.daysSince} day${reminder.daysSince !== 1 ? 's' : ''} ago. Connect your external hard drive and back up your data.`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {reminder.daysSince >= 14 && (
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            onClick={handleBackup}
            disabled={backupInProgress}
          >
            <HardDrive className="h-4 w-4 mr-2" />
            {backupInProgress ? 'Backing up...' : 'Backup Now'}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default BackupReminderBanner;
