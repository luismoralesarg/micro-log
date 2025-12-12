import { PersonTagDetailView } from '../components/ui/PersonTagDetailView';
import { useLanguage } from '../contexts/LanguageContext';

export function TagsView({ tags, filter, setFilter, darkMode, formatDate, renderText, onToggle, onDelete, allEntries }) {
  const { t } = useLanguage();

  const text = darkMode ? 'text-neutral-100' : 'text-neutral-900';
  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';
  const bgCard = darkMode ? 'bg-neutral-900' : 'bg-white';
  const border = darkMode ? 'border-neutral-800' : 'border-neutral-200';
  const tagColor = darkMode ? 'text-cyan-400' : 'text-cyan-600';
  const tagBg = darkMode ? 'bg-cyan-400' : 'bg-cyan-500';

  if (filter) {
    const tagData = tags.find(([n]) => n === filter);
    return (
      <PersonTagDetailView
        name={filter}
        entries={tagData?.[1].entries || []}
        allEntries={allEntries}
        type="tag"
        darkMode={darkMode}
        formatDate={formatDate}
        renderText={renderText}
        onToggle={onToggle}
        onDelete={onDelete}
        onBack={() => setFilter(null)}
      />
    );
  }

  // Calculate days ago for most recent entry
  const getDaysAgo = (entries) => {
    if (!entries || entries.length === 0) return null;
    const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    const lastDate = new Date(sortedEntries[0].date + 'T12:00:00');
    const now = new Date();
    const days = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div>
      {/* Header */}
      <h1 className={`text-2xl font-bold ${text} mb-6`}>{t('nav.tags')}</h1>

      {/* List */}
      <div className="space-y-1">
        {tags.length === 0 ? (
          <p className={`text-center py-12 ${textMuted} text-sm font-mono`}>{t('tags.empty')}</p>
        ) : (
          tags.map(([name, d]) => {
            const daysAgo = getDaysAgo(d.entries);

            return (
              <button
                key={name}
                onClick={() => setFilter(name)}
                className={`w-full flex items-center justify-between p-3 hover:${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'} rounded transition-colors text-left`}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className={`w-6 h-6 rounded-full ${tagBg} flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">#</span>
                  </div>

                  {/* Name and details */}
                  <div>
                    <span className={`font-mono text-sm ${text} font-medium`}>
                      {name.replace('#', '')}
                    </span>
                    {daysAgo !== null && (
                      <div className={`text-xs ${textMuted} font-mono`}>
                        {daysAgo === 0 ? t('dates.today') : `${daysAgo} ${t('detail.daysAgo')}`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Count */}
                <span className={`font-mono text-sm ${textMuted}`}>
                  {d.count > 0 ? d.count : '-'}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
