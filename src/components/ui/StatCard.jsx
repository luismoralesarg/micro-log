export function StatCard({ label, value, sub, darkMode }) {
  const bgCard = darkMode ? 'bg-neutral-900' : 'bg-white';
  const border = darkMode ? 'border-neutral-800' : 'border-neutral-200';
  const text = darkMode ? 'text-neutral-100' : 'text-neutral-900';
  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';

  return (
    <div className={`${bgCard} p-4 rounded border ${border}`}>
      <div className={`text-xs ${textMuted} font-mono uppercase tracking-wide`}>{label}</div>
      <div className={`text-2xl font-light ${text} mt-1`}>{value}</div>
      {sub && <div className={`text-xs ${textMuted} mt-1`}>{sub}</div>}
    </div>
  );
}
