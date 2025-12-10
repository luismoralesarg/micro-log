export function InputWithHighlight({ value, onChange, onSubmit, placeholder, darkMode }) {
  const text = darkMode ? 'text-neutral-100' : 'text-neutral-900';
  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';
  const border = darkMode ? 'border-neutral-800' : 'border-neutral-200';

  const renderHighlight = () => {
    return value.split(/(\s+)/).map((word, i) => {
      if (word.startsWith('#')) return <span key={i} className={darkMode ? 'text-cyan-400' : 'text-cyan-600'}>{word}</span>;
      if (word.startsWith('@')) return <span key={i} className={darkMode ? 'text-amber-400' : 'text-amber-600'}>{word}</span>;
      return <span key={i} className={text}>{word}</span>;
    });
  };

  return (
    <div className="flex-1 relative">
      <div className="absolute inset-0 py-2 pointer-events-none whitespace-pre overflow-hidden font-mono text-sm">
        {renderHighlight()}
      </div>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        placeholder={placeholder} style={{ caretColor: darkMode ? '#fafafa' : '#171717' }}
        className={`w-full bg-transparent border-b ${border} outline-none py-2 font-mono text-sm text-transparent placeholder:${textMuted}`} />
    </div>
  );
}
