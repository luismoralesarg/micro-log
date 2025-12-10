import { EntryItem } from '../components/ui/EntryItem';
import { InputWithHighlight } from '../components/ui/InputWithHighlight';

export function DreamsView({ data, currentDate, newEntry, setNewEntry, darkMode, formatDate, renderText, onAdd, onToggle, onDelete, onChangeDate }) {
  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';
  const dayDreams = data.dreams[currentDate] || [];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => onChangeDate(-1)} className={`p-2 ${textMuted}`}>←</button>
        <div className="text-center">
          <h2 className="text-sm font-mono text-indigo-400">{formatDate(currentDate)}</h2>
          <p className={`text-xs ${textMuted} font-mono mt-0.5`}>dreams</p>
        </div>
        <button onClick={() => onChangeDate(1)} className={`p-2 ${textMuted}`}>→</button>
      </div>

      <div className="mb-6">
        <div className="flex gap-3 items-center">
          <span className="text-indigo-400 text-xs">○</span>
          <InputWithHighlight value={newEntry} onChange={setNewEntry} onSubmit={onAdd} placeholder="dream..." darkMode={darkMode} />
        </div>
      </div>

      <div className="space-y-0">
        {dayDreams.length === 0 ? (
          <p className={`text-center py-12 ${textMuted} text-sm font-mono`}>no dreams recorded</p>
        ) : dayDreams.map(entry => (
          <EntryItem key={entry.id} entry={entry} date={currentDate} type="dreams" darkMode={darkMode} formatDate={formatDate} renderText={renderText} onToggle={onToggle} onDelete={onDelete} />
        ))}
      </div>
    </>
  );
}
