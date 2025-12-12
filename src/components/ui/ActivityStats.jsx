import { useLanguage } from '../../contexts/LanguageContext';

export function ActivityStats({ entries, darkMode, type = 'tag' }) {
  const { t } = useLanguage();

  const bgCard = darkMode ? 'bg-neutral-900' : 'bg-white';
  const border = darkMode ? 'border-neutral-800' : 'border-neutral-200';
  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';
  const text = darkMode ? 'text-neutral-100' : 'text-neutral-900';
  const tagColor = darkMode ? 'text-cyan-400' : 'text-cyan-600';
  const personColor = darkMode ? 'text-amber-400' : 'text-amber-600';
  const highlightColor = darkMode ? 'text-yellow-400' : 'text-yellow-600';

  if (!entries || entries.length === 0) return null;

  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  // First and last time
  const firstEntry = sortedEntries[0];
  const lastEntry = sortedEntries[sortedEntries.length - 1];

  // Highlighted rate
  const highlightedCount = entries.filter(e => e.highlight).length;
  const highlightRate = Math.round((highlightedCount / entries.length) * 100);

  // Frequency: calculate entries per week on average
  const firstDate = new Date(firstEntry.date);
  const lastDate = new Date(lastEntry.date);
  const daysDiff = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
  const weeksDiff = Math.max(1, daysDiff / 7);
  const frequency = (entries.length / weeksDiff).toFixed(1);

  // Get related tags/people this month
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const thisMonthEntries = entries.filter(e => e.date.startsWith(currentMonth));

  // Extract related items (opposite type)
  const relatedItems = {};
  const prefix = type === 'tag' ? '@' : '#';

  thisMonthEntries.forEach(entry => {
    const matches = entry.text.match(new RegExp(`${prefix}[\\w-]+`, 'g')) || [];
    matches.forEach(match => {
      relatedItems[match] = (relatedItems[match] || 0) + 1;
    });
  });

  const topRelated = Object.entries(relatedItems)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Activity by month (last 6 months for the activity graph)
  const monthlyActivity = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    monthlyActivity[key] = 0;
  }

  entries.forEach(entry => {
    const monthKey = entry.date.slice(0, 7);
    if (monthlyActivity.hasOwnProperty(monthKey)) {
      monthlyActivity[monthKey]++;
    }
  });

  const maxMonthly = Math.max(...Object.values(monthlyActivity), 1);

  const formatDateShort = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year.slice(2)}`;
  };

  const getMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const monthNames = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    return monthNames[parseInt(month) - 1];
  };

  return (
    <div className={`mb-6 p-4 ${bgCard} rounded-lg border ${border}`}>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className={`text-xs ${textMuted} font-mono mb-1`}>{t('activity.firstTime')}</div>
          <div className={`text-sm ${text} font-mono`}>{formatDateShort(firstEntry.date)}</div>
        </div>
        <div className="text-center">
          <div className={`text-xs ${textMuted} font-mono mb-1`}>{t('activity.lastTime')}</div>
          <div className={`text-sm ${text} font-mono`}>{formatDateShort(lastEntry.date)}</div>
        </div>
        <div className="text-center">
          <div className={`text-xs ${textMuted} font-mono mb-1`}>{t('activity.frequency')}</div>
          <div className={`text-sm ${text} font-mono`}>{frequency}/{t('activity.week')}</div>
        </div>
        <div className="text-center">
          <div className={`text-xs ${textMuted} font-mono mb-1`}>{t('activity.highlightRate')}</div>
          <div className={`text-sm ${highlightColor} font-mono`}>● {highlightRate}%</div>
        </div>
      </div>

      {/* Activity Graph */}
      <div className="mb-4">
        <div className={`text-xs ${textMuted} font-mono mb-2`}>{t('activity.activityGraph')}</div>
        <div className="flex items-end gap-1 h-12">
          {Object.entries(monthlyActivity).map(([month, count]) => {
            const height = Math.max(4, (count / maxMonthly) * 100);
            const barColor = type === 'tag'
              ? (darkMode ? 'bg-cyan-400' : 'bg-cyan-500')
              : (darkMode ? 'bg-amber-400' : 'bg-amber-500');
            return (
              <div key={month} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full ${barColor} rounded-t transition-all`}
                  style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '2px', opacity: count > 0 ? 1 : 0.2 }}
                  title={`${month}: ${count}`}
                />
                <div className={`text-[10px] ${textMuted} font-mono mt-1`}>{getMonthLabel(month)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Related items this month */}
      {topRelated.length > 0 && (
        <div>
          <div className={`text-xs ${textMuted} font-mono mb-2`}>
            {type === 'tag' ? t('activity.peopleThisMonth') : t('activity.tagsThisMonth')}
          </div>
          <div className="flex flex-wrap gap-2">
            {topRelated.map(([item, count]) => (
              <span
                key={item}
                className={`text-xs font-mono px-2 py-1 rounded ${
                  type === 'tag' ? personColor : tagColor
                } ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}
              >
                {item} <span className={textMuted}>({count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {thisMonthEntries.length > 0 && (
        <div className={`mt-3 pt-3 border-t ${border}`}>
          <div className={`text-xs ${textMuted} font-mono`}>
            {t('activity.thisMonth')}: <span className={text}>{thisMonthEntries.length}</span> {t('activity.entries')}
          </div>
        </div>
      )}
    </div>
  );
}
