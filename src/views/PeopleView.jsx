import { useState } from 'react';
import { PersonTagDetailView } from '../components/ui/PersonTagDetailView';
import { useLanguage } from '../contexts/LanguageContext';

export function PeopleView({ people, filter, setFilter, darkMode, formatDate, renderText, onToggle, onDelete, allEntries }) {
  const { t } = useLanguage();
  const [listFilter, setListFilter] = useState('all');

  const text = darkMode ? 'text-neutral-100' : 'text-neutral-900';
  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';
  const bgCard = darkMode ? 'bg-neutral-900' : 'bg-white';
  const border = darkMode ? 'border-neutral-800' : 'border-neutral-200';
  const personColor = darkMode ? 'text-amber-400' : 'text-amber-600';
  const personBg = darkMode ? 'bg-amber-400' : 'bg-amber-500';

  // Detect groups (entries with multiple @ mentions that could be groups)
  const groups = people.filter(([name]) => {
    // Check if this "person" appears with a pattern suggesting it's a group
    // Groups typically have capital letters and no lowercase
    const cleanName = name.replace('@', '');
    return cleanName.length > 0 && cleanName[0] === cleanName[0].toUpperCase() &&
           !cleanName.split('').some(c => c >= 'a' && c <= 'z');
  });

  // Get filtered list based on tab
  const filteredPeople = listFilter === 'groups'
    ? groups
    : people;

  if (filter) {
    const personData = people.find(([n]) => n === filter);
    return (
      <PersonTagDetailView
        name={filter}
        entries={personData?.[1].entries || []}
        allEntries={allEntries}
        type="person"
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
      <h1 className={`text-2xl font-bold ${text} mb-6`}>{t('nav.people')}</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setListFilter('all')}
          className={`text-sm font-mono flex items-center gap-1 ${listFilter === 'all' ? text : textMuted}`}
        >
          <span>☰</span> {t('people.all')}
        </button>
        <button
          onClick={() => setListFilter('groups')}
          className={`text-sm font-mono flex items-center gap-1 ${listFilter === 'groups' ? text : textMuted}`}
        >
          <span>👥</span> {t('people.groups')}
        </button>
      </div>

      {/* List */}
      <div className="space-y-1">
        {filteredPeople.length === 0 ? (
          <p className={`text-center py-12 ${textMuted} text-sm font-mono`}>
            {listFilter === 'groups' ? t('people.emptyGroups') : t('people.empty')}
          </p>
        ) : (
          filteredPeople.map(([name, d]) => {
            const daysAgo = getDaysAgo(d.entries);
            const isGroup = groups.some(([gName]) => gName === name);

            return (
              <button
                key={name}
                onClick={() => setFilter(name)}
                className={`w-full flex items-center justify-between p-3 hover:${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'} rounded transition-colors text-left`}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className={`w-6 h-6 rounded-full ${personBg} flex items-center justify-center`}>
                    <span className="text-white text-xs">
                      {isGroup ? '👥' : '@'}
                    </span>
                  </div>

                  {/* Name and details */}
                  <div>
                    <span className={`font-mono text-sm ${text} font-medium`}>
                      {name.replace('@', '')}
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
