import { EntryItem } from '../components/ui/EntryItem';
import { useLanguage } from '../contexts/LanguageContext';

export function PeopleView({ people, filter, setFilter, darkMode, formatDate, renderText, onToggle, onDelete }) {
  const { t } = useLanguage();
  const text = darkMode ? 'text-neutral-100' : 'text-neutral-900';
  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';
  const bgCard = darkMode ? 'bg-neutral-900' : 'bg-white';
  const border = darkMode ? 'border-neutral-800' : 'border-neutral-200';
  const personColor = darkMode ? 'text-amber-400' : 'text-amber-600';

  if (filter) {
    const personData = people.find(([n]) => n === filter);
    return (
      <div>
        <button onClick={() => setFilter(null)} className={`flex items-center gap-2 ${textMuted} mb-4 text-sm font-mono`}>← {t('people.back')}</button>
        <h2 className={`text-lg font-mono mb-4 ${personColor}`}>{filter}</h2>
        <div className="space-y-0">
          {personData?.[1].entries.sort((a, b) => b.date.localeCompare(a.date)).map(e => (
            <EntryItem key={e.id} entry={e} date={e.date} type="entries" showDate darkMode={darkMode} formatDate={formatDate} renderText={renderText} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {people.length === 0 ? (
        <p className={`text-center py-12 ${textMuted} text-sm font-mono`}>{t('people.empty')}</p>
      ) : people.map(([name, d]) => (
        <button key={name} onClick={() => setFilter(name)} className={`w-full flex items-center justify-between p-3 ${bgCard} rounded border ${border} transition-colors text-left`}>
          <span className={`font-mono text-sm ${personColor}`}>{name}</span>
          <span className={`font-mono text-sm ${textMuted}`}>{d.count}</span>
        </button>
      ))}
    </div>
  );
}
