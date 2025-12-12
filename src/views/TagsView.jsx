import { EntryItem } from '../components/ui/EntryItem';
import { ActivityStats } from '../components/ui/ActivityStats';
import { useLanguage } from '../contexts/LanguageContext';

export function TagsView({ tags, filter, setFilter, darkMode, formatDate, renderText, onToggle, onDelete }) {
  const { t } = useLanguage();
  const text = darkMode ? 'text-neutral-100' : 'text-neutral-900';
  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';
  const bgCard = darkMode ? 'bg-neutral-900' : 'bg-white';
  const border = darkMode ? 'border-neutral-800' : 'border-neutral-200';
  const tagColor = darkMode ? 'text-cyan-400' : 'text-cyan-600';

  if (filter) {
    const tagData = tags.find(([n]) => n === filter);
    const entries = tagData?.[1].entries || [];
    return (
      <div>
        <button onClick={() => setFilter(null)} className={`flex items-center gap-2 ${textMuted} mb-4 text-sm font-mono`}>← {t('tags.back')}</button>
        <h2 className={`text-lg font-mono mb-4 ${tagColor}`}>{filter}</h2>
        <ActivityStats entries={entries} darkMode={darkMode} type="tag" />
        <div className={`text-xs ${textMuted} font-mono mb-2`}>{t('activity.allEntries')} ({entries.length})</div>
        <div className="space-y-0">
          {entries.sort((a, b) => b.date.localeCompare(a.date)).map(e => (
            <EntryItem key={e.id} entry={e} date={e.date} type="entries" showDate darkMode={darkMode} formatDate={formatDate} renderText={renderText} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tags.length === 0 ? (
        <p className={`text-center py-12 ${textMuted} text-sm font-mono`}>{t('tags.empty')}</p>
      ) : tags.map(([name, d]) => (
        <button key={name} onClick={() => setFilter(name)} className={`w-full flex items-center justify-between p-3 ${bgCard} rounded border ${border} transition-colors text-left`}>
          <span className={`font-mono text-sm ${tagColor}`}>{name}</span>
          <span className={`font-mono text-sm ${textMuted}`}>{d.count}</span>
        </button>
      ))}
    </div>
  );
}
