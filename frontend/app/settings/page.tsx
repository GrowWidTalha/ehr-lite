/**
 * Settings Page
 *
 * Application settings including backup configuration.
 *
 * @page settings
 */

'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBackup } from '@/hooks/use-backup';
import { HardDrive, CheckCircle, XCircle, Loader2, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { config, setBackupPath: setBackupPathHook, createBackup, backupInProgress, refetch } = useBackup();
  const [backupPath, setBackupPathInput] = useState(config?.backupPath || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Check if File System Access API is supported
  const supportsFolderPicker = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  const handleFolderPicker = async () => {
    try {
      // Use File System Access API
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'downloads'
      });

      // The API only gives us the folder name, not the full path
      // Put the name in the input and let user complete the path
      setBackupPathInput(dirHandle.name);

      toast.success(`Selected "${dirHandle.name}". Please complete the full path below (e.g., /mnt/d/${dirHandle.name})`);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast.error('Failed to open folder picker');
        console.error(error);
      }
    }
  };

  const handleTraditionalPicker = () => {
    folderInputRef.current?.click();
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Get the path from the first file
      const path = (files[0] as any).webkitRelativePath;
      if (path) {
        // Extract the folder path from the webkitRelativePath
        const folderPath = path.split('/').slice(0, -1).join('/');
        setBackupPathInput(folderPath);
        toast.info(`Selected folder: ${folderPath}. Please verify and edit if needed.`);
      }
    }
  };

  const handleSavePath = async () => {
    if (!backupPath.trim()) {
      toast.error('Please enter or select a backup path');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    const result = await setBackupPathHook(backupPath);

    setIsSaving(false);

    if (result.success) {
      toast.success('Backup path saved successfully');
      setErrorMessage('');
      refetch();
    } else {
      const errorMsg = result.hint
        ? `${result.error}. ${result.hint}`
        : result.error || 'Failed to save backup path';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleBackupNow = async () => {
    const result = await createBackup();

    if (result.success) {
      toast.success('Backup completed successfully');
      refetch();
    } else {
      toast.error(result.error || 'Backup failed');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Configure application settings and preferences
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 max-w-4xl">
        {/* Backup Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Backup Settings
            </CardTitle>
            <CardDescription>
              Configure where your patient data backups are stored. We recommend using an external hard drive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Path Display */}
            <div className="space-y-2">
              <Label>Current Backup Location</Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                {config?.backupPath ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <code className="text-sm flex-1">{config.backupPath}</code>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-muted-foreground">
                      No backup location configured. Backups will be saved locally.
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Folder Picker / Path Input */}
            <div className="space-y-2">
              <Label>Backup Folder Location</Label>

              {/* Folder Picker Buttons */}
              <div className="flex flex-wrap gap-2">
                {supportsFolderPicker && (
                  <Button
                    variant="outline"
                    onClick={handleFolderPicker}
                    type="button"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Browse Folders
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleTraditionalPicker}
                  type="button"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Select Folder
                </Button>
              </div>

              {/* Hidden file input for traditional folder picker */}
              <input
                ref={folderInputRef}
                type="file"
                {...({ webkitdirectory: "true", directory: "true" } as React.InputHTMLAttributes<HTMLInputElement>)}
                className="hidden"
                onChange={handleFolderSelect}
              />

              {/* Manual Path Input */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="/media/username/ExternalDrive or E:\Backups"
                    value={backupPath}
                    onChange={(e) => {
                      setBackupPathInput(e.target.value);
                      setErrorMessage('');
                    }}
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    onClick={handleSavePath}
                    disabled={isSaving || !backupPath.trim()}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </Button>
                </div>
                {errorMessage && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">{errorMessage}</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                {supportsFolderPicker
                  ? 'Click "Browse Folders" to open the file picker, or manually enter the path below.'
                  : 'Click "Select Folder" to browse, or manually enter the path above.'}
              </p>

              {/* Path Examples */}
              <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-md">
                <p className="font-medium">WSL Path Reference (Windows drives):</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-amber-600 dark:text-amber-400">Windows Drive</p>
                    <p>C:\ → <code className="bg-background px-1 rounded">/mnt/c/</code></p>
                    <p>D:\ → <code className="bg-background px-1 rounded">/mnt/d/</code></p>
                    <p>E:\ → <code className="bg-background px-1 rounded">/mnt/e/</code></p>
                  </div>
                  <div>
                    <p className="text-amber-600 dark:text-amber-400">Example Full Paths:</p>
                    <p><code className="bg-background px-1 rounded">/mnt/d/Backups</code></p>
                    <p><code className="bg-background px-1 rounded">/mnt/e/EHR-Data</code></p>
                    <p><code className="bg-background px-1 rounded">/home/groww/Backups</code></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Manual Backup Button */}
            <div className="border-t pt-4">
              <Button
                variant="default"
                onClick={handleBackupNow}
                disabled={backupInProgress}
                className="w-full"
              >
                {backupInProgress ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Backup...
                  </>
                ) : (
                  <>
                    <HardDrive className="h-4 w-4 mr-2" />
                    Backup Now
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                This will create a backup of your database and patient images
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Backup Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Backups include: patient database and all report images</p>
            <p>• Recommended: Connect an external hard drive and set it as your backup location</p>
            <p>• Backup files are named: ehr-backup-YYYY-MM-DD-HHMMSS.zip</p>
            <p>• You'll see a reminder banner if your last backup is more than 7 days old</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
