export function EntryItem({ entry, date, type, showDate, darkMode, formatDate, renderText, onToggle, onDelete }) {
  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';
  const text = darkMode ? 'text-neutral-100' : 'text-neutral-900';

  return (
    <div className={`group flex items-start gap-3 py-2 px-2 -mx-2 rounded transition-colors ${
      entry.highlight ? (darkMode ? 'bg-amber-950/30' : 'bg-amber-50') : (darkMode ? 'hover:bg-neutral-900' : 'hover:bg-neutral-100')
    }`}>
      <button onClick={() => onToggle(entry.id, date, type)} className={`mt-1 text-xs ${entry.highlight ? 'text-amber-500' : textMuted}`}>
        {entry.highlight ? '●' : '○'}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`${text} font-mono text-sm leading-relaxed whitespace-pre-wrap`}>{renderText(entry.text)}</p>
        <span className={`text-xs ${textMuted} font-mono`}>{showDate ? `${formatDate(date)} · ` : ''}{entry.time}</span>
      </div>
      <button onClick={() => onDelete(entry.id, date, type)} className={`opacity-0 group-hover:opacity-100 ${textMuted} hover:text-red-500 text-xs`}>×</button>
    </div>
  );
}
