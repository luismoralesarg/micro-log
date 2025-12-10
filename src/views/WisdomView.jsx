export function WisdomView({ data, newEntry, setNewEntry, darkMode, onAdd, onDelete, onToggle }) {
  const text = darkMode ? 'text-neutral-100' : 'text-neutral-900';
  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';
  const textSoft = darkMode ? 'text-neutral-400' : 'text-neutral-600';
  const bgCard = darkMode ? 'bg-neutral-900' : 'bg-white';
  const border = darkMode ? 'border-neutral-800' : 'border-neutral-200';

  return (
    <>
      <div className="mb-6">
        <textarea value={newEntry} onChange={(e) => setNewEntry(e.target.value)} placeholder="a quote, thought, or lesson..."
          className={`w-full ${bgCard} border ${border} rounded outline-none p-4 ${text} placeholder:${textMuted} min-h-[80px] resize-none font-mono text-sm italic`} />
        <button onClick={onAdd} disabled={!newEntry.trim()} className={`mt-2 px-4 py-2 ${darkMode ? 'bg-neutral-800' : 'bg-neutral-900'} text-white rounded text-xs font-mono disabled:opacity-30`}>save</button>
      </div>

      <div className="space-y-3">
        {data.wisdom.length === 0 ? (
          <p className={`text-center py-12 ${textMuted} text-sm font-mono`}>collect wisdom here</p>
        ) : data.wisdom.slice().reverse().map(w => (
          <div key={w.id} className={`group ${bgCard} p-4 rounded border ${border}`}>
            <p className={`${textSoft} italic font-mono text-sm whitespace-pre-wrap`}>"{w.text}"</p>
            <div className="flex justify-between items-center mt-3">
              <button onClick={() => onToggle(w.id, null, 'wisdom')} className={`text-xs ${w.highlight ? 'text-amber-500' : textMuted}`}>{w.highlight ? '●' : '○'}</button>
              <button onClick={() => onDelete(w.id, null, 'wisdom')} className={`opacity-0 group-hover:opacity-100 ${textMuted} hover:text-red-500 text-xs`}>×</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
