import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';

const googleProvider = new GoogleAuthProvider();

export function AuthScreen({ darkMode }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(
        err.code === 'auth/invalid-credential' ? 'invalid credentials' :
        err.code === 'auth/email-already-in-use' ? 'email already in use' :
        err.code === 'auth/weak-password' ? 'password too weak (min 6 chars)' :
        'authentication failed'
      );
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError('google sign-in failed');
    }
  };

  return (
    <div className={`min-h-screen ${bg} flex items-center justify-center p-4`}>
      <div className={`w-full max-w-sm ${bgCard} border ${border} rounded-lg p-6`}>
        <h1 className={`text-sm font-mono ${text} mb-1`}>micro.log</h1>
        <p className={`text-xs font-mono ${textMuted} mb-6`}>zero-knowledge encrypted journal</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email"
            className={`w-full bg-transparent border ${border} rounded px-3 py-2 ${text} placeholder:${textMuted} font-mono text-sm outline-none`} required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password"
            className={`w-full bg-transparent border ${border} rounded px-3 py-2 ${text} placeholder:${textMuted} font-mono text-sm outline-none`} required />
          {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
          <button type="submit" disabled={loading}
            className={`w-full py-2 rounded font-mono text-sm ${darkMode ? 'bg-neutral-800 text-neutral-100' : 'bg-neutral-900 text-white'} disabled:opacity-50`}>
            {loading ? '...' : isLogin ? 'sign in' : 'create account'}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className={`flex-1 h-px bg-neutral-700`} />
          <span className={`text-xs ${textMuted} font-mono`}>or</span>
          <div className={`flex-1 h-px bg-neutral-700`} />
        </div>

        <button onClick={handleGoogle} className={`w-full py-2 rounded font-mono text-sm border ${border} ${text}`}>
          continue with google
        </button>

        <p className={`mt-4 text-center text-xs ${textMuted} font-mono`}>
          {isLogin ? "no account? " : "have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className={`${text} underline`}>
            {isLogin ? 'sign up' : 'sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
