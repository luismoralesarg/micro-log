import { useState, useCallback } from 'react';
import { useJournal } from './hooks/useJournal';
import { useVault } from './hooks/useVault';
import { useLanguage } from './contexts/LanguageContext';

// Security: Escape special regex characters to prevent ReDoS
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

import { SetupView } from './views/SetupView';
import { JournalView } from './views/JournalView';
import { DreamsView } from './views/DreamsView';
import { TagsView } from './views/TagsView';
import { PeopleView } from './views/PeopleView';
import { NotesView } from './views/NotesView';
import { IdeasView } from './views/IdeasView';
import { WisdomView } from './views/WisdomView';
import { InsightsView } from './views/InsightsView';

const modules = [
  { id: 'journal', labelKey: 'nav.log' },
  { id: 'dreams', labelKey: 'nav.dreams' },
  { id: 'tags', labelKey: 'nav.tags' },
  { id: 'people', labelKey: 'nav.people' },
  { id: 'notes', labelKey: 'nav.notes' },
  { id: 'ideas', labelKey: 'nav.ideas' },
  { id: 'wisdom', labelKey: 'nav.quotes' },
  { id: 'insights', labelKey: 'nav.stats' },
];

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEntry, setNewEntry] = useState('');
  const [view, setView] = useState('journal');
  const [filter, setFilter] = useState(null);
  const [darkMode, setDarkMode] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

  const { vaultPath, loading: vaultLoading, isConfigured, isElectron, configureVault, clearVault } = useVault();
  const { data, loading: dataLoading, addEntry, toggleHighlight, deleteItem, updateIdeaStatus, reload } = useJournal();
  const { t, language, setLanguage, getLocale, loading: langLoading } = useLanguage();

  const handleAddEntry = () => { if (addEntry(view, currentDate, newEntry)) setNewEntry(''); };
  const changeDate = (days) => { const d = new Date(currentDate); d.setDate(d.getDate() + days); setCurrentDate(d.toISOString().split('T')[0]); };

  const formatDate = useCallback((dateStr) => {
    const date = new Date(dateStr + 'T12:00:00');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dateStr === today) return t('dates.today');
    if (dateStr === yesterday) return t('dates.yesterday');
    return date.toLocaleDateString(getLocale(), { month: 'short', day: 'numeric' }).toLowerCase();
  }, [t, getLocale]);

  const extractItems = useCallback((prefix) => {
    const items = {};
    // Security: Escape regex special characters in prefix
    const escapedPrefix = escapeRegex(prefix);
    Object.entries(data.entries).forEach(([date, dayEntries]) => {
      dayEntries.forEach(entry => {
        (entry.text.match(new RegExp(`${escapedPrefix}[\\w-]+`, 'g')) || []).forEach(match => {
          if (!items[match]) items[match] = { count: 0, entries: [] };
          items[match].count++;
          items[match].entries.push({ ...entry, date });
        });
      });
    });
    return Object.entries(items).sort((a, b) => b[1].count - a[1].count);
  }, [data.entries]);

  // Open URL in default browser
  const openUrl = useCallback((url) => {
    // Ensure URL has protocol
    const fullUrl = url.startsWith('www.') ? `https://${url}` : url;
    // Use Electron API if available, otherwise fallback to window.open
    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(fullUrl);
    } else {
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const renderText = useCallback((text) => {
    // Extract clean tag/mention (only valid characters: word chars and hyphens)
    const extractCleanTag = (word, prefix) => {
      const match = word.match(new RegExp(`^${escapeRegex(prefix)}[\\w-]+`));
      return match ? match[0] : word;
    };

    // Extract clean URL (remove trailing punctuation)
    const extractCleanUrl = (word) => {
      const match = word.match(/^(https?:\/\/[^\s]+?|www\.[^\s]+?)(?=[.,;:!?)]*$|$)/i);
      return match ? match[1] : word;
    };

    return text.split(/(\s+)/).map((word, i) => {
      if (word.startsWith('#')) {
        const cleanTag = extractCleanTag(word, '#');
        return <span key={i} className={`${darkMode ? 'text-cyan-400' : 'text-cyan-600'} cursor-pointer hover:underline`} onClick={() => { setFilter(cleanTag); setView('tags'); }}>{word}</span>;
      }
      if (word.startsWith('@')) {
        const cleanMention = extractCleanTag(word, '@');
        return <span key={i} className={`${darkMode ? 'text-amber-400' : 'text-amber-600'} cursor-pointer hover:underline`} onClick={() => { setFilter(cleanMention); setView('people'); }}>{word}</span>;
      }
      // Check for URLs (http://, https://, or www.)
      if (word.match(/^(https?:\/\/|www\.)/i)) {
        const cleanUrl = extractCleanUrl(word);
        const trailing = word.slice(cleanUrl.length);
        return (
          <span key={i}>
            <span
              className={`${darkMode ? 'text-violet-400' : 'text-violet-600'} cursor-pointer hover:underline`}
              onClick={() => openUrl(cleanUrl)}
            >
              {cleanUrl}
            </span>
            {trailing}
          </span>
        );
      }
      return word;
    });
  }, [darkMode, openUrl]);

  const handleSetupComplete = useCallback(async (path) => {
    // Configure vault and reload data
    const result = await configureVault(path);
    if (result.success) {
      await reload();
    }
    return result;
  }, [configureVault, reload]);

  const handleChangeVault = useCallback(async () => {
    if (confirm(t('confirm.changeVault'))) {
      await clearVault();
    }
  }, [clearVault, t]);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'es' : 'en');
  }, [language, setLanguage]);

  const tags = extractItems('#');
  const people = extractItems('@');

  const bg = darkMode ? 'bg-neutral-950' : 'bg-neutral-50';
  const bgCard = darkMode ? 'bg-neutral-900' : 'bg-white';
  const border = darkMode ? 'border-neutral-800' : 'border-neutral-200';
  const text = darkMode ? 'text-neutral-100' : 'text-neutral-900';
  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';

  // Show loading while checking vault configuration or language
  if (vaultLoading || langLoading) {
    return <div className={`min-h-screen ${bg} flex items-center justify-center`}><div className={`${textMuted} font-mono text-sm`}>{t('app.loading')}</div></div>;
  }

  // Show setup view if vault not configured (Electron only)
  if (isElectron && !isConfigured) {
    return <SetupView darkMode={darkMode} onSetupComplete={handleSetupComplete} />;
  }

  // Show loading while data is loading
  if (dataLoading) {
    return <div className={`min-h-screen ${bg} flex items-center justify-center`}><div className={`${textMuted} font-mono text-sm`}>{t('app.loading')}</div></div>;
  }

  return (
    <div className={`min-h-screen ${bg} pb-16 transition-colors`}>
      <header className={`${bgCard} border-b ${border} sticky top-0 z-20`}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className={`text-sm font-mono ${text}`}>{t('app.name')}</h1>
              {isElectron && vaultPath && (
                <span className={`text-xs font-mono ${textMuted} hidden sm:inline`} title={vaultPath}>
                  [{vaultPath.split('/').pop() || vaultPath.split('\\').pop()}]
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button onClick={toggleLanguage} className={`text-xs ${textMuted} font-mono hover:${text}`} title="Change language">
                {language.toUpperCase()}
              </button>
              {isElectron && (
                <button onClick={handleChangeVault} className={`text-xs ${textMuted} font-mono hover:${text}`} title="Change vault location">
                  {t('header.vault')}
                </button>
              )}
              <button onClick={() => setDarkMode(!darkMode)} className={`text-xs ${textMuted} font-mono`}>{darkMode ? t('header.light') : t('header.dark')}</button>
            </div>
          </div>
          <nav className="flex gap-1 mt-4 overflow-x-auto pb-1 -mb-1">
            {modules.map(m => (
              <button key={m.id} onClick={() => { setView(m.id); setFilter(null); }}
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors whitespace-nowrap ${view === m.id ? `${darkMode ? 'bg-neutral-800 text-neutral-100' : 'bg-neutral-900 text-white'}` : textMuted}`}>
                {t(m.labelKey)}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {view === 'journal' && <JournalView data={data} currentDate={currentDate} newEntry={newEntry} setNewEntry={setNewEntry} darkMode={darkMode} formatDate={formatDate} renderText={renderText} onAdd={handleAddEntry} onToggle={toggleHighlight} onDelete={deleteItem} onChangeDate={changeDate} />}
        {view === 'dreams' && <DreamsView data={data} currentDate={currentDate} newEntry={newEntry} setNewEntry={setNewEntry} darkMode={darkMode} formatDate={formatDate} renderText={renderText} onAdd={handleAddEntry} onToggle={toggleHighlight} onDelete={deleteItem} onChangeDate={changeDate} />}
        {view === 'tags' && <TagsView tags={tags} filter={filter} setFilter={setFilter} darkMode={darkMode} formatDate={formatDate} renderText={renderText} onToggle={toggleHighlight} onDelete={deleteItem} />}
        {view === 'people' && <PeopleView people={people} filter={filter} setFilter={setFilter} darkMode={darkMode} formatDate={formatDate} renderText={renderText} onToggle={toggleHighlight} onDelete={deleteItem} />}
        {view === 'notes' && <NotesView data={data} newEntry={newEntry} setNewEntry={setNewEntry} darkMode={darkMode} onAdd={handleAddEntry} onDelete={deleteItem} />}
        {view === 'ideas' && <IdeasView data={data} newEntry={newEntry} setNewEntry={setNewEntry} darkMode={darkMode} onAdd={handleAddEntry} onDelete={deleteItem} onUpdateStatus={updateIdeaStatus} />}
        {view === 'wisdom' && <WisdomView data={data} newEntry={newEntry} setNewEntry={setNewEntry} darkMode={darkMode} onAdd={handleAddEntry} onDelete={deleteItem} onToggle={toggleHighlight} />}
        {view === 'insights' && <InsightsView data={data} tags={tags} people={people} darkMode={darkMode} />}
      </div>

      <footer className={`fixed bottom-0 left-0 right-0 ${bgCard} border-t ${border} z-10`}>
        <div className="max-w-2xl mx-auto px-4 py-3 text-center">
          <span className={`text-xs font-mono ${textMuted}`}>
            built by{' '}
            <a
              href="https://github.com/luismoralesarg/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-500'} hover:underline`}
            >
              luismo
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
