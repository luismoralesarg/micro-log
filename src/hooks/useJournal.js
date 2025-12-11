import { useState, useCallback, useEffect } from 'react';

const EMPTY_DATA = { entries: {}, dreams: {}, notes: [], ideas: [], wisdom: [] };

// Check if running in Electron with filesystem access
const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI?.isElectron;
};

// Storage abstraction for filesystem operations
const fileStorage = {
  async readJSON(path) {
    if (!isElectron()) return null;
    const result = await window.electronAPI.readFile(path);
    if (result.success && result.content) {
      try {
        return JSON.parse(result.content);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        return null;
      }
    }
    return null;
  },

  async writeJSON(path, data) {
    if (!isElectron()) return false;
    const result = await window.electronAPI.writeFile(path, JSON.stringify(data, null, 2));
    return result.success;
  },

  async listFiles(path) {
    if (!isElectron()) return [];
    const result = await window.electronAPI.listFiles(path);
    return result.success ? result.files : [];
  }
};

// Load all data from vault
async function loadAllData() {
  if (!isElectron()) {
    // Fallback to localStorage for web/dev
    const stored = localStorage.getItem('microlog_data');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error loading from localStorage:', e);
      }
    }
    return EMPTY_DATA;
  }

  const data = { entries: {}, dreams: {}, notes: [], ideas: [], wisdom: [] };

  try {
    // Load journal entries
    const journalFiles = await fileStorage.listFiles('journal');
    for (const file of journalFiles) {
      if (file.endsWith('.json')) {
        const date = file.replace('.json', '');
        const entries = await fileStorage.readJSON(`journal/${file}`);
        if (entries) {
          data.entries[date] = entries;
        }
      }
    }

    // Load dreams
    const dreamFiles = await fileStorage.listFiles('dreams');
    for (const file of dreamFiles) {
      if (file.endsWith('.json')) {
        const date = file.replace('.json', '');
        const dreams = await fileStorage.readJSON(`dreams/${file}`);
        if (dreams) {
          data.dreams[date] = dreams;
        }
      }
    }

    // Load notes
    const notes = await fileStorage.readJSON('notes/notes.json');
    if (notes) data.notes = notes;

    // Load ideas
    const ideas = await fileStorage.readJSON('ideas/ideas.json');
    if (ideas) data.ideas = ideas;

    // Load wisdom
    const wisdom = await fileStorage.readJSON('wisdom/wisdom.json');
    if (wisdom) data.wisdom = wisdom;

  } catch (e) {
    console.error('Error loading data:', e);
  }

  return data;
}

// Save specific data type
async function saveDataType(type, date, items) {
  if (!isElectron()) {
    // Fallback for web - handled by saveAll
    return;
  }

  if (type === 'entries') {
    await fileStorage.writeJSON(`journal/${date}.json`, items);
  } else if (type === 'dreams') {
    await fileStorage.writeJSON(`dreams/${date}.json`, items);
  } else if (type === 'notes') {
    await fileStorage.writeJSON('notes/notes.json', items);
  } else if (type === 'ideas') {
    await fileStorage.writeJSON('ideas/ideas.json', items);
  } else if (type === 'wisdom') {
    await fileStorage.writeJSON('wisdom/wisdom.json', items);
  }
}

export function useJournal() {
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadAllData().then(loadedData => {
      setData(loadedData);
      setLoading(false);
    });
  }, []);

  // Save to localStorage for web fallback
  const saveToLocalStorage = useCallback((newData) => {
    if (!isElectron()) {
      try {
        localStorage.setItem('microlog_data', JSON.stringify(newData));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }
  }, []);

  const addEntry = useCallback(async (view, currentDate, text) => {
    if (!text.trim()) return;

    const entry = {
      id: Date.now(),
      text,
      highlight: false,
      time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
    };

    let newData;
    if (view === 'journal') {
      const dayEntries = [...(data.entries[currentDate] || []), entry];
      newData = { ...data, entries: { ...data.entries, [currentDate]: dayEntries } };
      await saveDataType('entries', currentDate, dayEntries);
    } else if (view === 'dreams') {
      const dayDreams = [...(data.dreams[currentDate] || []), entry];
      newData = { ...data, dreams: { ...data.dreams, [currentDate]: dayDreams } };
      await saveDataType('dreams', currentDate, dayDreams);
    } else if (view === 'notes') {
      const notes = [...data.notes, entry];
      newData = { ...data, notes };
      await saveDataType('notes', null, notes);
    } else if (view === 'ideas') {
      const ideas = [...data.ideas, { ...entry, status: 'new' }];
      newData = { ...data, ideas };
      await saveDataType('ideas', null, ideas);
    } else if (view === 'wisdom') {
      const wisdom = [...data.wisdom, entry];
      newData = { ...data, wisdom };
      await saveDataType('wisdom', null, wisdom);
    }

    if (newData) {
      setData(newData);
      saveToLocalStorage(newData);
    }
    return true;
  }, [data, saveToLocalStorage]);

  const toggleHighlight = useCallback(async (id, date, type) => {
    let newData;

    if (type === 'entries' || type === 'dreams') {
      const items = data[type][date].map(e => e.id === id ? { ...e, highlight: !e.highlight } : e);
      newData = { ...data, [type]: { ...data[type], [date]: items } };
      await saveDataType(type, date, items);
    } else {
      const items = data[type].map(e => e.id === id ? { ...e, highlight: !e.highlight } : e);
      newData = { ...data, [type]: items };
      await saveDataType(type, null, items);
    }

    setData(newData);
    saveToLocalStorage(newData);
  }, [data, saveToLocalStorage]);

  const deleteItem = useCallback(async (id, date, type) => {
    let newData;

    if (type === 'entries' || type === 'dreams') {
      const items = data[type][date].filter(e => e.id !== id);
      newData = { ...data, [type]: { ...data[type], [date]: items } };
      await saveDataType(type, date, items);
    } else {
      const items = data[type].filter(e => e.id !== id);
      newData = { ...data, [type]: items };
      await saveDataType(type, null, items);
    }

    setData(newData);
    saveToLocalStorage(newData);
  }, [data, saveToLocalStorage]);

  const updateIdeaStatus = useCallback(async (id, status) => {
    const ideas = data.ideas.map(e => e.id === id ? { ...e, status } : e);
    const newData = { ...data, ideas };

    await saveDataType('ideas', null, ideas);
    setData(newData);
    saveToLocalStorage(newData);
  }, [data, saveToLocalStorage]);

  const reset = useCallback(async () => {
    setData(EMPTY_DATA);
    if (!isElectron()) {
      localStorage.removeItem('microlog_data');
    }
    // Note: For filesystem, we don't delete files on reset - user should do that manually
  }, []);

  // Reload data from filesystem
  const reload = useCallback(async () => {
    setLoading(true);
    const loadedData = await loadAllData();
    setData(loadedData);
    setLoading(false);
  }, []);

  return { data, loading, addEntry, toggleHighlight, deleteItem, updateIdeaStatus, reset, reload };
}
