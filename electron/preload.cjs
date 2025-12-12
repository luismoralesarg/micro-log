const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Vault management
  selectVaultFolder: () => ipcRenderer.invoke('select-vault-folder'),
  getVaultPath: () => ipcRenderer.invoke('get-vault-path'),
  setVaultPath: (path) => ipcRenderer.invoke('set-vault-path', path),
  clearVaultPath: () => ipcRenderer.invoke('clear-vault-path'),

  // File operations
  readFile: (relativePath) => ipcRenderer.invoke('read-file', relativePath),
  writeFile: (relativePath, content) => ipcRenderer.invoke('write-file', relativePath, content),
  deleteFile: (relativePath) => ipcRenderer.invoke('delete-file', relativePath),
  listFiles: (relativePath) => ipcRenderer.invoke('list-files', relativePath),
  ensureDir: (relativePath) => ipcRenderer.invoke('ensure-dir', relativePath),

  // Language settings
  getLanguage: () => ipcRenderer.invoke('get-language'),
  setLanguage: (lang) => ipcRenderer.invoke('set-language', lang),

  // Check if running in Electron
  isElectron: true
});
