/* ============================================================
   store.js — localStorage wrapper + song/slide helpers
   ============================================================ */

const Store = (() => {

  const K = {
    songs:    'worship.songs',
    service:  'worship.service',
    settings: 'worship.settings',
  };

  // -------- low-level ----------
  const read = (k, fb) => {
    try {
      const raw = localStorage.getItem(k);
      return raw == null ? fb : JSON.parse(raw);
    } catch (e) { console.warn('read fail', k, e); return fb; }
  };
  const write = (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); }
    catch (e) { console.warn('write fail', k, e); }
  };

  const newId = (pre = 'id') =>
    `${pre}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  // -------- songs ----------
  let songs = read(K.songs, []);
  const saveSongs = () => write(K.songs, songs);

  // -------- style presets ----------
  const THEMES = {
    classic: { bgColor: '#000000', textColor: '#ffffff', fontFamily: 'system',  fontSize: 100, align: 'center' },
    chapel:  { bgColor: '#0b1530', textColor: '#f3c867', fontFamily: 'serif',   fontSize: 100, align: 'center' },
    paper:   { bgColor: '#f5efe2', textColor: '#2a1e10', fontFamily: 'serif',   fontSize: 100, align: 'center' },
    minimal: { bgColor: '#ffffff', textColor: '#1a1a1a', fontFamily: 'system',  fontSize: 100, align: 'center' },
  };

  const defaultStyle = (themeName = 'classic') => ({
    theme: themeName,
    bgImage: '',
    motion: 'none', // 'none' | 'kenburns' | 'drift' | 'bokeh' | 'rays' | 'glow'
    ...THEMES[themeName] || THEMES.classic,
  });

  const newSong = (partial = {}) => ({
    id: newId('song'),
    title: partial.title || 'Untitled Song',
    author: partial.author || '',
    ccli: partial.ccli || '',
    songKey: partial.songKey || '',
    tempo: partial.tempo || '',
    category: partial.category || 'worship',  // 'worship' | 'hymnal'
    language: partial.language || 'en',        // 'en' | 'tl'
    style: partial.style || defaultStyle(),
    sections: partial.sections && partial.sections.length
      ? partial.sections
      : [
          { id: newId('sec'), label: 'Verse 1', text: '' },
          { id: newId('sec'), label: 'Chorus',  text: '' },
        ],
    createdAt: Date.now(),
  });

  const getSongs = () => songs.slice();
  const getSong  = (id) => songs.find(s => s.id === id) || null;

  const saveSong = (song) => {
    // Drafts (new-song editor state before the operator clicks Save) are
    // kept in memory by the app layer and must not land in the library.
    if (!song || song._isDraft) return;
    const i = songs.findIndex(s => s.id === song.id);
    if (i >= 0) songs[i] = song;
    else songs.unshift(song);
    saveSongs();
  };

  const deleteSong = (id) => {
    songs = songs.filter(s => s.id !== id);
    saveSongs();
  };

  // Merge on import — by ID; imported songs win.
  const mergeSongs = (incoming) => {
    if (!Array.isArray(incoming)) return 0;
    let n = 0;
    for (const s of incoming) {
      if (!s || !s.id) continue;
      const i = songs.findIndex(x => x.id === s.id);
      if (i >= 0) songs[i] = s;
      else { songs.unshift(s); n++; }
    }
    saveSongs();
    return n;
  };

  // -------- song -> slides ----------
  // Each section is first split on blank lines (operator-placed breaks),
  // then any chunk longer than MAX_LINES_PER_SLIDE is auto-split into
  // smaller slides so the projector never shows an unreadable wall of text.
  // 2 lines per slide — spacious, easy for the congregation to read.
  const MAX_LINES_PER_SLIDE = 2;
  const songToSlides = (song) => {
    const style = song.style || defaultStyle();
    const slides = [];
    const push = (label, text) => slides.push({
      id: newId('sl'),
      kind: 'song',
      label: label || 'Verse',
      text,
      style,
    });

    for (const sec of song.sections) {
      const chunks = (sec.text || '')
        .replace(/\r/g, '')
        .split(/\n\s*\n/)
        .map(s => s.trim())
        .filter(Boolean);
      if (chunks.length === 0) continue;
      for (const chunk of chunks) {
        const lines = chunk.split('\n');
        if (lines.length <= MAX_LINES_PER_SLIDE) {
          push(sec.label, chunk);
        } else {
          for (let i = 0; i < lines.length; i += MAX_LINES_PER_SLIDE) {
            push(sec.label, lines.slice(i, i + MAX_LINES_PER_SLIDE).join('\n'));
          }
        }
      }
    }
    if (slides.length === 0) {
      slides.push({ id: newId('sl'), kind: 'song', label: 'Title', text: song.title || '', style });
    }
    return slides;
  };

  // -------- service / schedule ----------
  let service = read(K.service, []);
  const saveService = () => write(K.service, service);

  const getSchedule = () => service.slice();
  const setSchedule = (list) => { service = list.slice(); saveService(); };
  const addToSchedule = (item) => { service.push(item); saveService(); };
  const removeScheduleAt = (idx) => { service.splice(idx, 1); saveService(); };
  const moveSchedule = (from, to) => {
    if (from === to || from < 0 || to < 0 || from >= service.length || to >= service.length) return;
    const [m] = service.splice(from, 1);
    service.splice(to, 0, m);
    saveService();
  };
  const clearSchedule = () => { service = []; saveService(); };

  // -------- settings ----------
  let settings = read(K.settings, { translation: 'web', lastBook: 'John', lastChapter: 3 });
  const saveSettings = () => write(K.settings, settings);
  const getSettings  = () => ({ ...settings });
  const setSetting   = (k, v) => { settings[k] = v; saveSettings(); };

  // -------- export / import ----------
  const exportAll = () => ({
    kind: 'ez-worship.v1',
    exportedAt: new Date().toISOString(),
    songs: songs.slice(),
    schedule: service.slice(),
    settings: { ...settings },
  });

  const importAll = (payload) => {
    if (!payload || typeof payload !== 'object') throw new Error('Not a JSON object');
    if (payload.songs)    mergeSongs(payload.songs);
    if (Array.isArray(payload.schedule)) setSchedule(payload.schedule);
    if (payload.settings && typeof payload.settings === 'object') {
      settings = { ...settings, ...payload.settings };
      saveSettings();
    }
  };

  return {
    newId, newSong,
    getSongs, getSong, saveSong, deleteSong, mergeSongs,
    songToSlides,
    THEMES, defaultStyle,
    getSchedule, setSchedule, addToSchedule, removeScheduleAt, moveSchedule, clearSchedule,
    getSettings, setSetting,
    exportAll, importAll,
  };
})();
