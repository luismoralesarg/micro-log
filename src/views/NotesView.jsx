import { useLanguage } from '../contexts/LanguageContext';

export function NotesView({ data, newEntry, setNewEntry, darkMode, onAdd, onDelete }) {
  const { t, getLocale } = useLanguage();
  const text = darkMode ? 'text-neutral-100' : 'text-neutral-900';
  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';
  const bgCard = darkMode ? 'bg-neutral-900' : 'bg-white';
  const border = darkMode ? 'border-neutral-800' : 'border-neutral-200';

  return (
    <>
      <div className="mb-6">
        <textarea value={newEntry} onChange={(e) => setNewEntry(e.target.value)} placeholder={t('notes.placeholder')}
          className={`w-full ${bgCard} border ${border} rounded outline-none p-4 ${text} placeholder:${textMuted} min-h-[120px] resize-none font-mono text-sm`} />
        <button onClick={onAdd} disabled={!newEntry.trim()} className={`mt-2 px-4 py-2 ${darkMode ? 'bg-neutral-800 text-neutral-100' : 'bg-neutral-900 text-white'} rounded text-xs font-mono disabled:opacity-30`}>{t('notes.save')}</button>
      </div>

      <div className="space-y-3">
        {data.notes.length === 0 ? (
          <p className={`text-center py-12 ${textMuted} text-sm font-mono`}>{t('notes.empty')}</p>
        ) : data.notes.slice().reverse().map(note => (
          <div key={note.id} className={`group ${bgCard} p-4 rounded border ${border}`}>
            <p className={`${text} whitespace-pre-wrap font-mono text-sm`}>{note.text}</p>
            <div className="flex justify-between items-center mt-3">
              <span className={`text-xs ${textMuted} font-mono`}>{new Date(note.id).toLocaleDateString(getLocale())}</span>
              <button onClick={() => onDelete(note.id, null, 'notes')} className={`opacity-0 group-hover:opacity-100 ${textMuted} hover:text-red-500 text-xs`}>{t('notes.delete')}</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
