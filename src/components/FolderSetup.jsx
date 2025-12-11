export function FolderSetup({ darkMode, onFolderSelected, isElectron }) {
  const bg = darkMode ? 'bg-neutral-950' : 'bg-neutral-50';
  const bgCard = darkMode ? 'bg-neutral-900' : 'bg-white';
  const border = darkMode ? 'border-neutral-800' : 'border-neutral-200';
  const text = darkMode ? 'text-neutral-100' : 'text-neutral-900';
  const textMuted = darkMode ? 'text-neutral-400' : 'text-neutral-500';

  const handleSelectFolder = async () => {
    if (window.electronAPI) {
      const folder = await window.electronAPI.selectFolder();
      if (folder) {
        await window.electronAPI.setDataFolder(folder);
        onFolderSelected(folder);
      }
    }
  };

  const handleUseLocalStorage = () => {
    onFolderSelected('localStorage');
  };

  return (
    <div className={`min-h-screen ${bg} flex items-center justify-center p-4`}>
      <div className={`${bgCard} border ${border} rounded-lg p-8 max-w-md w-full`}>
        <h1 className={`text-xl font-mono ${text} mb-2`}>micro.log</h1>
        <p className={`${textMuted} text-sm mb-6`}>
          Choose where to store your journal data
        </p>

        {isElectron ? (
          <div className="space-y-3">
            <button
              onClick={handleSelectFolder}
              className={`w-full py-3 px-4 rounded font-mono text-sm ${
                darkMode
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-100'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'
              } transition-colors`}
            >
              Select folder...
            </button>
            <p className={`${textMuted} text-xs text-center`}>
              Your data will be saved as a JSON file in the selected folder.
              <br />
              You can sync it with Dropbox, iCloud, or any cloud service.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleUseLocalStorage}
              className={`w-full py-3 px-4 rounded font-mono text-sm ${
                darkMode
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-100'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'
              } transition-colors`}
            >
              Use browser storage
            </button>
            <p className={`${textMuted} text-xs text-center`}>
              Data will be stored in your browser's localStorage.
              <br />
              For file-based storage, use the desktop app.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
