const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Folder selection
  selectFolder: () => ipcRenderer.invoke('select-folder'),

  // Data folder management
  getDataFolder: () => ipcRenderer.invoke('get-data-folder'),
  setDataFolder: (folderPath) => ipcRenderer.invoke('set-data-folder', folderPath),
  clearDataFolder: () => ipcRenderer.invoke('clear-data-folder'),

  // File operations
  readData: () => ipcRenderer.invoke('read-data'),
  writeData: (data) => ipcRenderer.invoke('write-data', data),

  // Check if running in Electron
  isElectron: true
});
