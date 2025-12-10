import { useState } from 'react';

export function Paywall({ darkMode, subscription, onSubscribe, onLogout }) {
  const [loading, setLoading] = useState(false);
  const bg = darkMode ? 'bg-neutral-950' : 'bg-neutral-50';
  const bgCard = darkMode ? 'bg-neutral-900' : 'bg-white';
  const border = darkMode ? 'border-neutral-800' : 'border-neutral-200';
  const text = darkMode ? 'text-neutral-100' : 'text-neutral-900';
  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';

  const handleSubscribe = async () => {
    setLoading(true);
    try { await onSubscribe(); } catch { setLoading(false); }
  };

  return (
    <div className={`min-h-screen ${bg} flex items-center justify-center p-4`}>
      <div className={`w-full max-w-md ${bgCard} border ${border} rounded-lg p-8`}>
        <h1 className={`text-sm font-mono ${text} mb-1`}>micro.log</h1>
        <h2 className={`text-lg font-mono ${text} mt-4 mb-2`}>
          {subscription?.status === 'past_due' ? 'payment failed' : 'trial ended'}
        </h2>
        <p className={`text-sm font-mono ${textMuted} mb-6`}>
          {subscription?.status === 'past_due' ? 'please update your payment method.' : 'your 14-day trial has ended. subscribe to continue.'}
        </p>

        <div className={`p-4 rounded border ${border} mb-6`}>
          <div className="flex justify-between items-baseline mb-4">
            <span className={`font-mono ${text}`}>micro.log pro</span>
            <div className="text-right">
              <span className={`text-2xl font-light ${text}`}>$2</span>
              <span className={`text-sm ${textMuted}`}>/month</span>
            </div>
          </div>
          <ul className={`space-y-2 text-sm font-mono ${textMuted}`}>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> unlimited entries</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> all modules</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> end-to-end encryption</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> cancel anytime</li>
          </ul>
        </div>

        <button onClick={handleSubscribe} disabled={loading}
          className={`w-full py-3 rounded font-mono text-sm ${darkMode ? 'bg-neutral-100 text-neutral-900' : 'bg-neutral-900 text-white'} disabled:opacity-50`}>
          {loading ? 'redirecting...' : 'subscribe — $2/month'}
        </button>
        <button onClick={onLogout} className={`w-full mt-3 py-2 text-sm font-mono ${textMuted}`}>logout</button>
      </div>
    </div>
  );
}

export function TrialBanner({ darkMode, daysLeft, onSubscribe }) {
  const [loading, setLoading] = useState(false);
  if (daysLeft > 7) return null;

  const bgBanner = darkMode ? 'bg-amber-900/30' : 'bg-amber-50';
  const textBanner = darkMode ? 'text-amber-400' : 'text-amber-700';
  const border = darkMode ? 'border-amber-800' : 'border-amber-200';

  const handleClick = async () => {
    setLoading(true);
    try { await onSubscribe(); } catch { setLoading(false); }
  };

  return (
    <div className={`${bgBanner} border-b ${border} px-4 py-2`}>
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <span className={`text-xs font-mono ${textBanner}`}>
          {daysLeft <= 0 ? 'trial ended' : daysLeft === 1 ? 'trial ends tomorrow' : `${daysLeft} days left`}
        </span>
        <button onClick={handleClick} disabled={loading} className={`text-xs font-mono ${textBanner} underline`}>
          {loading ? '...' : 'subscribe'}
        </button>
      </div>
    </div>
  );
}

export function SubscriptionBadge({ darkMode, subscription, onManage }) {
  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';
  if (!subscription) return null;

  if (subscription.status === 'active') {
    return (
      <button onClick={onManage}
        className={`text-xs font-mono px-1.5 py-0.5 rounded ${darkMode ? 'bg-green-900 text-green-400' : 'bg-green-100 text-green-700'}`}>
        pro
      </button>
    );
  }
  if (subscription.status === 'trialing') {
    return <span className={`text-xs font-mono ${textMuted}`}>{subscription.daysLeft}d trial</span>;
  }
  return null;
}
