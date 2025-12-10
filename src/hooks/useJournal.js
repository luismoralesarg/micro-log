import { useState, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { encrypt, decrypt } from '../lib/crypto';

const EMPTY_DATA = { entries: {}, dreams: {}, notes: [], ideas: [], wisdom: [] };

export function useJournal(user, cryptoKey) {
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (key) => {
    if (!user || !key) return;
    setLoading(true);
    try {
      const docRef = doc(db, 'journals', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().encrypted) {
        const decrypted = await decrypt(docSnap.data().encrypted, key);
        setData(decrypted);
      }
    } catch (e) {
      console.error('Error loading data:', e);
    }
    setLoading(false);
  }, [user]);

  const saveData = useCallback(async (newData) => {
    setData(newData);
    if (user && cryptoKey) {
      try {
        const encrypted = await encrypt(newData, cryptoKey);
        await setDoc(doc(db, 'journals', user.uid), {
          encrypted,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {
        console.error('Error saving data:', e);
      }
    }
  }, [user, cryptoKey]);

  const addEntry = useCallback((view, currentDate, text) => {
    if (!text.trim()) return;
    const entry = {
      id: Date.now(),
      text,
      highlight: false,
      time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
    };

    let newData;
    if (view === 'journal') {
      const dayEntries = data.entries[currentDate] || [];
      newData = { ...data, entries: { ...data.entries, [currentDate]: [...dayEntries, entry] } };
    } else if (view === 'dreams') {
      const dayDreams = data.dreams[currentDate] || [];
      newData = { ...data, dreams: { ...data.dreams, [currentDate]: [...dayDreams, entry] } };
    } else if (view === 'notes') {
      newData = { ...data, notes: [...data.notes, entry] };
    } else if (view === 'ideas') {
      newData = { ...data, ideas: [...data.ideas, { ...entry, status: 'new' }] };
    } else if (view === 'wisdom') {
      newData = { ...data, wisdom: [...data.wisdom, entry] };
    }
    
    if (newData) saveData(newData);
    return true;
  }, [data, saveData]);

  const toggleHighlight = useCallback((id, date, type) => {
    if (type === 'entries' || type === 'dreams') {
      const items = data[type][date].map(e => e.id === id ? { ...e, highlight: !e.highlight } : e);
      saveData({ ...data, [type]: { ...data[type], [date]: items } });
    } else {
      const items = data[type].map(e => e.id === id ? { ...e, highlight: !e.highlight } : e);
      saveData({ ...data, [type]: items });
    }
  }, [data, saveData]);

  const deleteItem = useCallback((id, date, type) => {
    if (type === 'entries' || type === 'dreams') {
      const items = data[type][date].filter(e => e.id !== id);
      saveData({ ...data, [type]: { ...data[type], [date]: items } });
    } else {
      saveData({ ...data, [type]: data[type].filter(e => e.id !== id) });
    }
  }, [data, saveData]);

  const updateIdeaStatus = useCallback((id, status) => {
    saveData({ ...data, ideas: data.ideas.map(e => e.id === id ? { ...e, status } : e) });
  }, [data, saveData]);

  const reset = useCallback(() => {
    setData(EMPTY_DATA);
  }, []);

  return { data, loading, loadData, addEntry, toggleHighlight, deleteItem, updateIdeaStatus, reset };
}
