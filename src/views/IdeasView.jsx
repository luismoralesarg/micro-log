export function IdeasView({ data, newEntry, setNewEntry, darkMode, onAdd, onDelete, onUpdateStatus }) {
  const text = darkMode ? 'text-neutral-100' : 'text-neutral-900';
  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';
  const bgCard = darkMode ? 'bg-neutral-900' : 'bg-white';
  const border = darkMode ? 'border-neutral-800' : 'border-neutral-200';

  return (
    <>
      <div className="mb-6 flex gap-2">
        <input type="text" value={newEntry} onChange={(e) => setNewEntry(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onAdd()}
          placeholder="new idea..." className={`flex-1 ${bgCard} border ${border} rounded outline-none px-4 py-3 ${text} placeholder:${textMuted} font-mono text-sm`} />
        <button onClick={onAdd} disabled={!newEntry.trim()} className={`px-4 py-2 ${darkMode ? 'bg-neutral-800' : 'bg-neutral-900'} text-white rounded text-xs font-mono disabled:opacity-30`}>+</button>
      </div>

      <div className="space-y-1">
        {data.ideas.length === 0 ? (
          <p className={`text-center py-12 ${textMuted} text-sm font-mono`}>no ideas yet</p>
        ) : data.ideas.slice().reverse().map(idea => (
          <div key={idea.id} className={`group flex items-center gap-3 p-3 rounded border ${border} ${
            idea.status === 'done' ? (darkMode ? 'bg-green-950/20' : 'bg-green-50') :
            idea.status === 'wip' ? (darkMode ? 'bg-yellow-950/20' : 'bg-yellow-50') : bgCard
          }`}>
            <select value={idea.status} onChange={(e) => onUpdateStatus(idea.id, e.target.value)}
              className={`text-xs bg-transparent border-none outline-none cursor-pointer font-mono ${textMuted}`}>
              <option value="new">○</option>
              <option value="wip">◐</option>
              <option value="done">●</option>
            </select>
            <p className={`flex-1 font-mono text-sm ${idea.status === 'done' ? `${textMuted} line-through` : text}`}>{idea.text}</p>
            <button onClick={() => onDelete(idea.id, null, 'ideas')} className={`opacity-0 group-hover:opacity-100 ${textMuted} hover:text-red-500 text-xs`}>×</button>
          </div>
        ))}
      </div>
    </>
  );
}
