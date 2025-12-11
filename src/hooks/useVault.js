import { useState, useEffect, useCallback } from 'react';

// Check if running in Electron
const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI?.isElectron;
};

export function useVault() {
  const [vaultPath, setVaultPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  // Check for existing vault on mount
  useEffect(() => {
    async function checkVault() {
      if (!isElectron()) {
        // Web mode - no vault needed, use localStorage
        setIsConfigured(true);
        setLoading(false);
        return;
      }

      try {
        const path = await window.electronAPI.getVaultPath();
        if (path) {
          setVaultPath(path);
          setIsConfigured(true);
        }
      } catch (e) {
        console.error('Error checking vault:', e);
      }
      setLoading(false);
    }

    checkVault();
  }, []);

  const selectFolder = useCallback(async () => {
    if (!isElectron()) return null;
    return await window.electronAPI.selectVaultFolder();
  }, []);

  const configureVault = useCallback(async (path) => {
    if (!isElectron()) return { success: true };

    try {
      const result = await window.electronAPI.setVaultPath(path);
      if (result.success) {
        setVaultPath(path);
        setIsConfigured(true);
      }
      return result;
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, []);

  const clearVault = useCallback(async () => {
    if (!isElectron()) return { success: true };

    try {
      const result = await window.electronAPI.clearVaultPath();
      if (result.success) {
        setVaultPath(null);
        setIsConfigured(false);
      }
      return result;
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, []);

  return {
    vaultPath,
    loading,
    isConfigured,
    isElectron: isElectron(),
    selectFolder,
    configureVault,
    clearVault
  };
}
