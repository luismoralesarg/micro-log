import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { deriveKey, generateSalt, uint8ToBase64, base64ToUint8, hashPassphrase } from './lib/crypto';
import { useSubscription } from './hooks/useSubscription';
import { useJournal } from './hooks/useJournal';

import { AuthScreen } from './components/AuthScreen';
import { PassphraseSetup } from './components/PassphraseSetup';
import { Paywall, TrialBanner, SubscriptionBadge } from './components/Paywall';

import { JournalView } from './views/JournalView';
import { DreamsView } from './views/DreamsView';
import { TagsView } from './views/TagsView';
import { PeopleView } from './views/PeopleView';
import { NotesView } from './views/NotesView';
import { IdeasView } from './views/IdeasView';
import { WisdomView } from './views/WisdomView';
import { InsightsView } from './views/InsightsView';

const modules = [
  { id: 'journal', label: 'log' },
  { id: 'dreams', label: 'dreams' },
  { id: 'tags', label: 'tags' },
  { id: 'people', label: 'people' },
  { id: 'notes', label: 'notes' },
  { id: 'ideas', label: 'ideas' },
  { id: 'wisdom', label: 'quotes' },
  { id: 'insights', label: 'stats' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cryptoKey, setCryptoKey] = useState(null);
  const [needsPassphrase, setNeedsPassphrase] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [userSalt, setUserSalt] = useState(null);

  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEntry, setNewEntry] = useState('');
  const [view, setView] = useState('journal');
  const [filter, setFilter] = useState(null);
  const [darkMode, setDarkMode] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

  const { subscription, loading: subLoading, subscribe, manageSubscription } = useSubscription(user);
  const { data, loading: dataLoading, loadData, addEntry, toggleHighlight, deleteItem, updateIdeaStatus, reset } = useJournal(user, cryptoKey);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const metaRef = doc(db, 'users', user.uid);
        const metaSnap = await getDoc(metaRef);
        if (metaSnap.exists()) {
          setUserSalt(base64ToUint8(metaSnap.data().salt));
          setIsNewUser(false);
        } else {
          setIsNewUser(true);
        }
        setNeedsPassphrase(true);
      } else {
        setCryptoKey(null);
        setNeedsPassphrase(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePassphrase = async (passphrase) => {
    if (isNewUser) {
      const salt = generateSalt();
      const hash = await hashPassphrase(passphrase, salt);
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);

      await setDoc(doc(db, 'users', user.uid), {
        salt: uint8ToBase64(salt),
        passphraseHash: hash,
        createdAt: new Date().toISOString(),
        subscription: { status: 'trialing', trialEndsAt: trialEndsAt.toISOString() }
      });

      const key = await deriveKey(passphrase, salt);
      setCryptoKey(key);
      setNeedsPassphrase(false);
    } else {
      const metaRef = doc(db, 'users', user.uid);
      const metaSnap = await getDoc(metaRef);
      const storedHash = metaSnap.data().passphraseHash;
      const hash = await hashPassphrase(passphrase, userSalt);

      if (hash !== storedHash) throw new Error('incorrect passphrase');

      const key = await deriveKey(passphrase, userSalt);
      setCryptoKey(key);
      setNeedsPassphrase(false);
      await loadData(key);
    }
  };

  const handleSignOut = async () => { await signOut(auth); reset(); setCryptoKey(null); };
  const handleAddEntry = () => { if (addEntry(view, currentDate, newEntry)) setNewEntry(''); };
  const changeDate = (days) => { const d = new Date(currentDate); d.setDate(d.getDate() + days); setCurrentDate(d.toISOString().split('T')[0]); };

  const formatDate = useCallback((dateStr) => {
    const date = new Date(dateStr + 'T12:00:00');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dateStr === today) return 'today';
    if (dateStr === yesterday) return 'yesterday';
    return date.toLocaleDateString('en', { month: 'short', day: 'numeric' }).toLowerCase();
  }, []);

  const extractItems = useCallback((prefix) => {
    const items = {};
    Object.entries(data.entries).forEach(([date, dayEntries]) => {
      dayEntries.forEach(entry => {
        (entry.text.match(new RegExp(`${prefix}[\\w-]+`, 'g')) || []).forEach(match => {
          if (!items[match]) items[match] = { count: 0, entries: [] };
          items[match].count++;
          items[match].entries.push({ ...entry, date });
        });
      });
    });
    return Object.entries(items).sort((a, b) => b[1].count - a[1].count);
  }, [data.entries]);

  const renderText = useCallback((text) => {
    return text.split(/(\s+)/).map((word, i) => {
      if (word.startsWith('#')) return <span key={i} className={`${darkMode ? 'text-cyan-400' : 'text-cyan-600'} cursor-pointer hover:underline`} onClick={() => { setFilter(word); setView('tags'); }}>{word}</span>;
      if (word.startsWith('@')) return <span key={i} className={`${darkMode ? 'text-amber-400' : 'text-amber-600'} cursor-pointer hover:underline`} onClick={() => { setFilter(word); setView('people'); }}>{word}</span>;
      return word;
    });
  }, [darkMode]);

  const tags = extractItems('#');
  const people = extractItems('@');

  const bg = darkMode ? 'bg-neutral-950' : 'bg-neutral-50';
  const bgCard = darkMode ? 'bg-neutral-900' : 'bg-white';
  const border = darkMode ? 'border-neutral-800' : 'border-neutral-200';
  const text = darkMode ? 'text-neutral-100' : 'text-neutral-900';
  const textMuted = darkMode ? 'text-neutral-500' : 'text-neutral-400';

  if (authLoading || subLoading) return <div className={`min-h-screen ${bg} flex items-center justify-center`}><div className={`${textMuted} font-mono text-sm`}>loading...</div></div>;
  if (!user) return <AuthScreen darkMode={darkMode} />;
  if (needsPassphrase) return <PassphraseSetup darkMode={darkMode} onComplete={handlePassphrase} isNew={isNewUser} />;
  if (subscription && !subscription.isActive) return <Paywall darkMode={darkMode} subscription={subscription} onSubscribe={subscribe} onLogout={handleSignOut} />;
  if (dataLoading) return <div className={`min-h-screen ${bg} flex items-center justify-center`}><div className={`${textMuted} font-mono text-sm`}>decrypting...</div></div>;

  return (
    <div className={`min-h-screen ${bg} pb-16 transition-colors`}>
      {subscription?.status === 'trialing' && <TrialBanner darkMode={darkMode} daysLeft={subscription.daysLeft} onSubscribe={subscribe} />}

      <header className={`${bgCard} border-b ${border} sticky top-0 z-20`}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className={`text-sm font-mono ${text}`}>micro.log</h1>
              <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${darkMode ? 'bg-green-900 text-green-400' : 'bg-green-100 text-green-700'}`}>e2e</span>
              <SubscriptionBadge darkMode={darkMode} subscription={subscription} onManage={manageSubscription} />
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setDarkMode(!darkMode)} className={`text-xs ${textMuted} font-mono`}>{darkMode ? 'light' : 'dark'}</button>
              <button onClick={handleSignOut} className={`text-xs ${textMuted} hover:text-red-500 font-mono`}>logout</button>
            </div>
          </div>
          <nav className="flex gap-1 mt-4 overflow-x-auto pb-1 -mb-1">
            {modules.map(m => (
              <button key={m.id} onClick={() => { setView(m.id); setFilter(null); }}
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors whitespace-nowrap ${view === m.id ? `${darkMode ? 'bg-neutral-800 text-neutral-100' : 'bg-neutral-900 text-white'}` : textMuted}`}>
                {m.label}
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
    </div>
  );
}
