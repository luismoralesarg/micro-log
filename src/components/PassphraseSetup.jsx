import { useState } from 'react';

export function PassphraseSetup({ darkMode, onComplete, isNew }) {
  const [passphrase, setPassphrase] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const bg = darkMode ? 'bg-neutral-950' : 'bg-neutral-50';
  const bgCard = darkMode ? 'bg-neutral-900' : 'bg-white';
  const border = darkMode ? 'border-neutral-800' : 'border-neutral-200';
  const text = darkMode ? 'text-neutral-100' : 'text-neutral-900';
  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (isNew) {
      if (passphrase.length < 8) { setError('passphrase must be at least 8 characters'); return; }
      if (passphrase !== confirm) { setError('passphrases do not match'); return; }
    }
    setLoading(true);
    try {
      await onComplete(passphrase);
    } catch (err) {
      setError(err.message || 'invalid passphrase');
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen ${bg} flex items-center justify-center p-4`}>
      <div className={`w-full max-w-sm ${bgCard} border ${border} rounded-lg p-6`}>
        <h2 className={`text-sm font-mono ${text} mb-1`}>
          {isNew ? 'create encryption passphrase' : 'enter encryption passphrase'}
        </h2>
        <p className={`text-xs font-mono ${textMuted} mb-6`}>
          {isNew ? 'this passphrase encrypts all your data. we cannot recover it if lost.' : 'enter your passphrase to decrypt your data.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="encryption passphrase"
            className={`w-full bg-transparent border ${border} rounded px-3 py-2 ${text} placeholder:${textMuted} font-mono text-sm outline-none`} required autoFocus />
          {isNew && (
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="confirm passphrase"
              className={`w-full bg-transparent border ${border} rounded px-3 py-2 ${text} placeholder:${textMuted} font-mono text-sm outline-none`} required />
          )}
          {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
          <button type="submit" disabled={loading}
            className={`w-full py-2 rounded font-mono text-sm ${darkMode ? 'bg-neutral-800 text-neutral-100' : 'bg-neutral-900 text-white'} disabled:opacity-50`}>
            {loading ? 'unlocking...' : isNew ? 'create & continue' : 'unlock'}
          </button>
        </form>

        {isNew && (
          <div className={`mt-4 p-3 rounded border ${border} ${darkMode ? 'bg-amber-950/20' : 'bg-amber-50'}`}>
            <p className={`text-xs font-mono ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
              ⚠ write this passphrase down. if you lose it, your data cannot be recovered.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
