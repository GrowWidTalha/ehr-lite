// Electron API type declarations
declare global {
  interface Window {
    electronAPI?: {
      selectBackupDestination: () => Promise<string | null>;
      selectRestoreFile: () => Promise<string | null>;
    };
  }
}

export {};
