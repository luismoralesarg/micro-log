import { useState, useMemo } from 'react';
import { EntryItem } from './EntryItem';
import { useLanguage } from '../../contexts/LanguageContext';

export function PersonTagDetailView({
  name,
  entries,
  allEntries,
  type, // 'person' or 'tag'
  darkMode,
  formatDate,
  renderText,
  onToggle,
  onDelete,
  onBack
}) {
  const { t, getLocale } = useLanguage();
  const [activeTab, setActiveTab] = useState('entries');

  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';
  const text = darkMode ? 'text-neutral-100' : 'text-neutral-900';
  const bgCard = darkMode ? 'bg-neutral-900' : 'bg-white';
  const border = darkMode ? 'border-neutral-800' : 'border-neutral-200';
  const accentColor = type === 'person'
    ? (darkMode ? 'text-amber-400' : 'text-amber-600')
    : (darkMode ? 'text-cyan-400' : 'text-cyan-600');
  const accentBg = type === 'person'
    ? (darkMode ? 'bg-amber-400' : 'bg-amber-500')
    : (darkMode ? 'bg-cyan-400' : 'bg-cyan-500');
  const accentBgLight = type === 'person'
    ? (darkMode ? 'bg-amber-900/30' : 'bg-amber-100')
    : (darkMode ? 'bg-cyan-900/30' : 'bg-cyan-100');
  const accentBgMedium = type === 'person'
    ? (darkMode ? 'bg-amber-700/50' : 'bg-amber-300')
    : (darkMode ? 'bg-cyan-700/50' : 'bg-cyan-300');

  const icon = type === 'person' ? '@' : '#';
  const displayName = name.replace(/^[@#]/, '');

  // Calculate insights
  const insights = useMemo(() => {
    const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const firstEntry = sortedEntries[0];
    const lastEntry = sortedEntries[sortedEntries.length - 1];

    const firstDate = firstEntry ? new Date(firstEntry.date + 'T12:00:00') : null;
    const lastDate = lastEntry ? new Date(lastEntry.date + 'T12:00:00') : null;

    // Calculate frequency (mentions per week)
    let frequency = 0;
    if (firstDate && lastDate) {
      const daysDiff = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
      const weeksDiff = Math.max(1, daysDiff / 7);
      frequency = (entries.length / weeksDiff).toFixed(1);
    }

    // Highlight rate
    const highlightedCount = entries.filter(e => e.highlight).length;
    const highlightRate = entries.length > 0
      ? Math.round((highlightedCount / entries.length) * 100)
      : 0;

    // Mentions this month
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const mentionsThisMonth = entries.filter(e => e.date.startsWith(thisMonth)).length;

    // Monthly variation (for the year)
    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach((_, i) => { monthlyData[i] = 0; });
    entries.forEach(e => {
      const month = new Date(e.date + 'T12:00:00').getMonth();
      monthlyData[month]++;
    });
    const maxMonthly = Math.max(...Object.values(monthlyData), 1);

    // Weekday distribution
    const weekdayCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    entries.forEach(e => {
      const day = new Date(e.date + 'T12:00:00').getDay();
      weekdayCounts[day]++;
    });
    const maxWeekday = Math.max(...Object.values(weekdayCounts), 1);

    // Days since first/last used
    const daysSinceFirst = firstDate
      ? Math.floor((now - firstDate) / (1000 * 60 * 60 * 24))
      : 0;
    const daysSinceLast = lastDate
      ? Math.floor((now - lastDate) / (1000 * 60 * 60 * 24))
      : 0;

    // Calendar heatmap data (full year)
    const calendarData = {};
    entries.forEach(e => {
      if (!calendarData[e.date]) calendarData[e.date] = 0;
      calendarData[e.date]++;
    });

    return {
      firstDate,
      lastDate,
      daysSinceFirst,
      daysSinceLast,
      frequency,
      highlightRate,
      mentionsThisMonth,
      monthlyData,
      maxMonthly,
      weekdayCounts,
      maxWeekday,
      calendarData,
      totalCount: entries.length
    };
  }, [entries]);

  const formatFullDate = (date) => {
    if (!date) return '-';
    return date.toLocaleDateString(getLocale(), {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const tabs = [
    { id: 'entries', label: t('detail.entries') },
    { id: 'insights', label: t('detail.insights') },
    { id: 'details', label: t('detail.details') }
  ];

  const weekdays = [
    t('weekdays.su'), t('weekdays.mo'), t('weekdays.tu'),
    t('weekdays.we'), t('weekdays.th'), t('weekdays.fr'), t('weekdays.sa')
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Generate calendar grid for the year
  const generateCalendarGrid = () => {
    const today = new Date();
    const year = today.getFullYear();
    const grid = [];

    // Generate all months
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const monthDays = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        monthDays.push({
          date: dateStr,
          count: insights.calendarData[dateStr] || 0
        });
      }
      grid.push({ month: months[month], days: monthDays });
    }

    return grid;
  };

  const calendarGrid = generateCalendarGrid();

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className={`text-2xl font-bold ${accentColor} flex items-center gap-1`}>
          <span className={accentColor}>{icon}</span>
          {displayName}
        </h2>
      </div>

      {/* Tabs */}
      <div className={`flex gap-4 border-b ${border} mb-6`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 px-1 text-sm font-mono transition-colors ${
              activeTab === tab.id
                ? `${text} border-b-2 ${type === 'person' ? 'border-amber-500' : 'border-cyan-500'}`
                : textMuted
            }`}
          >
            {tab.id === 'entries' && '☰ '}
            {tab.id === 'insights' && '▐▐ '}
            {tab.id === 'details' && '◉ '}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Entries Tab */}
      {activeTab === 'entries' && (
        <div>
          {/* Year Calendar Heatmap */}
          <div className={`${bgCard} p-4 rounded border ${border} mb-6 overflow-x-auto`}>
            <div className="flex gap-1 min-w-max">
              {calendarGrid.map((monthData, mi) => (
                <div key={mi} className="flex flex-col gap-0.5">
                  <span className={`text-[10px] ${textMuted} font-mono mb-1 text-center`}>
                    {monthData.month}
                  </span>
                  <div className="grid grid-cols-7 gap-0.5">
                    {monthData.days.map((day, di) => (
                      <div
                        key={di}
                        className={`w-2 h-2 rounded-sm ${
                          day.count === 0
                            ? (darkMode ? 'bg-neutral-800' : 'bg-neutral-100')
                            : day.count === 1
                              ? accentBgLight
                              : day.count < 3
                                ? accentBgMedium
                                : accentBg
                        }`}
                        title={`${day.date}: ${day.count}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Count badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1 px-2 py-1 ${accentBgLight} rounded text-sm font-mono ${accentColor}`}>
              <span className={accentColor}>@</span>{insights.totalCount}
            </span>
            <span className={`text-xs ${textMuted} font-mono px-2 py-1 ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'} rounded`}>
              PRO<sub className={textMuted}>i</sub>
            </span>
          </div>

          {/* Entries list */}
          <div className="space-y-0">
            {entries.sort((a, b) => b.date.localeCompare(a.date)).map(e => (
              <div key={e.id}>
                <div className={`text-sm font-bold ${text} mt-4 mb-1`}>
                  {formatFullDate(new Date(e.date + 'T12:00:00'))}
                  <span className={`font-normal ${textMuted} ml-2`}>
                    {insights.daysSinceLast > 0 && e.date === entries.sort((a, b) => b.date.localeCompare(a.date))[0]?.date
                      ? `${Math.floor((new Date() - new Date(e.date + 'T12:00:00')) / (1000 * 60 * 60 * 24))} ${t('detail.daysAgo')}`
                      : ''
                    }
                  </span>
                </div>
                <EntryItem
                  entry={e}
                  date={e.date}
                  type="entries"
                  showDate={false}
                  darkMode={darkMode}
                  formatDate={formatDate}
                  renderText={renderText}
                  onToggle={onToggle}
                  onDelete={onDelete}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* PRO Badge */}
          <div>
            <span className={`text-xs ${textMuted} font-mono px-2 py-1 ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'} rounded`}>
              PRO<sub className={textMuted}>i</sub>
            </span>
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <div className={`flex gap-2 text-sm ${text}`}>
              <span className={textMuted}>{t('detail.firstUsed')}:</span>
              <span className="font-semibold">{formatFullDate(insights.firstDate)}</span>
              <span className={textMuted}>{insights.daysSinceFirst} {t('detail.daysAgo')}</span>
            </div>
            <div className={`flex gap-2 text-sm ${text}`}>
              <span className={textMuted}>{t('detail.lastUsed')}:</span>
              <span className="font-semibold">{formatFullDate(insights.lastDate)}</span>
              <span className={textMuted}>{insights.daysSinceLast} {t('detail.daysAgo')}</span>
            </div>
            <div className={`flex gap-2 text-sm ${text}`}>
              <span className={textMuted}>{t('detail.frequency')}:</span>
              <span className="font-semibold">{insights.frequency}</span>
              <span className={textMuted}>/ {t('detail.week')}</span>
            </div>
            <div className={`flex gap-2 text-sm ${text}`}>
              <span className={textMuted}>{t('detail.highlightRate')}:</span>
              <span className="font-semibold">{insights.highlightRate}%</span>
            </div>
            <div className={`flex gap-2 text-sm ${text}`}>
              <span className={textMuted}>{type === 'person' ? t('detail.mentionsThisMonth') : t('detail.tagsThisMonth')}:</span>
              <span className="font-semibold">{insights.mentionsThisMonth}</span>
            </div>
          </div>

          {/* Monthly Variation Chart */}
          <div className={`${bgCard} p-4 rounded border ${border}`}>
            <h3 className={`text-sm font-semibold ${text} mb-4`}>{t('detail.monthlyVariation')}</h3>
            <div className="flex justify-between items-end h-24 gap-1">
              {months.map((month, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-sm transition-all ${accentBg}`}
                    style={{
                      height: `${(insights.monthlyData[i] / insights.maxMonthly) * 100}%`,
                      minHeight: insights.monthlyData[i] > 0 ? '4px' : '2px',
                      opacity: insights.monthlyData[i] > 0 ? 1 : 0.3
                    }}
                  />
                  <span className={`text-[10px] ${textMuted} font-mono`}>{month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className={`text-xs ${textMuted}`}>1</span>
              <span className={`text-xs ${textMuted}`}>0</span>
            </div>
          </div>

          {/* Weekday Distribution Chart */}
          <div className={`${bgCard} p-4 rounded border ${border}`}>
            <h3 className={`text-sm font-semibold ${text} mb-4`}>{t('detail.weekdayDistribution')}</h3>
            {insights.totalCount >= 5 ? (
              <div className="flex justify-between items-end h-16 gap-1">
                {weekdays.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-sm ${accentBg}`}
                      style={{
                        height: `${(insights.weekdayCounts[i] / insights.maxWeekday) * 100}%`,
                        minHeight: insights.weekdayCounts[i] > 0 ? '4px' : '2px',
                        opacity: insights.weekdayCounts[i] > 0 ? 1 : 0.3
                      }}
                    />
                    <span className={`text-xs ${textMuted} font-mono`}>{day}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${textMuted}`}>
                {type === 'person'
                  ? t('detail.weekdayMinPerson')
                  : t('detail.weekdayMinTag')
                }
              </p>
            )}
          </div>
        </div>
      )}

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="space-y-4">
          <div className={`${bgCard} p-4 rounded border ${border}`}>
            <h3 className={`text-sm font-semibold ${text} mb-3`}>{t('detail.about')}</h3>
            <div className="space-y-2">
              <div className={`flex justify-between text-sm`}>
                <span className={textMuted}>{t('detail.name')}</span>
                <span className={text}>{displayName}</span>
              </div>
              <div className={`flex justify-between text-sm`}>
                <span className={textMuted}>{t('detail.type')}</span>
                <span className={text}>{type === 'person' ? t('detail.typePerson') : t('detail.typeTag')}</span>
              </div>
              <div className={`flex justify-between text-sm`}>
                <span className={textMuted}>{t('detail.totalMentions')}</span>
                <span className={text}>{insights.totalCount}</span>
              </div>
              <div className={`flex justify-between text-sm`}>
                <span className={textMuted}>{t('detail.highlighted')}</span>
                <span className={text}>{entries.filter(e => e.highlight).length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className={`fixed bottom-16 left-0 right-0 ${bgCard} border-t ${border} z-10`}>
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between">
          <button
            onClick={onBack}
            className={`text-sm ${textMuted} hover:${text} font-mono flex items-center gap-1`}
          >
            ←
          </button>
          <button
            onClick={onBack}
            className={`text-sm ${textMuted} hover:${text} font-mono`}
          >
            ☰
          </button>
          <div className={`text-xs ${textMuted} font-mono flex items-center gap-1`}>
            {t('detail.allTime')} <span className="opacity-50">⏱</span>
          </div>
        </div>
      </div>
    </div>
  );
}
