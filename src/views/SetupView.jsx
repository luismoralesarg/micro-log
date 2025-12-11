import { useState } from 'react';

export function SetupView({ darkMode, onSetupComplete }) {
  const [selectedPath, setSelectedPath] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const bg = darkMode ? 'bg-neutral-950' : 'bg-neutral-50';
  const bgCard = darkMode ? 'bg-neutral-900' : 'bg-white';
  const border = darkMode ? 'border-neutral-800' : 'border-neutral-200';
  const text = darkMode ? 'text-neutral-100' : 'text-neutral-900';
  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';

  const handleSelectFolder = async () => {
    try {
      const path = await window.electronAPI.selectVaultFolder();
      if (path) {
        setSelectedPath(path);
        setError(null);
      }
    } catch (e) {
      setError('Failed to select folder');
    }
  };

  const handleCreateVault = async () => {
    if (!selectedPath) return;

    setIsCreating(true);
    setError(null);

    try {
      const result = await window.electronAPI.setVaultPath(selectedPath);
      if (result.success) {
        onSetupComplete(selectedPath);
      } else {
        setError(result.error || 'Failed to create vault');
      }
    } catch (e) {
      setError('Failed to create vault');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={`min-h-screen ${bg} flex items-center justify-center p-4`}>
      <div className={`${bgCard} border ${border} rounded-lg p-8 max-w-md w-full`}>
        <div className="text-center mb-8">
          <h1 className={`text-xl font-mono ${text} mb-2`}>micro.log</h1>
          <p className={`text-sm font-mono ${textMuted}`}>
            welcome to your personal journal
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <p className={`text-sm font-mono ${text} mb-4`}>
              Choose where to store your journal entries. All your data will be saved as local files that you own.
            </p>
          </div>

          <div className={`border ${border} rounded-lg p-4`}>
            <p className={`text-xs font-mono ${textMuted} mb-3`}>vault location</p>

            {selectedPath ? (
              <div className="space-y-3">
                <p className={`text-sm font-mono ${text} break-all`}>{selectedPath}</p>
                <button
                  onClick={handleSelectFolder}
                  className={`text-xs font-mono ${textMuted} hover:${text} transition-colors`}
                >
                  change location
                </button>
              </div>
            ) : (
              <button
                onClick={handleSelectFolder}
                className={`w-full py-3 px-4 border ${border} border-dashed rounded-lg text-sm font-mono ${textMuted} hover:border-neutral-500 hover:${text} transition-colors`}
              >
                select folder...
              </button>
            )}
          </div>

          {error && (
            <p className="text-sm font-mono text-red-500">{error}</p>
          )}

          <button
            onClick={handleCreateVault}
            disabled={!selectedPath || isCreating}
            className={`w-full py-3 px-4 rounded-lg text-sm font-mono transition-colors ${selectedPath && !isCreating
                ? `${darkMode ? 'bg-neutral-100 text-neutral-900 hover:bg-white' : 'bg-neutral-900 text-white hover:bg-neutral-800'}`
                : `${darkMode ? 'bg-neutral-800 text-neutral-600' : 'bg-neutral-200 text-neutral-400'} cursor-not-allowed`
              }`}
          >
            {isCreating ? 'creating vault...' : 'create vault'}
          </button>

          <div className={`text-xs font-mono ${textMuted} space-y-2`}>
            <p>this will create the following structure:</p>
            <pre className={`${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'} rounded p-3 overflow-x-auto`}>
{`your-folder/
├── journal/     # daily entries
├── dreams/      # dream journal
├── notes/       # quick notes
├── ideas/       # idea tracker
├── wisdom/      # quotes & wisdom
└── .microlog/   # app config`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
