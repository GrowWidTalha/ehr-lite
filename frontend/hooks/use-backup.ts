/**
 * Backup Hook
 *
 * React hook for backup operations and status.
 *
 * @module hooks/use-backup
 */

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface BackupConfig {
  backupPath: string | null;
  lastReminderDate: string | null;
  reminderInterval: number;
  reminderEnabled: boolean;
}

interface BackupStatus {
  lastBackup: {
    date: string;
    time: string;
    size: number;
    type: string;
    filename: string;
  } | null;
  lastAutomaticBackup: {
    date: string;
    time: string;
  } | null;
  totalBackups: number;
  totalSize: number;
  todayCount: number;
  nextScheduled: string;
  inProgress: boolean;
}

interface BackupReminder {
  show: boolean;
  reason: string;
  daysSince: number;
  lastBackup: {
    date: string;
    time: string;
    size: number;
    type: string;
    filename: string;
  } | null;
}

export function useBackup() {
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [reminder, setReminder] = useState<BackupReminder | null>(null);
  const [config, setConfig] = useState<BackupConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [backupInProgress, setBackupInProgress] = useState(false);

  // Fetch backup status
  const fetchStatus = async () => {
    try {
      const response = await api<BackupStatus>('/backup/status');
      if (response.success && response.data) {
        setStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch backup status:', error);
    }
  };

  // Fetch reminder status
  const fetchReminder = async () => {
    try {
      const response = await api<BackupReminder>('/backup/reminder');
      if (response.success && response.data) {
        setReminder(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch backup reminder:', error);
    }
  };

  // Fetch backup configuration
  const fetchConfig = async () => {
    try {
      const response = await api<BackupConfig>('/backup/config');
      if (response.success && response.data) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch backup config:', error);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchStatus(), fetchReminder(), fetchConfig()]);
      setLoading(false);
    };

    loadAll();
  }, []);

  // Create backup
  const createBackup = async () => {
    if (backupInProgress) return { success: false, error: 'Backup already in progress' };

    setBackupInProgress(true);

    try {
      const response = await fetch(`${API_BASE_URL}/backup/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      // Refresh status after backup
      await fetchStatus();
      await fetchReminder();

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Backup failed'
      };
    } finally {
      setBackupInProgress(false);
    }
  };

  // Validate backup path
  const validatePath = async (path: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/backup/config/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });

      const data = await response.json();

      // Include hint in error if present
      if (!data.success && data.data?.hint) {
        data.data.error = `${data.data.error}. ${data.data.hint}`;
      }

      return data;
    } catch (error) {
      return {
        success: false,
        data: { valid: false, error: 'Failed to validate path' }
      };
    }
  };

  // Set backup path
  const setBackupPath = async (path: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/backup/config/path`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });

      const data = await response.json();

      if (data.success) {
        await fetchConfig();
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to set backup path'
      };
    }
  };

  // Get backup path with hint support
  const setBackupPathWithHint = async (path: string) => {
    const result = await setBackupPath(path);
    if (!result.success && result.hint) {
      result.error = `${result.error}. ${result.hint}`;
    }
    return result;
  };

  return {
    status,
    reminder,
    config,
    loading,
    backupInProgress,
    createBackup,
    validatePath,
    setBackupPath,
    refetch: () => Promise.all([fetchStatus(), fetchReminder(), fetchConfig()])
  };
}

export default useBackup;
