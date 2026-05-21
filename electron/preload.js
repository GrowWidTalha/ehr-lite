const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectBackupDestination: () => ipcRenderer.invoke('dialog:selectBackupDestination'),
  selectRestoreFile: () => ipcRenderer.invoke('dialog:selectRestoreFile'),
});
