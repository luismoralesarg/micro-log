import { EntryItem } from '../components/ui/EntryItem';
import { InputWithHighlight } from '../components/ui/InputWithHighlight';
import { useLanguage } from '../contexts/LanguageContext';

export function JournalView({ data, currentDate, newEntry, setNewEntry, darkMode, formatDate, renderText, onAdd, onToggle, onDelete, onChangeDate }) {
  const { t } = useLanguage();
  const text = darkMode ? 'text-neutral-100' : 'text-neutral-900';
  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';
  const dayEntries = data.entries[currentDate] || [];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => onChangeDate(-1)} className={`p-2 ${textMuted}`}>←</button>
        <div className="text-center">
          <h2 className={`text-sm font-mono ${text}`}>{formatDate(currentDate)}</h2>
          <p className={`text-xs ${textMuted} font-mono mt-0.5`}>{currentDate}</p>
        </div>
        <button onClick={() => onChangeDate(1)} className={`p-2 ${textMuted}`}>→</button>
      </div>

      <div className="mb-6">
        <div className="flex gap-3 items-center">
          <span className={`${textMuted} text-xs`}>○</span>
          <InputWithHighlight value={newEntry} onChange={setNewEntry} onSubmit={onAdd} placeholder={t('journal.placeholder')} darkMode={darkMode} />
        </div>
      </div>

      <div className="space-y-0">
        {dayEntries.length === 0 ? (
          <p className={`text-center py-12 ${textMuted} text-sm font-mono`}>{t('journal.empty')}</p>
        ) : dayEntries.map(entry => (
          <EntryItem key={entry.id} entry={entry} date={currentDate} type="entries" darkMode={darkMode} formatDate={formatDate} renderText={renderText} onToggle={onToggle} onDelete={onDelete} />
        ))}
      </div>
    </>
  );
}
