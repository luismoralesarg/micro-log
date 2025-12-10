import { StatCard } from '../components/ui/StatCard';

export function InsightsView({ data, tags, people, darkMode }) {
  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';
  const bgCard = darkMode ? 'bg-neutral-900' : 'bg-white';
  const border = darkMode ? 'border-neutral-800' : 'border-neutral-200';
  const tagColor = darkMode ? 'text-cyan-400' : 'text-cyan-600';
  const personColor = darkMode ? 'text-amber-400' : 'text-amber-600';

  const insights = getInsights(data);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="entries" value={insights.totalEntries} darkMode={darkMode} />
        <StatCard label="words" value={insights.totalWords.toLocaleString()} darkMode={darkMode} />
        <StatCard label="starred" value={insights.highlights} darkMode={darkMode} />
        <StatCard label="streak" value={`${insights.currentStreak}d`} sub={`best: ${insights.streak}d`} darkMode={darkMode} />
      </div>

      <div className={`${bgCard} p-4 rounded border ${border}`}>
        <div className={`text-xs ${textMuted} font-mono uppercase tracking-wide mb-3`}>last 30 days</div>
        <div className="flex gap-0.5">
          {insights.last30.map((d, i) => (
            <div key={i} className={`flex-1 h-8 rounded-sm ${
              d.count === 0 ? (darkMode ? 'bg-neutral-800' : 'bg-neutral-100') :
              d.count < 3 ? (darkMode ? 'bg-cyan-900' : 'bg-cyan-100') :
              d.count < 5 ? (darkMode ? 'bg-cyan-700' : 'bg-cyan-300') : (darkMode ? 'bg-cyan-500' : 'bg-cyan-500')
            }`} title={`${d.date}: ${d.count}`} />
          ))}
        </div>
      </div>

      <div className={`${bgCard} p-4 rounded border ${border}`}>
        <div className={`text-xs ${textMuted} font-mono uppercase tracking-wide mb-3`}>by weekday</div>
        <div className="flex justify-between items-end h-16 gap-1">
          {insights.weekdays.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full rounded-sm ${darkMode ? 'bg-cyan-600' : 'bg-cyan-400'}`}
                style={{ height: insights.maxWeekday ? `${(insights.weekdayCounts[i] / insights.maxWeekday) * 100}%` : '0%', minHeight: insights.weekdayCounts[i] > 0 ? '4px' : '1px' }} />
              <span className={`text-xs ${textMuted} font-mono`}>{day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="dreams" value={insights.daysWithDreams} darkMode={darkMode} />
        <StatCard label="notes" value={insights.notes} darkMode={darkMode} />
        <StatCard label="ideas" value={insights.ideas} sub={`${insights.ideasDone} done`} darkMode={darkMode} />
        <StatCard label="quotes" value={insights.wisdom} darkMode={darkMode} />
      </div>

      {(tags.length > 0 || people.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {tags.length > 0 && (
            <div className={`${bgCard} p-4 rounded border ${border}`}>
              <div className={`text-xs ${textMuted} font-mono uppercase tracking-wide mb-2`}>top tags</div>
              {tags.slice(0, 5).map(([name, d]) => (
                <div key={name} className="flex justify-between py-1">
                  <span className={`font-mono text-sm ${tagColor}`}>{name}</span>
                  <span className={`font-mono text-sm ${textMuted}`}>{d.count}</span>
                </div>
              ))}
            </div>
          )}
          {people.length > 0 && (
            <div className={`${bgCard} p-4 rounded border ${border}`}>
              <div className={`text-xs ${textMuted} font-mono uppercase tracking-wide mb-2`}>top people</div>
              {people.slice(0, 5).map(([name, d]) => (
                <div key={name} className="flex justify-between py-1">
                  <span className={`font-mono text-sm ${personColor}`}>{name}</span>
                  <span className={`font-mono text-sm ${textMuted}`}>{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getInsights(data) {
  const allEntries = Object.entries(data.entries).flatMap(([date, entries]) => entries.map(e => ({ ...e, date })));
  const totalWords = allEntries.reduce((sum, e) => sum + e.text.split(/\s+/).length, 0);
  const highlights = allEntries.filter(e => e.highlight).length;
  const daysWithEntries = Object.keys(data.entries).filter(d => data.entries[d].length > 0).sort();
  const daysWithDreams = Object.keys(data.dreams).filter(d => data.dreams[d].length > 0).length;

  let streak = 0, currentStreak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (data.entries[dateStr]?.length > 0) { currentStreak++; streak = Math.max(streak, currentStreak); }
    else if (i > 0) currentStreak = 0;
  }

  const hourCounts = {};
  allEntries.forEach(e => { const hour = parseInt(e.time?.split(':')[0] || '12'); hourCounts[hour] = (hourCounts[hour] || 0) + 1; });
  const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];

  const weekdayCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  daysWithEntries.forEach(d => { weekdayCounts[new Date(d + 'T12:00:00').getDay()]++; });
  const weekdays = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];
  const maxWeekday = Math.max(...Object.values(weekdayCounts));

  const last30 = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    last30.push({ date: dateStr, count: data.entries[dateStr]?.length || 0 });
  }

  return {
    totalEntries: allEntries.length, totalWords, highlights, daysActive: daysWithEntries.length, daysWithDreams,
    streak, currentStreak, peakHour, weekdayCounts, weekdays, maxWeekday, last30,
    notes: data.notes.length, ideas: data.ideas.length, ideasDone: data.ideas.filter(i => i.status === 'done').length, wisdom: data.wisdom.length
  };
}
