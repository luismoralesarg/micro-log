import { EntryItem } from '../components/ui/EntryItem';

export function TagsView({ tags, filter, setFilter, darkMode, formatDate, renderText, onToggle, onDelete }) {
  const text = darkMode ? 'text-neutral-100' : 'text-neutral-900';
  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';
  const bgCard = darkMode ? 'bg-neutral-900' : 'bg-white';
  const border = darkMode ? 'border-neutral-800' : 'border-neutral-200';
  const tagColor = darkMode ? 'text-cyan-400' : 'text-cyan-600';

  if (filter) {
    const tagData = tags.find(([n]) => n === filter);
    return (
      <div>
        <button onClick={() => setFilter(null)} className={`flex items-center gap-2 ${textMuted} mb-4 text-sm font-mono`}>← back</button>
        <h2 className={`text-lg font-mono mb-4 ${tagColor}`}>{filter}</h2>
        <div className="space-y-0">
          {tagData?.[1].entries.sort((a, b) => b.date.localeCompare(a.date)).map(e => (
            <EntryItem key={e.id} entry={e} date={e.date} type="entries" showDate darkMode={darkMode} formatDate={formatDate} renderText={renderText} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tags.length === 0 ? (
        <p className={`text-center py-12 ${textMuted} text-sm font-mono`}>use #tags in your entries</p>
      ) : tags.map(([name, d]) => (
        <button key={name} onClick={() => setFilter(name)} className={`w-full flex items-center justify-between p-3 ${bgCard} rounded border ${border} transition-colors text-left`}>
          <span className={`font-mono text-sm ${tagColor}`}>{name}</span>
          <span className={`font-mono text-sm ${textMuted}`}>{d.count}</span>
        </button>
      ))}
    </div>
  );
}
